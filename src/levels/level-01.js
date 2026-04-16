// Level 01 — "Echo on the Switch"
//
// Teaching goal: the player discovers that a Remnant replays their movement
// and can activate a button — affecting the world after they've moved on.
//
// Intended solution:
//   1. Run to the button in the left half of the room — the door opens.
//   2. Notice the door closes the moment you step off.
//   3. Press R to commit a Remnant, then return to spawn.
//   4. Watch the Remnant replay and stand on the button.
//   5. While the door is open, run through and reach the goal.
//
// Layout (800 × 450, Y increases downward, ground at y = 420):
//   - Player spawns far left (x = 60).
//   - Button on the left-centre floor (x = 240).
//   - Solid wall + door divides the room at x = 430.
//   - Goal zone sits on the right side (x = 590).
//
// The button is close enough to see clearly, and the room is short enough
// that a new player can take in the whole puzzle at once.

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
export const level01 = {
  id:   'level_01',
  name: 'Echo on the Switch',
  hint: 'Leave a Remnant on the switch, then run through the door.',

  playerSpawn: { x: 60, y: 372 },

  bounds: { left: 0, right: 800, top: 0, bottom: 450 },
  deathY: 540,

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Solid wall above the doorway — prevents jumping over
    { x: 430, y: 0,   width: 20,  height: 300, type: 'platform' },
  ],

  interactables: [
    // Floor button — player stands on it to open the door
    {
      id:        'button_1',
      type:      'button',
      x:         240,
      y:         410,
      width:     80,
      height:    10,
      isPressed: false,
      targets:   ['door_1'],
    },

    // Door — closed blocks movement; open allows passage
    {
      id:     'door_1',
      type:   'door',
      x:      430,
      y:      300,
      width:  20,
      height: 120,
      isOpen: false,
    },

    // Goal zone — win condition for this room
    {
      id:     'goal_1',
      type:   'goal',
      x:      590,
      y:      375,
      width:  120,
      height: 45,
    },
  ],
};
