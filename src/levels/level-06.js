// Level 06 — "End Position is Everything"
//
// Teaching goal: the player learns that WHERE they stop during a recording
// determines where the solid Remnant will freeze — and that choosing the
// right ending position is the entire puzzle.
//
// Core idea:
//   A high ledge on the right is completely unreachable from the ground alone.
//   The only solution is to use a solid Remnant as a stepping stone.
//   But the Remnant is only useful if it freezes directly below the ledge edge.
//   The player must deliberately walk to the correct x-position before committing.
//
// Why the high ledge is unreachable without the Remnant:
//   Ground jump apex (player bottom at peak): y ≈ 313
//   High ledge top surface:                   y =  278
//   313 > 278 → player bottom never clears the ledge edge from the ground.
//
// Why the Remnant makes it reachable:
//   Remnant on ground top: y = 372 → player stands at y = 324 (bottom = 372)
//   Jump from Remnant — apex player bottom: y ≈ 265
//   265 < 278 → player clears the ledge edge and lands on top. ✓
//
// Intended solution:
//   Run 1 — Walk RIGHT from spawn toward the high ledge (x ≈ 510–530 area).
//            Stop there and commit Remnant (R).
//   Run 2 — Remnant replays, walking to x ≈ 510–530 and freezing solid.
//            Wait for the solid phase (bright outline).
//            Jump ONTO the Remnant, then jump again to reach the high ledge.
//            Walk to the goal.
//
// What goes wrong if the player commits too early:
//   Remnant freezes too far left → not positioned under the ledge → useless.
//   Player must think: "I need to end my run UNDER the ledge."
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Player spawns far left (x = 80).
//   Open ground floor — no walls or doors.
//   High ledge: x = 520 – 750, top at y = 278.
//   Goal zone floats above the ledge surface.
//   Right boundary wall so the player cannot bypass the ledge from the right.

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
export const level06 = {
  id:   'level_06',
  name: 'End Position is Everything',
  hint: 'Where you stop is where your past self will stand. Choose the ending carefully.',

  playerSpawn: { x: 80, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // High ledge — unreachable from ground alone; requires the solid Remnant boost.
    // Top surface at y = 278, player lands at player.y = 230.
    { x: 520, y: 278, width: 230, height: 20, type: 'platform' },

    // Right boundary wall — prevents reaching the ledge from the right side.
    { x: 750, y: 200, width: 50,  height: 220, type: 'platform' },
  ],

  interactables: [
    // Goal zone — sits just above the high ledge surface so the player
    // overlaps it while standing on the ledge.
    {
      id:     'goal_1',
      type:   'goal',
      x:      535,
      y:      230,
      width:  200,
      height: 48,
    },
  ],
};
