// Remnant entity — a replayed ghost of a previous player run

import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants.js';

/** Monotonically increasing id counter so each Remnant has a unique id. */
let _nextId = 1;

/**
 * Create a Remnant entity from a captured, normalized timeline.
 * The timeline is deep-copied so the source buffer is never mutated.
 *
 * @param {Array<{
 *   time:       number,
 *   x:          number,
 *   y:          number,
 *   facing:     number,
 *   isGrounded: boolean,
 * }>} timeline - Normalized timeline (first sample at t = 0).
 *
 * @returns {{
 *   id:                string,
 *   type:              'remnant',
 *   timeline:          Array,
 *   currentTime:       number,
 *   duration:          number,
 *   isPlaying:         boolean,
 *   isFinished:        boolean,
 *   x:                 number,
 *   y:                 number,
 *   facing:            number,
 *   isGrounded:        boolean,
 *   width:             number,
 *   height:            number,
 *   canActivateButtons: boolean,
 *   isSolidToPlayer:   boolean,
 * }}
 */
export function createRemnant(timeline) {
  const copy    = timeline.map(s => ({ ...s }));
  const first   = copy.length > 0 ? copy[0] : { x: 0, y: 0, facing: 1, isGrounded: false };
  const duration = copy.length > 0 ? copy[copy.length - 1].time : 0;

  return {
    id:          `remnant_${_nextId++}`,
    type:        'remnant',
    timeline:    copy,
    currentTime: 0,
    duration,
    isPlaying:   true,
    isFinished:  false,
    x:           first.x,
    y:           first.y,
    facing:      first.facing,
    isGrounded:  first.isGrounded,
    width:       PLAYER_WIDTH,
    height:      PLAYER_HEIGHT,
    // Phase 6: Remnant can press buttons but is not yet physically solid.
    // These two flags are intentionally separate so the solid phase can
    // enable isSolidToPlayer independently in a later phase.
    canActivateButtons: true,
    isSolidToPlayer:    false,
  };
}
