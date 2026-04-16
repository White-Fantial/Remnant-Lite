// Level 02 — Remnant puzzle room: "Past Self, Open the Way"
//
// Core fantasy: the player cannot hold the button AND walk through the door
// at the same time.  The intended solution is:
//   1. Walk onto the floor button — the door opens.
//   2. Press R to commit a Remnant, then return to spawn.
//   3. The Remnant replays and stands on the button, keeping the door open.
//   4. Run through the open door and reach the goal.
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   - Player spawns far left (x = 60).
//   - Button sits on the left-hand ground (x = 160).
//   - A solid wall with a door gap divides the room at x = 420.
//   - Goal zone sits on the right side (x = 660).
//
// The wall above the door (y 0–300) prevents the player from jumping over,
// and the door (y 300–420) blocks horizontal movement when closed.
// The button is close enough to reach easily, but far enough from the door
// that leaving the button immediately closes the door before the player
// can slip through — making the Remnant the only solution.

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
 *   playerSpawn: { x: number, y: number },
 *   platforms: Platform[],
 *   interactables: Interactable[]
 * }} LevelData
 */

/** @type {LevelData} */
export const level02 = {
  id:   'level_02',
  name: 'Past Self, Open the Way',
  hint: 'Leave a Remnant on the button, then run through the door.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Solid wall above the doorway so the player cannot simply jump over;
    // the door itself fills the lower 120 px of this gap.
    { x: 420, y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Floor button — player stands on it to open the door
    {
      id: 'button_1',
      type: 'button',
      x: 160,
      y: 410,
      width: 70,
      height: 10,
      isPressed: false,
      targets: ['door_1'],
    },

    // Door — closed blocks movement; open allows passage
    {
      id: 'door_1',
      type: 'door',
      x: 420,
      y: 300,
      width: 20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — win condition for this room
    {
      id: 'goal_1',
      type: 'goal',
      x: 660,
      y: 375,
      width: 60,
      height: 45,
    },
  ],
};
