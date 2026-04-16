// main.js — entry point, sets up the game loop

import { init, update, render } from './game.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx = canvas.getContext('2d');

// Initialise game state
init(ctx);

// --- Game loop ---
let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp;
  }

  // Delta time capped at 100 ms to avoid large jumps after tab-switch
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
