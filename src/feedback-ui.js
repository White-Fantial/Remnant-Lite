// Feedback UI — manages the playtest feedback overlay.
//
// The overlay is wired to the feedback form in index.html.  Responses are
// saved to game state via submitFeedback() and included in the JSON export.
//
// The overlay can be triggered:
//   • automatically after the tutorial is completed (game mode → gameComplete)
//   • this script polls the game mode each second to detect the transition

import { submitFeedback } from './game.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** @type {Record<string, string>} */
const _answers = { q1: '', q3: '' };

let _overlayShown = false;

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const overlay        = document.getElementById('feedback-overlay');
const btnSubmit      = document.getElementById('fb-submit');
const btnSkip        = document.getElementById('fb-skip');
const txtConfused    = document.getElementById('fb-confused');
const txtFrustration = document.getElementById('fb-frustration');

// ---------------------------------------------------------------------------
// Selection buttons (yes/no + 1-5 scale)
// ---------------------------------------------------------------------------

overlay.querySelectorAll('[data-q]').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = btn.dataset.q;
    // Deselect siblings
    overlay.querySelectorAll(`[data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    _answers[q] = btn.dataset.v;
  });
});

// ---------------------------------------------------------------------------
// Submit / skip
// ---------------------------------------------------------------------------

btnSubmit.addEventListener('click', () => {
  const responses = {
    understoodRemnant: _answers.q1 || null,
    mostConfusing:     txtConfused.value.trim()    || null,
    interestingScale:  _answers.q3 ? parseInt(_answers.q3, 10) : null,
    frustrationNote:   txtFrustration.value.trim() || null,
  };

  submitFeedback(responses);
  hideOverlay();
});

btnSkip.addEventListener('click', () => {
  hideOverlay();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && _overlayShown) {
    hideOverlay();
  }
});

// ---------------------------------------------------------------------------
// Show / hide
// ---------------------------------------------------------------------------

function showOverlay() {
  if (_overlayShown) return;
  _overlayShown = true;
  overlay.classList.add('visible');
}

function hideOverlay() {
  _overlayShown = false;
  overlay.classList.remove('visible');
}

// ---------------------------------------------------------------------------
// Auto-trigger: poll the canvas title bar for game-complete transition.
// This avoids needing a shared event bus — the game module already runs.
// We detect the transition by importing from game.js, but since game.js does
// not export `state` directly, we use a tiny CustomEvent bridge instead.
// ---------------------------------------------------------------------------

/**
 * game.js fires this event when the mode changes to 'gameComplete'.
 * Listen here to trigger the feedback overlay automatically.
 */
window.addEventListener('remnant:gameComplete', () => {
  // Small delay so the player can read the completion screen first
  setTimeout(showOverlay, 3000);
});
