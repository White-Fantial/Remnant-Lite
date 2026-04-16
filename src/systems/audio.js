// Audio system — lightweight Web Audio API tones with clean stub structure.
// Each sound is a short synthesized tone; no assets required.
// To silence all audio, set AUDIO_ENABLED = false.

const AUDIO_ENABLED = true;

/** @type {AudioContext|null} */
let _ctx = null;

/**
 * Lazily create (or resume) the shared AudioContext.
 * Returns null if the browser does not support Web Audio.
 * @returns {AudioContext|null}
 */
function getAudioCtx() {
  if (!AUDIO_ENABLED) return null;
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  } catch (_) {
    return null;
  }
}

/**
 * Play a simple synthesized tone.
 *
 * @param {number} frequency - Hz
 * @param {number} duration  - seconds
 * @param {'sine'|'square'|'sawtooth'|'triangle'} [type]
 * @param {number} [gain]    - peak gain (0–1)
 */
function playTone(frequency, duration, type = 'sine', gain = 0.12) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const vol  = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {
    // Silently ignore — audio is non-critical
  }
}

/**
 * Named sound hooks.  Replace the lambda body to swap in a real sound asset.
 * All sounds are fire-and-forget — no cleanup required.
 */
export const Sounds = {
  /** Short click when a button is first pressed. */
  BUTTON_PRESS:    () => playTone(480, 0.07, 'square',   0.10),

  /** Rising blip when a door opens. */
  DOOR_OPEN:       () => playTone(340, 0.10, 'sine',     0.09),

  /** Falling blip when a door closes. */
  DOOR_CLOSE:      () => playTone(210, 0.10, 'sine',     0.09),

  /** Confirm tone when a Remnant is committed. */
  REMNANT_COMMIT:  () => playTone(620, 0.14, 'sine',     0.10),

  /** Low buzz when a run fails. */
  FAIL_RESET:      () => playTone(160, 0.30, 'sawtooth', 0.10),

  /** Bright chime when the goal is reached. */
  GOAL_REACHED:    () => playTone(900, 0.35, 'sine',     0.14),

  /** Soft blip when the oldest Remnant is evicted. */
  REMNANT_REMOVED: () => playTone(220, 0.08, 'square',   0.07),

  /** Short pop when the level restarts via the T key. */
  RESTART:         () => playTone(300, 0.08, 'sine',     0.07),
};
