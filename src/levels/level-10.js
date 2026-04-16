// Level 10 — "Full System Mastery"
//
// Teaching goal: combine ALL mechanics — ordering, timing, solid phase,
//                and avoiding self-interference — in a single puzzle.
//
// Core idea:
//   Three rooms; two locked doors; an elevated platform that is unreachable
//   without a solid Remnant as a stepping stone.
//
//   The player must:
//     1. Create Remnant 1 to hold Button A (ordering — must be first).
//     2. Create Remnant 2 positioned BELOW the elevated platform (solid phase
//        awareness + self-interference avoidance: wrong x blocks Door A exit).
//     3. In the final run, climb Remnant 2, jump to the elevated platform,
//        press Button B, and walk through Door B to the goal.
//
// Elevated platform reachability (same maths as Level 07):
//   Ground jump apex (player bottom at peak): y ≈ 313
//   Platform top surface:                     y =  270
//   313 > 270 → cannot reach from ground alone.
//
//   Remnant on ground (y = 372) → player stands at y = 324 (bottom = 372).
//   Jump from Remnant apex — player bottom: y ≈ 265
//   265 < 270 → player clears the platform edge and lands on top. ✓
//
// Self-interference risk (Level 09 lesson applied here):
//   If Remnant 2 is committed too early — at x ≈ 265, right beside the
//   Door A opening — it freezes solid in the doorway and blocks the player
//   from passing through in Run 3.
//   Correct position: x ≈ 330–360, well inside Room 2, below the platform.
//
// Ordering risk (Level 08 lesson applied here):
//   The elevated platform and Button B are inside Room 2, behind Door A.
//   Remnant 1 must be created first; without it Door A stays closed and
//   Room 2 — and Remnant 2's optimal recording position — are unreachable.
//
// Intended three-run solution:
//   Run 1 — Walk to Button A (x ≈ 175); stand on it; commit Remnant 1.
//
//   Run 2 — Remnant 1 holds Button A → Door A is open.
//            Walk through Door A (x = 260–280) into Room 2.
//            Continue to x ≈ 340 — below the left edge of the elevated
//            platform, clear of the Door A opening.
//            Commit Remnant 2 (it will become a solid platform here).
//
//   Run 3 — Remnant 1 → holds Button A; Door A open.
//            Remnant 2 → walks to x ≈ 340; solidifies on the ground.
//            Walk through Door A, wait briefly for Remnant 2 to solidify.
//            Jump ONTO Remnant 2, then jump again RIGHT to land on the
//            elevated platform (y = 270).
//            Walk to Button B (x ≈ 390) → Door B opens.
//            Walk right, through Door B, reach the goal.
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Room 1 (x 0   – 260): Spawn; Button A on the floor.
//   Room 2 (x 260 – 570): Accessed through Door A; elevated platform above.
//                          Button B sits on the elevated platform surface.
//   Room 3 (x 570 – 800): Accessed through Door B; goal zone.

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
export const level10 = {
  id:   'level_10',
  name: 'Full System Mastery',
  hint: 'One ghost holds the door. The other becomes your platform. Sequence, position, and timing must all align.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30,  type: 'platform' },

    // Solid wall above Door A (prevents jumping over)
    { x: 260, y:   0, width:  20, height: 300, type: 'platform' },

    // Elevated platform in Room 2 — unreachable from ground alone.
    // Top surface at y = 270; Button B sits on its surface.
    // Reachable only by jumping from a solid Remnant on the ground below.
    { x: 330, y: 270, width: 180, height: 20,  type: 'platform' },

    // Solid wall above Door B (prevents jumping over)
    { x: 570, y:   0, width:  20, height: 300, type: 'platform' },
  ],

  interactables: [
    // Button A — in Room 1; holds Door A open while pressed
    {
      id:        'button_a',
      type:      'button',
      x:         140,
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
      x:      260,
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
      x:         370,
      y:         260,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_b'],
    },

    // Door B — divides Room 2 and Room 3
    {
      id:     'door_b',
      type:   'door',
      x:      570,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — in Room 3
    {
      id:     'goal_1',
      type:   'goal',
      x:      610,
      y:      375,
      width:  170,
      height: 45,
    },
  ],
};
