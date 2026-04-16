// Remnant entity — a replayed ghost of a previous player run

import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants.js';

/** Monotonically increasing id counter so each Remnant has a unique id. */
let _nextId = 1;

/**
 * Duration (ms) of the final "solid phase" window at the end of each replay.
 * The Remnant becomes physically solid to the player for the last
 * SOLID_PHASE_DURATION_MS of its timeline, and stays solid once replay ends.
 */
const SOLID_PHASE_DURATION_MS = 1500;

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
 *   id:                  string,
 *   type:                'remnant',
 *   timeline:            Array,
 *   currentTime:         number,
 *   duration:            number,
 *   isPlaying:           boolean,
 *   isFinished:          boolean,
 *   x:                   number,
 *   y:                   number,
 *   facing:              number,
 *   isGrounded:          boolean,
 *   width:               number,
 *   height:              number,
 *   canActivateButtons:  boolean,
 *   isSolidToPlayer:     boolean,
 *   solidPhaseDuration:  number,
 *   solidPhaseStartTime: number,
 * }}
 */
export function createRemnant(timeline) {
  const copy     = timeline.map(s => ({ ...s }));
  const first    = copy.length > 0 ? copy[0] : { x: 0, y: 0, facing: 1, isGrounded: false };
  const duration = copy.length > 0 ? copy[copy.length - 1].time : 0;

  // Solid phase begins this many ms before the end of the timeline.
  // Clamped to 0 so extremely short recordings don't produce negative values.
  const solidPhaseStartTime = Math.max(0, duration - SOLID_PHASE_DURATION_MS);

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
    // canActivateButtons and isSolidToPlayer are intentionally separate flags.
    // The Remnant can press buttons throughout the entire replay; it only
    // becomes physically solid to the player during the final solid phase.
    canActivateButtons:  true,
    isSolidToPlayer:     false,
    solidPhaseDuration:  SOLID_PHASE_DURATION_MS, // ms
    solidPhaseStartTime,                          // ms from start of timeline
  };
}
