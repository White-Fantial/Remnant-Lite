// Physics — gravity integration and AABB collision resolution
// Designed to be replaced by Planck.js; keep the public interface stable.

import { GRAVITY } from './constants.js';

/**
 * Returns true when two axis-aligned rectangles overlap (strict).
 *
 * @param {number} ax @param {number} ay @param {number} aw @param {number} ah
 * @param {number} bx @param {number} by @param {number} bw @param {number} bh
 */
function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Apply gravity, move the body, and resolve AABB collisions against a list of
 * static platforms. Horizontal and vertical axes are resolved separately for
 * stability. Returns true when the body is resting on a surface after the move.
 *
 * Replace this function body when Planck.js is integrated.
 *
 * @param {{ x: number, y: number }} position - Top-left corner (mutated).
 * @param {{ x: number, y: number }} velocity - Pixels per second (mutated).
 * @param {number} width  - Body width in pixels.
 * @param {number} height - Body height in pixels.
 * @param {Array<{ x: number, y: number, width: number, height: number }>} platforms
 * @param {number} dt - Delta time in seconds.
 * @returns {boolean} isGrounded
 */
export function resolveMovement(position, velocity, width, height, platforms, dt) {
  // --- Gravity ---
  velocity.y += GRAVITY * dt;

  // --- Horizontal move + resolution ---
  position.x += velocity.x * dt;

  for (const p of platforms) {
    if (aabbOverlap(position.x, position.y, width, height, p.x, p.y, p.width, p.height)) {
      // Determine which side the player penetrated from using overlap depth
      const overlapRight = position.x + width - p.x;   // depth if player came from left
      const overlapLeft  = p.x + p.width - position.x; // depth if player came from right

      if (overlapRight < overlapLeft) {
        position.x = p.x - width; // push out to the left
      } else {
        position.x = p.x + p.width; // push out to the right
      }
      velocity.x = 0;
    }
  }

  // --- Vertical move + resolution ---
  let isGrounded = false;
  position.y += velocity.y * dt;

  for (const p of platforms) {
    if (aabbOverlap(position.x, position.y, width, height, p.x, p.y, p.width, p.height)) {
      if (velocity.y > 0) {
        // Falling — land on top of platform
        position.y = p.y - height;
        velocity.y = 0;
        isGrounded = true;
      } else {
        // Rising — bump head on underside
        position.y = p.y + p.height;
        velocity.y = 0;
      }
    }
  }

  return isGrounded;
}
