// Game core — world state, update logic, render dispatch

import { isKeyDown } from './input.js';
import { resolveMovement, aabbOverlap } from './physics.js';
import {
  clearScreen,
  drawPlatforms,
  drawInteractables,
  drawPlayer,
  drawHUD,
} from './renderer.js';
import {
  CANVAS_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
} from './constants.js';
import { level02 } from './levels/level-02.js';

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

  state.player.position.x = levelData.playerSpawn.x;
  state.player.position.y = levelData.playerSpawn.y;
  state.player.velocity.x = 0;
  state.player.velocity.y = 0;
  state.player.isGrounded = false;
}

// ---------------------------------------------------------------------------
// Subsystem helpers
// ---------------------------------------------------------------------------

/**
 * Build the list of colliders that are blocking movement this frame.
 * Closed doors are included; open doors are excluded.
 *
 * Accepts both player and future Remnant bodies as activators.
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
  return colliders;
}

/**
 * Update button pressed state.
 * Written to accept an array of activators so Remnants can press buttons too.
 *
 * @param {Array<{ position: { x: number, y: number }, width: number, height: number }>} activators
 */
function updateButtons(activators) {
  for (const entity of state.interactables) {
    if (entity.type !== 'button') continue;

    entity.isPressed = activators.some(a =>
      aabbOverlap(
        a.position.x, a.position.y, a.width, a.height,
        entity.x, entity.y, entity.width, entity.height,
      )
    );
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
  loadLevel(level02);
}

/**
 * Update all game logic for one frame.
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  // Buttons must be resolved before doors (doors read button state)
  // and before player movement (blocking colliders depend on door state).
  updateButtons([state.player]);
  updateDoors();
  updatePlayer(dt);
  updateGoal(state.player);
}

/**
 * Render the current frame.
 */
export function render() {
  clearScreen(ctx);
  drawPlatforms(ctx, state.level.platforms);
  drawInteractables(ctx, state.interactables);
  drawPlayer(ctx, state.player.position, state.player.isGrounded);
  drawHUD(ctx, state.level.name, state.goalReached, state.level.hint);
}
