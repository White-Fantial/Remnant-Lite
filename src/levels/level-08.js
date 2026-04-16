// Level 08 — "Order Matters"
//
// Teaching goal: the ORDER in which Remnants are created matters.
//
// Core idea:
//   Button B lies behind Door A.  The player cannot reach Button B without
//   first having a Remnant hold Door A open.  This means Remnant 1 *must*
//   be created for Button A before Remnant 2 can ever be created for Button B.
//   In the final run both doors are open simultaneously thanks to the correct
//   creation sequence.
//
//   Wrong order attempt: try to reach Button B without Remnant 1 active →
//   Door A is closed → Button B is unreachable.
//   The player immediately understands: "I have to record A first."
//
// Intended three-run solution:
//   Run 1 — Walk right to Button A (x ≈ 190); stand on it; commit Remnant 1.
//   Run 2 — Remnant 1 holds Button A → Door A is open.
//            Walk through Door A into Room 2.
//            Walk to Button B (x ≈ 440); stand on it; commit Remnant 2.
//   Run 3 — Remnant 1 → holds Button A; Door A stays open.
//            Remnant 2 → walks through Door A → stands on Button B;
//            Door B opens.
//            Player walks through Door A then Door B and reaches the goal.
//
// Why this is harder than Level 04 ("Two Places at Once"):
//   In Level 04 both buttons are reachable from the start.  Here, Room 2 and
//   Button B are completely inaccessible until Remnant 1 is in place.  The
//   player must plan the recording sequence before they even see Button B.
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Room 1 (x 0 – 310):   Spawn; Button A on the floor.
//   Room 2 (x 310 – 580): Accessed through Door A; Button B on the floor.
//   Room 3 (x 580 – 800): Accessed through Door B; goal zone.

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
export const level08 = {
  id:   'level_08',
  name: 'Order Matters',
  hint: "It's not just what you do… it's when and in what order.",

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30,  type: 'platform' },

    // Solid wall above Door A (prevents jumping over)
    { x: 310,  y: 0,   width: 20,  height: 300, type: 'platform' },

    // Solid wall above Door B (prevents jumping over)
    { x: 580,  y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Button A — in Room 1; holds Door A open while pressed
    {
      id:        'button_a',
      type:      'button',
      x:         160,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_a'],
    },

    // Door A — divides Room 1 and Room 2
    {
      id:     'door_a',
      type:   'door',
      x:      310,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Button B — in Room 2; only reachable through Door A
    {
      id:        'button_b',
      type:      'button',
      x:         420,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_b'],
    },

    // Door B — divides Room 2 and Room 3
    {
      id:     'door_b',
      type:   'door',
      x:      580,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — in Room 3
    {
      id:     'goal_1',
      type:   'goal',
      x:      620,
      y:      375,
      width:  160,
      height: 45,
    },
  ],
};
