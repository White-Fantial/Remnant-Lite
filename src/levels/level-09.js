// Level 09 — "Self-Interference"
//
// Teaching goal: a Remnant's solid phase can block the player — past selves
//                are tools AND obstacles.
//
// Core idea:
//   A low-ceiling corridor runs from the open left area to the goal area.
//   The only button that opens the final door sits inside this corridor.
//   If the player commits a Remnant while standing on the button, the Remnant
//   freezes solid in the middle of the passage, blocking the player's path to
//   the goal.
//
//   The player must ensure the Remnant presses the button AND ends its timeline
//   OUTSIDE the blocking zone — either by continuing past the button to the
//   right exit before committing, or by backing out to the left before
//   committing.
//
// Corridor physics:
//   Ceiling platform bottom: y = 372.
//   Ground top:              y = 420.
//   Vertical gap:            48 px — exactly player/Remnant height.
//   Because the Remnant (48 × 32) occupies the same gap the player must walk
//   through, a Remnant frozen in the corridor blocks horizontal passage.
//   The low ceiling also prevents jumping inside the corridor.
//
// Intended two-run solution:
//   Run 1 — Walk into corridor, step on Button A (door opens — observe this!).
//            Continue walking RIGHT through the corridor to exit (x > 600).
//            Commit Remnant 1 from the right open area.
//   Run 2 — Remnant 1 replays: enters corridor, presses Button A, exits right.
//            Door A is open while Remnant presses Button A.
//            Player walks through corridor (Remnant is already on the right
//            side, not blocking) → through open Door A → reaches the goal.
//
//   Alternative correct solution:
//   Run 1 — Walk into corridor, press Button A, walk BACK LEFT out of the
//            corridor (x < 280) before committing.
//   Run 2 — Same principle; Remnant exits left, player can walk right freely.
//
// Failure mode (the lesson):
//   Run 1 — Walk to Button A, stand on it, commit immediately.
//            Remnant freezes solid at the button position (centre of corridor).
//   Run 2 — Door A opens, but the solid Remnant blocks the corridor.
//            Player is trapped on the left — cannot reach the goal.
//   Insight: "I blocked my own path. I must plan where I stop."
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   Left open area  (x 0   – 280): Spawn; no ceiling.
//   Narrow corridor (x 280 – 600): Low ceiling at y = 372; Button A inside.
//   Right open area (x 600 – 800): Door A + goal zone; no ceiling.

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
export const level09 = {
  id:   'level_09',
  name: 'Self-Interference',
  hint: 'Your past self can open the door — but it can also block the way. Think about where you stop.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30,  type: 'platform' },

    // Corridor ceiling — spans the narrow section.
    // Top at y = 300, height = 72 → bottom at y = 372.
    // Creates a 48 px vertical gap (exactly one player/Remnant height).
    { x: 280, y: 300, width: 320, height: 72,  type: 'platform' },

    // Solid wall above Door A (prevents jumping over in the open right area)
    { x: 660, y:   0, width:  20, height: 300, type: 'platform' },
  ],

  interactables: [
    // Button A — inside the corridor; opens Door A on the right
    {
      id:        'button_a',
      type:      'button',
      x:         370,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_a'],
    },

    // Door A — in the right open area; leads to the goal
    {
      id:     'door_a',
      type:   'door',
      x:      660,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — behind Door A
    {
      id:     'goal_1',
      type:   'goal',
      x:      700,
      y:      375,
      width:  80,
      height: 45,
    },
  ],
};
