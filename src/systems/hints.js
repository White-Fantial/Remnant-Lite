// Hints — contextual hint system that surfaces subtle guidance when a player
// appears stuck (idle too long, too many restarts, no Remnant usage).
//
// Design goals:
//  • hints are shown at most once per trigger condition per level load
//  • a per-level cooldown prevents spam if the trigger stays true
//  • hints do NOT restart when the player restarts the same level — only
//    when they progress to a new one (caller resets via resetHints())

// ---------------------------------------------------------------------------
// Per-level hint configurations
// ---------------------------------------------------------------------------

/**
 * @typedef {{ text: string, triggerTime: number, triggerRestarts: number }} HintConfig
 */

/**
 * One hint config per level (index-matched to levels array).
 *
 * triggerTime     — seconds elapsed in the level before showing the hint
 *                   (only fires when remnantCount === 0 for that level).
 * triggerRestarts — number of restarts on this level before showing the hint
 *                   (independent of remnantCount).
 *
 * @type {HintConfig[]}
 */
const LEVEL_HINTS = [
  // Level 1: Echo on the Switch — hint intentionally avoids revealing the level name
  {
    text:            'Try leaving a Remnant (R) and watch it.',
    triggerTime:     20,
    triggerRestarts: 2,
  },
  // Level 2: Past Self, Open the Way
  {
    text:            'Your past self can stay on the button.',
    triggerTime:     25,
    triggerRestarts: 2,
  },
  // Level 3: Solid at the End
  {
    text:            'The end of the replay is important.',
    triggerTime:     30,
    triggerRestarts: 3,
  },
];

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** Whether the hint for the current level has already been shown. */
let _hintShown = false;

/**
 * Cooldown in seconds before a subsequent hint may be shown.
 * Prevents the same hint from repeating too frequently.
 */
let _cooldown = 0;

/** Seconds to wait before the hint may be shown again after each display. */
const HINT_COOLDOWN_SECONDS = 40;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reset hint state when moving to a new level.
 * Call this from loadLevel() when switching to a different level index.
 */
export function resetHints() {
  _hintShown = false;
  _cooldown  = 0;
}

/**
 * Evaluate whether a hint should be shown this frame and, if so, display it.
 *
 * @param {number}   dt           - Delta time in seconds.
 * @param {object}   metrics      - state.metrics (elapsedTime, restartCount).
 * @param {number}   levelIndex   - Zero-based current level index.
 * @param {number}   remnantCount - Number of active Remnants this level.
 * @param {Function} showMessage  - Function(text, duration) to show a hint overlay.
 */
export function updateHints(dt, metrics, levelIndex, remnantCount, showMessage) {
  // Decay cooldown
  if (_cooldown > 0) {
    _cooldown = Math.max(0, _cooldown - dt);
    return;
  }

  const config = LEVEL_HINTS[levelIndex];
  if (!config) return;

  // Condition A: player has been in the level long enough without using a Remnant
  const stuckOnTime = metrics.elapsedTime >= config.triggerTime && remnantCount === 0;

  // Condition B: player has restarted many times regardless of Remnant usage —
  // the hint may still help even if they've committed a Remnant but are stuck.
  const stuckOnRestarts = metrics.restartCount >= config.triggerRestarts;

  if ((stuckOnTime || stuckOnRestarts) && !_hintShown) {
    showMessage(config.text, 5.0);
    _hintShown = true;
    _cooldown  = HINT_COOLDOWN_SECONDS;
  }
}
