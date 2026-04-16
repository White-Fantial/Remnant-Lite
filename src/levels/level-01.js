// Level 01 — basic test room for movement and collision

/**
 * @typedef {{ x: number, y: number, width: number, height: number, type: string }} Platform
 *
 * @typedef {{
 *   playerSpawn: { x: number, y: number },
 *   platforms: Platform[]
 * }} LevelData
 */

/** @type {LevelData} */
export const level01 = {
  // Where the player appears at the start of the level
  playerSpawn: { x: 60, y: 372 }, // rests on the ground floor (420 - 48)

  platforms: [
    // Ground floor — full width
    { x: 0,   y: 420, width: 800, height: 30, type: 'platform' },

    // Left step — first raised platform
    { x: 120, y: 340, width: 130, height: 16, type: 'platform' },

    // Centre platform — mid height, requires a chain jump
    { x: 310, y: 280, width: 130, height: 16, type: 'platform' },

    // Right platform — accessible from the floor or centre
    { x: 570, y: 330, width: 130, height: 16, type: 'platform' },

    // Wall obstacle — separates the centre and right areas
    { x: 490, y: 350, width: 20,  height: 70, type: 'platform' },
  ],
};
