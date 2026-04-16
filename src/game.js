// Game core — world state, update logic, render dispatch

import { isKeyDown } from './input.js';
import { applyPhysics } from './physics.js';
import { clearScreen, drawPlayer } from './renderer.js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
  FLOOR_Y,
} from './constants.js';

/** @type {CanvasRenderingContext2D} */
let ctx;

// Player state
const player = {
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  grounded: false,
};

/**
 * Initialise the game.
 * @param {CanvasRenderingContext2D} context
 */
export function init(context) {
  ctx = context;

  // Start player roughly centred horizontally, sitting on the floor
  player.position.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
  player.position.y = FLOOR_Y - PLAYER_HEIGHT;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.grounded = true;
}

/**
 * Update all game logic.
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  // --- Horizontal movement ---
  player.velocity.x = 0;

  if (isKeyDown('ArrowLeft') || isKeyDown('KeyA')) {
    player.velocity.x = -PLAYER_SPEED;
  }
  if (isKeyDown('ArrowRight') || isKeyDown('KeyD')) {
    player.velocity.x = PLAYER_SPEED;
  }

  // --- Jump ---
  if ((isKeyDown('ArrowUp') || isKeyDown('KeyW') || isKeyDown('Space')) && player.grounded) {
    player.velocity.y = JUMP_VELOCITY;
    player.grounded = false;
  }

  // --- Physics integration (gravity + position) ---
  applyPhysics(player.position, player.velocity, dt);

  // --- Floor collision (temporary — no proper collision system yet) ---
  const floorSurface = FLOOR_Y - PLAYER_HEIGHT;
  if (player.position.y >= floorSurface) {
    player.position.y = floorSurface;
    player.velocity.y = 0;
    player.grounded = true;
  }

  // --- Clamp to canvas horizontal bounds ---
  if (player.position.x < 0) {
    player.position.x = 0;
  }
  if (player.position.x + PLAYER_WIDTH > CANVAS_WIDTH) {
    player.position.x = CANVAS_WIDTH - PLAYER_WIDTH;
  }
}

/**
 * Render the current frame.
 */
export function render() {
  clearScreen(ctx);
  drawPlayer(ctx, player.position, player.grounded);
}
