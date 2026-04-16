// Physics stub — placeholder for future Planck.js integration

import { GRAVITY } from './constants.js';

export { GRAVITY };

/**
 * Apply gravity and integrate velocity into position for a single body.
 * Replace this function body when Planck.js is integrated.
 *
 * @param {{ x: number, y: number }} position - Current position (mutated in-place).
 * @param {{ x: number, y: number }} velocity - Current velocity (mutated in-place).
 * @param {number} dt - Delta time in seconds.
 */
export function applyPhysics(position, velocity, dt) {
  // Gravity
  velocity.y += GRAVITY * dt;

  // Integrate velocity
  position.x += velocity.x * dt;
  position.y += velocity.y * dt;
}
