// Level 07 — "Everything Together"
//
// Teaching goal: the player synthesises all mechanics learned so far:
//   1. Use a Remnant to hold a button open (Levels 01–02).
//   2. Plan the Remnant's END POSITION to use as a platform (Level 03 / 06).
//   3. Chain two Remnants for two simultaneous tasks (Level 04).
//   4. Coordinate with Remnant timing (Level 05).
//
// Layout overview (800 × 450, three rooms):
//   Room 1 (x 0 – 350):    Spawn; Button A on the floor.
//   Room 2 (x 350 – 620):  Accessed through Door A; elevated platform above.
//                           Button B sits on the elevated platform.
//   Room 3 (x 620 – 800):  Accessed through Door B; contains the goal.
//
// Why the elevated platform in Room 2 is unreachable from the ground:
//   Ground jump apex (player bottom at peak): y ≈ 313
//   Platform top surface:                     y =  270
//   313 > 270 → cannot land from ground alone.
//
// Why the solid Remnant makes the platform reachable:
//   Remnant on ground (y = 372) → player stands at y = 324 (bottom = 372)
//   Jump from Remnant apex — player bottom: y ≈ 265
//   265 < 270 → player clears the platform edge and lands on top. ✓
//
// Intended three-run solution:
//   Run 1 — Stand on Button A (x ≈ 210) and commit Remnant (R).
//            Remnant 1 is placed; player resets to spawn.
//
//   Run 2 — Remnant 1 holds Button A → Door A is open.
//            Walk through Door A into Room 2.
//            Walk to x ≈ 395–415 (ground, below the platform edge).
//            Commit Remnant (R). Remnant 2 is placed at that ground position.
//            Player resets to spawn.
//
//   Run 3 — Remnant 1 → holds Button A; Door A remains open.
//            Remnant 2 → walks to x ≈ 410 and eventually freezes SOLID.
//            Walk through Door A, wait for Remnant 2 to solidify.
//            Jump ONTO Remnant 2, then jump RIGHT to land on the elevated platform.
//            Stand on Button B → Door B opens.
//            Jump down, walk through Door B, reach the goal.

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
 *   isPressed?: boolean,
 *   isOpen?: boolean,
 *   targets?: string[]
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
export const level07 = {
  id:   'level_07',
  name: 'Everything Together',
  hint: 'One ghost holds the door. The other becomes your platform. You do the rest.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Solid wall above Door A (prevents jumping over)
    { x: 350, y: 0,   width: 20,  height: 300, type: 'platform' },

    // Elevated platform in Room 2 — unreachable from ground alone.
    // Top surface at y = 270; Button B sits on its surface.
    { x: 430, y: 270, width: 140, height: 20,  type: 'platform' },

    // Solid wall above Door B (prevents jumping over)
    { x: 620, y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Button A — in Room 1; opens Door A
    {
      id:        'button_a',
      type:      'button',
      x:         170,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_a'],
    },

    // Door A — between Room 1 and Room 2
    {
      id:     'door_a',
      type:   'door',
      x:      350,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Button B — on the elevated platform in Room 2; opens Door B.
    // y = 260 so the button surface aligns with the platform top (y = 270 - 10 = 260).
    {
      id:        'button_b',
      type:      'button',
      x:         450,
      y:         260,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_b'],
    },

    // Door B — between Room 2 and Room 3
    {
      id:     'door_b',
      type:   'door',
      x:      620,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — in Room 3
    {
      id:     'goal_1',
      type:   'goal',
      x:      660,
      y:      375,
      width:  110,
      height: 45,
    },
  ],
};
