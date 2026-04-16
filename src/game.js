// Game core — world state, update logic, render dispatch

import { isKeyDown } from './input.js';
import { resolveMovement } from './physics.js';
import { clearScreen, drawPlatforms, drawPlayer } from './renderer.js';
import {
  CANVAS_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
} from './constants.js';
import { level01 } from './levels/level-01.js';

/** @type {CanvasRenderingContext2D} */
let ctx;

/**
 * Structured game state.
 * Kept as a single object to make future Remnant recording straightforward.
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
    playerSpawn: { x: 0, y: 0 },
    platforms:   [],
  },
  entities: {},
};

/**
 * Load level data into state and spawn the player.
 * @param {{ playerSpawn: { x: number, y: number }, platforms: Array }} levelData
 */
function loadLevel(levelData) {
  state.level.playerSpawn = levelData.playerSpawn;
  state.level.platforms   = levelData.platforms;

  state.player.position.x = levelData.playerSpawn.x;
  state.player.position.y = levelData.playerSpawn.y;
  state.player.velocity.x = 0;
  state.player.velocity.y = 0;
  state.player.isGrounded = false;
}

/**
 * Initialise the game.
 * @param {CanvasRenderingContext2D} context
 */
export function init(context) {
  ctx = context;
  loadLevel(level01);
}

/**
 * Update all game logic.
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  const { player, level } = state;

  // --- Horizontal input ---
  player.velocity.x = 0;
  if (isKeyDown('ArrowLeft') || isKeyDown('KeyA'))  player.velocity.x = -PLAYER_SPEED;
  if (isKeyDown('ArrowRight') || isKeyDown('KeyD')) player.velocity.x =  PLAYER_SPEED;

  // --- Jump (grounded only) ---
  if ((isKeyDown('ArrowUp') || isKeyDown('KeyW') || isKeyDown('Space')) && player.isGrounded) {
    player.velocity.y  = JUMP_VELOCITY;
    player.isGrounded  = false;
  }

  // --- Physics + collision resolution ---
  player.isGrounded = resolveMovement(
    player.position,
    player.velocity,
    player.width,
    player.height,
    level.platforms,
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

/**
 * Render the current frame.
 */
export function render() {
  clearScreen(ctx);
  drawPlatforms(ctx, state.level.platforms);
  drawPlayer(ctx, state.player.position, state.player.isGrounded);
}
