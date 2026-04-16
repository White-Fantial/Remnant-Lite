// Replay system — advances Remnant playback and interpolates timeline samples

/**
 * Sample the timeline at time t using linear interpolation between the two
 * nearest samples.  Returns a boundary snapshot when t is out of range.
 *
 * @param {Array<{ time: number, x: number, y: number, facing: number, isGrounded: boolean }>} timeline
 * @param {number} t - Playback time in milliseconds.
 * @returns {{ x: number, y: number, facing: number, isGrounded: boolean }}
 */
function sampleTimeline(timeline, t) {
  if (timeline.length === 0) return { x: 0, y: 0, facing: 1, isGrounded: false };
  if (t <= timeline[0].time) return timeline[0];

  const last = timeline[timeline.length - 1];
  if (t >= last.time) return last;

  // Binary search for the surrounding pair
  let lo = 0;
  let hi = timeline.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].time <= t) lo = mid;
    else hi = mid;
  }

  const a    = timeline[lo];
  const b    = timeline[hi];
  const span = b.time - a.time;
  const alpha = span > 0 ? (t - a.time) / span : 0;

  return {
    x:          a.x + (b.x - a.x) * alpha,
    y:          a.y + (b.y - a.y) * alpha,
    // Discrete properties snap at the midpoint of the interval
    facing:     alpha < 0.5 ? a.facing     : b.facing,
    isGrounded: alpha < 0.5 ? a.isGrounded : b.isGrounded,
  };
}

/**
 * Advance a Remnant's playback time by dt seconds and update its position.
 * When the end of the timeline is reached the Remnant is marked finished and
 * frozen at its last frame.
 *
 * @param {{
 *   timeline:    Array,
 *   currentTime: number,
 *   duration:    number,
 *   isPlaying:   boolean,
 *   isFinished:  boolean,
 *   x:           number,
 *   y:           number,
 *   facing:      number,
 *   isGrounded:  boolean,
 * }} remnant
 * @param {number} dt - Delta time in seconds.
 */
export function advanceRemnant(remnant, dt) {
  if (!remnant.isPlaying || remnant.isFinished) return;

  // Advance in milliseconds to stay in sync with the recorded timestamps
  remnant.currentTime += dt * 1000;

  if (remnant.currentTime >= remnant.duration) {
    remnant.currentTime = remnant.duration;
    remnant.isPlaying   = false;
    remnant.isFinished  = true;
  }

  const sample     = sampleTimeline(remnant.timeline, remnant.currentTime);
  remnant.x          = sample.x;
  remnant.y          = sample.y;
  remnant.facing     = sample.facing;
  remnant.isGrounded = sample.isGrounded;
}
