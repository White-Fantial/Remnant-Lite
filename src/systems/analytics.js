// Analytics — lightweight in-memory event logger for playtest sessions.
//
// Events are stored in an array; nothing is sent to a server.
// Call exportSessionData() (or press E in-game) to download the full session
// as a JSON file that testers can share for feedback analysis.

/** @type {Array<{ type: string, time: number, [key: string]: any }>} */
const _events = [];

/** Wall-clock timestamp when the session started (ms). */
const _sessionStart = Date.now();

// ---------------------------------------------------------------------------
// Core logging
// ---------------------------------------------------------------------------

/**
 * Record a named event with an optional data payload.
 * The `time` field is automatically set to seconds elapsed since session start.
 *
 * @param {string} type      - Event identifier, e.g. 'level_start'.
 * @param {object} [data={}] - Arbitrary extra fields merged into the event.
 */
export function logEvent(type, data = {}) {
  _events.push({
    type,
    time: parseFloat(((Date.now() - _sessionStart) / 1000).toFixed(2)),
    ...data,
  });
}

/**
 * Return a copy of the full event array.
 * @returns {Array}
 */
export function getEvents() {
  return _events.slice();
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Download the full session data as a JSON file.
 * The download is triggered entirely client-side — no network request is made.
 *
 * @param {object} sessionMetrics - Session-level counters from state.sessionMetrics.
 * @param {object|null} feedback  - Structured feedback responses (may be null).
 */
export function exportSessionData(sessionMetrics, feedback) {
  const payload = {
    sessionDate:    new Date().toISOString(),
    sessionMetrics,
    feedback:       feedback ?? null,
    events:         _events,

    // Success / failure criteria reminders — kept in the export so reviewers
    // have context without needing to open the source.
    //
    // Success signals:
    //   • players understand mechanic without explanation
    //   • players intentionally plan Remnant usage
    //   • players express "aha" moments
    //   • low frustration from controls
    //
    // Failure signals:
    //   • confusion about what Remnant does
    //   • random trial-and-error behaviour
    //   • ignoring Remnant mechanic
    //   • frustration from unclear timing
  };

  try {
    const blob    = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `remnant_playtest_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    // Fallback: print to console if download fails (e.g. file:// origin)
    console.warn('Export download failed — dumping to console instead:', err);
    console.log('=== PLAYTEST SESSION DATA ===');
    console.log(JSON.stringify(payload, null, 2));
  }
}
