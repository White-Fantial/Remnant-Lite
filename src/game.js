// Game core — world state, update logic, render dispatch

import { isKeyDown, wasKeyJustPressed, clearJustPressed } from './input.js';
import { resolveMovement, aabbOverlap } from './physics.js';
import {
  clearScreen,
  drawPlatforms,
  drawInteractables,
  drawPlayer,
  drawRemnant,
  drawHUD,
} from './renderer.js';
import {
  CANVAS_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
} from './constants.js';
import { level03 } from './levels/level-03.js';
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
 * Kept as a single object to make future Remnant recording straightforward.
 *
 * interactables — array shared by buttons, doors, and goal zones so that
 * future Remnants can activate any of them without extra plumbing.
 */
const state = {
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
    remnant: null, // active replaying Remnant (one at a time)
  },
  remnant: {
    recorder:       null, // Recorder instance — created on level load
    latestTimeline: [],   // Last captured timeline (R key)
  },
};

// ---------------------------------------------------------------------------
// Level loading
// ---------------------------------------------------------------------------

/**
 * Load level data into state and spawn the player.
 * Interactables are shallow-copied so runtime state (isPressed, isOpen)
 * does not bleed back into the level definition.
 *
 * @param {{ name?: string, playerSpawn: { x: number, y: number }, platforms: Array, interactables?: Array }} levelData
 */
function loadLevel(levelData) {
  state.level.name        = levelData.name ?? '';
  state.level.hint        = levelData.hint ?? '';
  state.level.playerSpawn = levelData.playerSpawn;
  state.level.platforms   = levelData.platforms;

  // Copy interactables so mutating isPressed/isOpen is safe
  state.interactables = (levelData.interactables ?? []).map(e => ({ ...e }));
  state.goalReached   = false;

  // Clear the active Remnant so the room starts fresh
  state.entities.remnant = null;

  state.player.position.x = levelData.playerSpawn.x;
  state.player.position.y = levelData.playerSpawn.y;
  state.player.velocity.x = 0;
  state.player.velocity.y = 0;
  state.player.isGrounded = false;

  // Start a fresh recorder for this run
  state.remnant.recorder       = createRecorder();
  state.remnant.latestTimeline = [];
}

// ---------------------------------------------------------------------------
// Subsystem helpers
// ---------------------------------------------------------------------------

/**
 * Build the list of colliders that are blocking movement this frame.
 * Closed doors are included; open doors are excluded.
 * The active Remnant is included when it is in its solid phase.
 *
 * Keeping collider gathering in one place makes it easy to add more
 * conditional colliders in the future (multiple Remnants, timed blocks, etc.).
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
  // Include the active Remnant as a physical collider only during its solid phase.
  // When not solid the player passes straight through.
  const remnant = state.entities.remnant;
  if (remnant && remnant.isSolidToPlayer) {
    colliders.push(remnant);
  }
  return colliders;
}

/**
 * Update button pressed state.
 * Accepts a list of activators so both the live player and the active Remnant
 * can press buttons — no separate code path for each.
 *
 * Each button gains a `pressedBy` array (the ids of current activators)
 * which the HUD and renderer can use to show who triggered it.
 *
 * Activator shape: { id, type, x, y, width, height, canActivateButtons }
 *
 * @param {Array<{ id: string, x: number, y: number, width: number, height: number }>} activators
 */
function updateButtons(activators) {
  for (const entity of state.interactables) {
    if (entity.type !== 'button') continue;

    // Collect ids of all activators currently overlapping this button.
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
  // Collect the set of door IDs that should be open this frame
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
  if (state.goalReached) return; // latch — stay true once reached
  for (const entity of state.interactables) {
    if (entity.type !== 'goal') continue;
    if (
      aabbOverlap(
        player.position.x, player.position.y, player.width, player.height,
        entity.x, entity.y, entity.width, entity.height,
      )
    ) {
      state.goalReached = true;
    }
  }
}

/**
 * Tick the recorder and handle Remnant commit input.
 *
 * Pressing R:
 *  1. captures the current buffered timeline
 *  2. creates a Remnant entity if there are enough samples
 *  3. replaces any existing active Remnant
 *  4. resets the player to the level spawn
 *  5. starts a fresh recorder so the new run records cleanly
 *
 * @param {number} nowMs - Current wall-clock time in milliseconds.
 */
function updateRemnant(nowMs) {
  const { recorder } = state.remnant;
  if (!recorder) return;

  tickRecorder(recorder, state.player, nowMs);

  if (wasKeyJustPressed('KeyR')) {
    const timeline = getCurrentRecording(recorder);
    state.remnant.latestTimeline = timeline;

    if (timeline.length >= MIN_REMNANT_SAMPLES) {
      // Create and store the active Remnant (replaces any previous one)
      state.entities.remnant = createRemnant(timeline);

      // Reset player to spawn so the new run begins cleanly
      state.player.position.x = state.level.playerSpawn.x;
      state.player.position.y = state.level.playerSpawn.y;
      state.player.velocity.x = 0;
      state.player.velocity.y = 0;
      state.player.isGrounded = false;

      // Start a fresh recorder — the replay and recording are now independent
      state.remnant.recorder = createRecorder();

      console.log(
        `Remnant spawned: ${timeline.length} samples, ` +
        `duration ${(state.entities.remnant.duration / 1000).toFixed(2)}s`,
      );
    } else {
      console.log(`Timeline too short to spawn a Remnant (${timeline.length} samples)`);
    }
  }
}

/**
 * Advance the active Remnant's playback each frame.
 * @param {number} dt - Delta time in seconds.
 */
function updateReplay(dt) {
  const { remnant } = state.entities;
  if (!remnant) return;
  advanceRemnant(remnant, dt);
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
  loadLevel(level03);
}

/**
 * Update all game logic for one frame.
 * Order:
 *   1. live player movement
 *   2. recorder tick + Remnant commit (R key)
 *   3. Remnant playback advance
 *   4. gather activators (player + Remnant)
 *   5. update buttons
 *   6. update doors
 *   7. update goal
 *   8. clear one-shot input flags
 *
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  updatePlayer(dt);
  updateRemnant(performance.now());
  updateReplay(dt);

  // Gather all entities that can trigger buttons this frame, then resolve
  // button and door state.  Door logic reads button state, so buttons first.
  const activators = getActivators(state);
  updateButtons(activators);
  updateDoors();
  updateGoal(state.player);

  // Clear one-shot key presses after all systems have read them.
  clearJustPressed();
}

/**
 * Render the current frame.
 */
export function render() {
  const { recorder } = state.remnant;
  const snapshotCount = recorder ? getSnapshotCount(recorder) : 0;
  const activeRemnant = state.entities.remnant;

  clearScreen(ctx);
  drawPlatforms(ctx, state.level.platforms);
  drawInteractables(ctx, state.interactables, activeRemnant);
  drawRemnant(ctx, activeRemnant);
  drawPlayer(ctx, state.player.position, state.player.isGrounded);
  drawHUD(ctx, state.level.name, state.goalReached, state.level.hint, {
    snapshotCount,
    capturedCount:  state.remnant.latestTimeline.length,
    activeRemnant,
    interactables:  state.interactables,
  });
}
