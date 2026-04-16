// Level 04 — "Two Places at Once"
//
// Teaching goal: the player learns that one Remnant is no longer enough —
// they must use two Remnants sequentially to create a chain of cause and effect.
//
// Core idea:
//   Button A controls Door A. Door A leads to Button B.
//   Button B controls Door B. Door B leads to the goal.
//   No single player can stand on both buttons at the same time.
//
// Intended solution:
//   Run 1 — Stand on Button A; commit Remnant (R) while on it.
//   Run 2 — Remnant 1 holds Button A → Door A opens.
//            Walk through Door A, stand on Button B, commit Remnant (R).
//   Run 3 — Remnant 1 → holds Button A (Door A open).
//            Remnant 2 → holds Button B (Door B open).
//            Walk through both open doors and reach the goal.
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Room 1 (x 0 – 380):    Player spawns here; Button A on the floor.
//   Room 2 (x 380 – 650):  Accessible only when Door A is open; Button B here.
//   Room 3 (x 650 – 800):  Accessible only when Door B is open; Goal here.
//
// Why the distances prevent a solo solution:
//   Button A sits at x ≈ 240. Door A sits at x = 380.
//   The moment the player steps off Button A the door closes — they cannot
//   sprint 140 px through a closed gap in time.
//   Same argument applies to Button B (x ≈ 530) → Door B (x = 650).

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
export const level04 = {
  id:   'level_04',
  name: 'Two Places at Once',
  hint: 'You can exist in more than one place… just not at the same time.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Solid wall above Door A (prevents jumping over)
    { x: 380, y: 0,   width: 20,  height: 300, type: 'platform' },

    // Solid wall above Door B (prevents jumping over)
    { x: 650, y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Button A — in Room 1; opens Door A
    {
      id:        'button_a',
      type:      'button',
      x:         200,
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
      x:      380,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Button B — in Room 2; opens Door B
    {
      id:        'button_b',
      type:      'button',
      x:         490,
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
      x:      650,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — in Room 3
    {
      id:     'goal_1',
      type:   'goal',
      x:      690,
      y:      375,
      width:  90,
      height: 45,
    },
  ],
};
