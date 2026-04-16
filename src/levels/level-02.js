// Level 02 — first puzzle room: button, door, goal
//
// Layout intent:
//   The player must stand on the floor button to open the door and walk
//   through. But leaving the button closes the door again — a deliberate
//   hint that a Remnant holding the button will be the real solution later.
//
// Coordinate system: origin top-left, Y increases downward.
// Canvas: 800 × 450.  Ground floor top surface sits at y = 420.
// Player height = 48, so spawn y = 420 - 48 = 372 to rest on the floor.

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
  name: 'Level 2 — The Button Room',
  hint: 'Stand on the button to open the door',

  playerSpawn: { x: 60, y: 372 },

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
