// Level 05 — "Timing Matters"
//
// Teaching goal: the player learns that WHEN the Remnant acts is just as
// important as WHERE it ends up.  The Remnant reaches the button at a
// predictable time determined by the recording — the player must be in
// position at that exact moment.
//
// Core idea:
//   The button is on the far left.  The locked door is on the far right.
//   The player cannot physically be at both ends of the room simultaneously.
//   The Remnant handles the button; the player must dash to the door and be
//   there *when* the Remnant arrives at the button.
//
// Intended solution:
//   Run 1 — Sprint LEFT from spawn to the button.  Stand on it (door opens).
//            Observe that the door is far to the right.  Commit Remnant (R).
//   Run 2 — Remnant replays, heading LEFT toward the button.
//            Player sprints RIGHT toward the door immediately.
//            The Remnant reaches the button at roughly the same time the
//            player reaches the door — the door opens just as the player
//            arrives.  Step through and reach the goal.
//
// Key timing numbers (approximate, PLAYER_SPEED = 280 px/s):
//   Spawn at x = 370.  Button center at x = 100 → distance ≈ 270 px → ~1.0 s.
//   Door at x = 620 → distance from spawn ≈ 250 px → ~0.9 s.
//   The player reaches the door just before the Remnant presses the button —
//   they wait a beat and the door swings open.  Readable, not tight.
//
// The lesson: "I must think about WHEN my ghost does something, not just WHERE."
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Player spawns centre-left (x = 370).
//   Button is on the far left floor (x = 60).
//   Tall wall + door divides the room at x = 620.
//   Goal zone is behind the door on the right (x = 680).

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
export const level05 = {
  id:   'level_05',
  name: 'Timing Matters',
  hint: 'Your past self opens the door at a specific moment. Be at the door when it happens.',

  playerSpawn: { x: 370, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Tall wall above the door — prevents jumping over
    { x: 620, y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Floor button — far left; player stands here to open the far-right door
    {
      id:        'button_1',
      type:      'button',
      x:         60,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_1'],
    },

    // Door — on the far right; only open while button is held
    {
      id:     'door_1',
      type:   'door',
      x:      620,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — behind the door
    {
      id:     'goal_1',
      type:   'goal',
      x:      680,
      y:      375,
      width:  100,
      height: 45,
    },
  ],
};
