// Interaction system — gathers activators each frame for puzzle logic.
//
// An activator is any entity that can trigger buttons or sensors.
// Adding a new activator source (second Remnant, NPC, etc.) only requires
// pushing to the returned array here; button/door logic stays untouched.

/**
 * Activator shape used by the button system:
 *
 * {
 *   id:                string,          // "player" | "remnant_1" | …
 *   type:              string,          // "player" | "remnant"
 *   x:                 number,          // top-left corner
 *   y:                 number,
 *   width:             number,
 *   height:            number,
 *   canActivateButtons: boolean,
 *   isSolidToPlayer:   boolean,         // read by collision pipeline
 * }
 */

/**
 * Build the list of entities that can activate buttons this frame.
 *
 * Rules:
 *  - The live player is always included.
 *  - Each active Remnant is included when its `canActivateButtons` flag is true.
 *    The flag is checked here so future phases can disable it during specific
 *    replay states without touching this function.
 *
 * @param {{
 *   player: { position: { x: number, y: number }, width: number, height: number },
 *   entities: { remnants: object[] },
 * }} state
 * @returns {Array<{
 *   id: string, type: string,
 *   x: number, y: number, width: number, height: number,
 *   canActivateButtons: boolean, isSolidToPlayer: boolean,
 * }>}
 */
export function getActivators(state) {
  const activators = [];

  // Live player — always a potential activator.
  activators.push({
    id:                 'player',
    type:               'player',
    x:                  state.player.position.x,
    y:                  state.player.position.y,
    width:              state.player.width,
    height:             state.player.height,
    canActivateButtons: true,
    isSolidToPlayer:    false,
  });

  // All active Remnants — included only when allowed to activate buttons.
  for (const remnant of state.entities.remnants) {
    if (remnant.canActivateButtons) {
      activators.push(remnant);
    }
  }

  return activators;
}
