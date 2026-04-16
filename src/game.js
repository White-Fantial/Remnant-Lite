// Game core — world state, update logic, render dispatch

import { isKeyDown, wasKeyJustPressed, clearJustPressed } from './input.js';
import { resolveMovement, aabbOverlap } from './physics.js';
import {
  clearScreen,
  drawPlatforms,
  drawInteractables,
  drawPlayer,
  drawRemnants,
  drawHUD,
} from './renderer.js';
import {
  CANVAS_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
} from './constants.js';
import { levels } from './levels/index.js';
import {
  createRecorder,
  tickRecorder,
  getCurrentRecording,
  getSnapshotCount,
} from './systems/recorder.js';
import { createRemnant } from './entities/remnant.js';
import { advanceRemnant } from './systems/replay.js';
import { getActivators } from './systems/interaction.js';

/** Minimum number of timeline samples required to spawn a Remnant. */
const MIN_REMNANT_SAMPLES = 3;

/** @type {CanvasRenderingContext2D} */
let ctx;

/**
 * Structured game state.
 *
 * entities.remnants — ordered array of active Remnants (creation order).
 * rules.maxRemnants — how many Remnants can exist at once; oldest is evicted
 *                     when the limit is exceeded.
 */
const state = {
  currentLevelIndex: 0,
  levelComplete:     false,

  player: {
    position:   { x: 0, y: 0 },
    velocity:   { x: 0, y: 0 },
    isGrounded: false,
    width:      PLAYER_WIDTH,
    height:     PLAYER_HEIGHT,
  },
  level: {
    name:        '',
    hint:        '',
    playerSpawn: { x: 0, y: 0 },
    platforms:   [],
  },
  interactables: [], // buttons, doors, goal zones
  goalReached:   false,

  entities: {
    remnants: [], // active replaying Remnants (up to rules.maxRemnants)
  },
  rules: {
    maxRemnants: 2,
  },

  remnant: {
    recorder:       null, // Recorder instance — created on level load
    latestTimeline: [],   // Last captured timeline (R key)
  },
};

// ---------------------------------------------------------------------------
// Level loading and progression
// ---------------------------------------------------------------------------

/**
 * Load a level by index into state, resetting all level-local data cleanly.
 * Safe to call during gameplay — no page reload required.
 *
 * @param {number} index - Zero-based index into the levels array.
 */
function loadLevel(index) {
  if (index < 0 || index >= levels.length) return;

  const levelData = levels[index];
  state.currentLevelIndex = index;
  state.levelComplete     = false;

  state.level.name        = levelData.name ?? '';
  state.level.hint        = levelData.hint ?? '';
  state.level.playerSpawn = levelData.playerSpawn;
  state.level.platforms   = levelData.platforms;

  // Shallow-copy interactables so mutating isPressed/isOpen is safe
  state.interactables = (levelData.interactables ?? []).map(e => ({ ...e }));
  state.goalReached   = false;

  // Clear all active Remnants so the room starts fresh
  state.entities.remnants = [];

  state.player.position.x = levelData.playerSpawn.x;
  state.player.position.y = levelData.playerSpawn.y;
  state.player.velocity.x = 0;
  state.player.velocity.y = 0;
  state.player.isGrounded = false;

  // Start a fresh recorder for this run
  state.remnant.recorder       = createRecorder();
  state.remnant.latestTimeline = [];
}

/**
 * Restart the current level from scratch.
 * Equivalent to reloading the same level index.
 */
function restartCurrentLevel() {
  loadLevel(state.currentLevelIndex);
}

/**
 * Advance to the next level.
 * If already on the last level, does nothing (completion UI handles this).
 */
function goToNextLevel() {
  const nextIndex = state.currentLevelIndex + 1;
  if (nextIndex < levels.length) {
    loadLevel(nextIndex);
  }
}

// ---------------------------------------------------------------------------
// Subsystem helpers
// ---------------------------------------------------------------------------

/**
 * Build the list of colliders that are blocking movement this frame.
 * Closed doors are included; open doors are excluded.
 * Solid-phase Remnants are included so the player can stand on them.
 *
 * @returns {Array<{ x: number, y: number, width: number, height: number }>}
 */
function getBlockingColliders() {
  const colliders = [...state.level.platforms];

  for (const entity of state.interactables) {
    if (entity.type === 'door' && !entity.isOpen) {
      colliders.push(entity);
    }
  }

  // Each solid-phase Remnant becomes a physical platform for the player.
  for (const remnant of state.entities.remnants) {
    if (remnant.isSolidToPlayer) {
      colliders.push(remnant);
    }
  }

  return colliders;
}

/**
 * Update button pressed state.
 * Accepts a list of activators so both the live player and all active Remnants
 * can press buttons — no separate code path for each.
 *
 * @param {Array<{ id: string, x: number, y: number, width: number, height: number }>} activators
 */
function updateButtons(activators) {
  for (const entity of state.interactables) {
    if (entity.type !== 'button') continue;

    entity.pressedBy = activators
      .filter(a =>
        aabbOverlap(
          a.x, a.y, a.width, a.height,
          entity.x, entity.y, entity.width, entity.height,
        )
      )
      .map(a => a.id);

    entity.isPressed = entity.pressedBy.length > 0;
  }
}

/**
 * Resolve door open/closed state from linked button states.
 * A door is open if at least one button that targets it is pressed.
 */
function updateDoors() {
  const openDoorIds = new Set();
  for (const entity of state.interactables) {
    if (entity.type === 'button' && entity.isPressed && entity.targets) {
      for (const targetId of entity.targets) {
        openDoorIds.add(targetId);
      }
    }
  }

  for (const entity of state.interactables) {
    if (entity.type === 'door') {
      entity.isOpen = openDoorIds.has(entity.id);
    }
  }
}

/**
 * Check whether the player has reached any goal zone.
 * @param {{ position: { x: number, y: number }, width: number, height: number }} player
 */
function updateGoal(player) {
  if (state.goalReached) return; // latch — stays true once reached
  for (const entity of state.interactables) {
    if (entity.type !== 'goal') continue;
    if (
      aabbOverlap(
        player.position.x, player.position.y, player.width, player.height,
        entity.x, entity.y, entity.width, entity.height,
      )
    ) {
      state.goalReached  = true;
      state.levelComplete = true;
    }
  }
}

/**
 * Tick the recorder and handle Remnant commit input (R key).
 *
 * When R is pressed:
 *  1. Capture the current buffered timeline.
 *  2. If there are enough samples, create a new Remnant.
 *  3. If at the Remnant limit, evict the oldest Remnant first (index 0).
 *  4. Push the new Remnant to the end of the array.
 *  5. Reset the player to the level spawn.
 *  6. Start a fresh recorder.
 *
 * @param {number} nowMs - Current wall-clock time in milliseconds.
 */
function updateRemnantRecorder(nowMs) {
  const { recorder } = state.remnant;
  if (!recorder) return;

  tickRecorder(recorder, state.player, nowMs);

  if (wasKeyJustPressed('KeyR')) {
    const timeline = getCurrentRecording(recorder);
    state.remnant.latestTimeline = timeline;

    if (timeline.length >= MIN_REMNANT_SAMPLES) {
      const newRemnant = createRemnant(timeline);

      // Evict oldest Remnant when at limit (FIFO replacement)
      if (state.entities.remnants.length >= state.rules.maxRemnants) {
        const evicted = state.entities.remnants.shift();
        console.log(`Remnant evicted: ${evicted.id}`);
      }

      state.entities.remnants.push(newRemnant);

      // Reset player to spawn so the new run begins cleanly
      state.player.position.x = state.level.playerSpawn.x;
      state.player.position.y = state.level.playerSpawn.y;
      state.player.velocity.x = 0;
      state.player.velocity.y = 0;
      state.player.isGrounded = false;

      // Start a fresh recorder — the replay and recording are now independent
      state.remnant.recorder = createRecorder();

      console.log(
        `Remnant spawned: ${newRemnant.id}, ` +
        `${timeline.length} samples, ` +
        `duration ${(newRemnant.duration / 1000).toFixed(2)}s — ` +
        `active: ${state.entities.remnants.length}/${state.rules.maxRemnants}`,
      );
    } else {
      console.log(`Timeline too short to spawn a Remnant (${timeline.length} samples)`);
    }
  }
}

/**
 * Advance all active Remnants' playback each frame.
 * @param {number} dt - Delta time in seconds.
 */
function updateAllRemnants(dt) {
  for (const remnant of state.entities.remnants) {
    advanceRemnant(remnant, dt);
  }
}

/**
 * Handle player input and movement.
 * @param {number} dt
 */
function updatePlayer(dt) {
  const { player } = state;

  // --- Horizontal input ---
  player.velocity.x = 0;
  if (isKeyDown('ArrowLeft') || isKeyDown('KeyA'))  player.velocity.x = -PLAYER_SPEED;
  if (isKeyDown('ArrowRight') || isKeyDown('KeyD')) player.velocity.x =  PLAYER_SPEED;

  // --- Jump (grounded only) ---
  if (
    (isKeyDown('ArrowUp') || isKeyDown('KeyW') || isKeyDown('Space')) &&
    player.isGrounded
  ) {
    player.velocity.y = JUMP_VELOCITY;
    player.isGrounded = false;
  }

  // --- Physics + collision resolution against platforms and closed doors ---
  player.isGrounded = resolveMovement(
    player.position,
    player.velocity,
    player.width,
    player.height,
    getBlockingColliders(),
    dt,
  );

  // --- Clamp to canvas horizontal bounds ---
  if (player.position.x < 0) {
    player.position.x = 0;
  }
  if (player.position.x + player.width > CANVAS_WIDTH) {
    player.position.x = CANVAS_WIDTH - player.width;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the game.
 * @param {CanvasRenderingContext2D} context
 */
export function init(context) {
  ctx = context;
  loadLevel(0);
}

/**
 * Update all game logic for one frame.
 *
 * Order:
 *  1. level transition / restart inputs
 *  2. player movement
 *  3. recorder tick + Remnant commit (R key)
 *  4. advance all Remnant replays
 *  5. gather activators (player + all Remnants)
 *  6. update buttons
 *  7. update doors
 *  8. update goal / level completion
 *  9. clear one-shot input flags
 *
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  // --- Level control inputs (handled first so restart is always responsive) ---

  if (wasKeyJustPressed('KeyT')) {
    restartCurrentLevel();
    clearJustPressed();
    return;
  }

  if (wasKeyJustPressed('KeyN') && state.levelComplete) {
    if (state.currentLevelIndex + 1 < levels.length) {
      goToNextLevel();
    }
    clearJustPressed();
    return;
  }

  // P = previous level (quick testing convenience)
  if (wasKeyJustPressed('KeyP')) {
    loadLevel(Math.max(0, state.currentLevelIndex - 1));
    clearJustPressed();
    return;
  }

  updatePlayer(dt);
  updateRemnantRecorder(performance.now());
  updateAllRemnants(dt);

  const activators = getActivators(state);
  updateButtons(activators);
  updateDoors();
  updateGoal(state.player);

  clearJustPressed();
}

/**
 * Render the current frame.
 */
export function render() {
  const { recorder } = state.remnant;
  const snapshotCount = recorder ? getSnapshotCount(recorder) : 0;
  const { remnants }  = state.entities;
  const isLastLevel   = state.currentLevelIndex === levels.length - 1;

  clearScreen(ctx);
  drawPlatforms(ctx, state.level.platforms);
  drawInteractables(ctx, state.interactables, remnants);
  drawRemnants(ctx, remnants);
  drawPlayer(ctx, state.player.position, state.player.isGrounded);
  drawHUD(ctx, {
    levelName:     state.level.name,
    levelIndex:    state.currentLevelIndex,
    totalLevels:   levels.length,
    goalReached:   state.goalReached,
    levelComplete: state.levelComplete,
    isLastLevel,
    hint:          state.level.hint,
    snapshotCount,
    capturedCount: state.remnant.latestTimeline.length,
    remnants,
    maxRemnants:   state.rules.maxRemnants,
    interactables: state.interactables,
  });
}
