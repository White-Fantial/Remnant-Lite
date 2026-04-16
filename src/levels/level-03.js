// Level 03 — Solid at the End
//
// Core mechanic: the Remnant becomes physically solid only during the final
// 1.5 seconds of its replay (and stays solid after replay finishes).
//
// Intended solution:
//   1. Walk across the ground toward the high ledge on the right.
//      Stop (or end the run) somewhere below the ledge — that becomes the
//      Remnant's final position during its solid phase.
//   2. Press R to commit.  Player resets to spawn.
//   3. Watch the Remnant replay.  It is intangible at first — the player
//      can walk straight through it.
//   4. Near the end of playback the Remnant turns solid (bright outline,
//      "SOLID" label).  Walk up and jump ONTO the Remnant.
//   5. From the Remnant's top, jump to the high ledge.  Reach the goal.
//
// Why the high ledge is unreachable without the Remnant:
//   - Ground jump apex (player bottom at peak): y ≈ 313  (107 px above ground)
//   - High ledge top surface:                   y =  280  (140 px above ground)
//   - 280 < 313, so the player's bottom never clears the ledge edge — can't land.
//
// Why the Remnant makes it reachable:
//   - Remnant on ground top: y = 372  (player stands at y = 324, bottom = 372)
//   - Jump from there — apex player bottom: y ≈ 265
//   - 265 < 280, so the player clears the ledge edge and lands on top. ✓
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   - Player spawns far left (x = 80).
//   - Ground floor: full width.
//   - High ledge: x = 530 – 760, top at y = 280.
//   - Goal zone floats just above the ledge surface.
//   - Left boundary wall keeps the player from falling off-screen.

/**
 * @typedef {{ x: number, y: number, width: number, height: number, type: string }} Platform
 *
 * @typedef {{
 *   id: string,
 *   type: 'button' | 'door' | 'goal',
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 * }} Interactable
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   hint: string,
 *   playerSpawn: { x: number, y: number },
 *   platforms: Platform[],
 *   interactables: Interactable[]
 * }} LevelData
 */

/** @type {LevelData} */
export const level03 = {
  id:   'level_03',
  name: 'Solid at the End',
  hint: 'End your run under the ledge. When your past self solidifies, jump on it.',

  playerSpawn: { x: 80, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // High ledge — unreachable from ground alone; requires the solid Remnant boost.
    // Top surface at y = 280, player lands at player.y = 232.
    { x: 530, y: 280, width: 230, height: 20, type: 'platform' },

    // Right boundary wall so the player cannot reach the ledge from above or the right.
    { x: 760, y: 200, width: 40,  height: 220, type: 'platform' },
  ],

  interactables: [
    // Goal zone — sits just above the high ledge surface so the player
    // overlaps it while standing on the ledge.
    {
      id:     'goal_1',
      type:   'goal',
      x:      545,
      y:      232,
      width:  195,
      height: 48,
    },
  ],
};
