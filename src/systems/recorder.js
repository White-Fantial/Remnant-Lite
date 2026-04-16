// Recorder — samples player state at a fixed interval and maintains a rolling buffer.

import { RECORDER_INTERVAL_MS, RECORDER_BUFFER_SECONDS } from '../constants.js';

/**
 * A single recorded snapshot of the player's state.
 * @typedef {{
 *   time:        number,
 *   x:           number,
 *   y:           number,
 *   vx:          number,
 *   vy:          number,
 *   facing:      number,
 *   isGrounded:  boolean,
 * }} Snapshot
 */

/**
 * Create a new recorder instance.
 *
 * @returns {{
 *   _buffer:     Snapshot[],
 *   _nextSample: number,
 * }}
 */
export function createRecorder() {
  return {
    _buffer:     [],
    _nextSample: 0, // timestamp (ms) of the next scheduled sample
  };
}

/**
 * Derive the player's facing direction from their horizontal velocity.
 * Returns 1 (right) or -1 (left). Defaults to 1 when stationary.
 *
 * @param {number} vx
 * @returns {number}
 */
function facingFromVelocity(vx) {
  return vx < 0 ? -1 : 1;
}

/**
 * Tick the recorder for the current frame.
 * Samples the player state if the fixed interval has elapsed,
 * then trims the buffer to the configured rolling window.
 *
 * @param {{ _buffer: Snapshot[], _nextSample: number }} recorder
 * @param {{ position: { x: number, y: number }, velocity: { x: number, y: number }, isGrounded: boolean }} player
 * @param {number} nowMs - Current timestamp in milliseconds (e.g. performance.now()).
 */
export function tickRecorder(recorder, player, nowMs) {
  // First tick: initialise the sample clock to avoid a huge first interval.
  if (recorder._nextSample === 0) {
    recorder._nextSample = nowMs;
  }

  // Collect as many fixed-interval samples as have elapsed this frame.
  while (nowMs >= recorder._nextSample) {
    /** @type {Snapshot} */
    const snapshot = {
      time:       recorder._nextSample,
      x:          player.position.x,
      y:          player.position.y,
      vx:         player.velocity.x,
      vy:         player.velocity.y,
      facing:     facingFromVelocity(player.velocity.x),
      isGrounded: player.isGrounded,
    };
    recorder._buffer.push(snapshot);
    recorder._nextSample += RECORDER_INTERVAL_MS;
  }

  // Trim old samples that fall outside the rolling window.
  const cutoffMs = nowMs - RECORDER_BUFFER_SECONDS * 1000;
  const trimTo = recorder._buffer.findIndex(s => s.time >= cutoffMs);
  if (trimTo > 0) {
    recorder._buffer.splice(0, trimTo);
  } else if (trimTo === -1) {
    // Every snapshot is older than the window — clear the buffer.
    recorder._buffer.length = 0;
  }
}

/**
 * Return a safe, independent copy of the current buffered timeline.
 * Time values are normalized so the first snapshot starts at t = 0.
 * Intended to be called when committing a Remnant.
 *
 * @param {{ _buffer: Snapshot[] }} recorder
 * @returns {Snapshot[]}
 */
export function getCurrentRecording(recorder) {
  if (recorder._buffer.length === 0) return [];
  const origin = recorder._buffer[0].time;
  return recorder._buffer.map(s => ({ ...s, time: s.time - origin }));
}

/**
 * Return the number of snapshots currently in the buffer.
 * @param {{ _buffer: Snapshot[] }} recorder
 * @returns {number}
 */
export function getSnapshotCount(recorder) {
  return recorder._buffer.length;
}

/**
 * Return the total duration (in seconds) currently held in the buffer.
 * @param {{ _buffer: Snapshot[] }} recorder
 * @returns {number}
 */
export function getBufferedSeconds(recorder) {
  if (recorder._buffer.length < 2) return 0;
  const first = recorder._buffer[0].time;
  const last  = recorder._buffer[recorder._buffer.length - 1].time;
  return (last - first) / 1000;
}
