// Mobile UI — on-screen touch control overlay
//
// Detects touch capability and shows/hides a control overlay that maps
// pointer events to the shared action layer in input.js.
// Desktop keyboard controls are unaffected.

import { setTouchHold, fireTouchAction } from '../input.js';

// ---------------------------------------------------------------------------
// Touch-device detection
// ---------------------------------------------------------------------------

/**
 * Returns true when the browser reports any touch or pointer capability.
 * Intentionally lenient — a hybrid laptop/tablet should show controls.
 */
function isTouchCapable() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

// ---------------------------------------------------------------------------
// DOM references (resolved after DOMContentLoaded)
// ---------------------------------------------------------------------------

let _controls      = null; // #mobile-controls
let _menuOverlay   = null; // #mc-menu-overlay
let _gameOverlay   = null; // #mc-gameplay
let _gcOverlay     = null; // #mc-gamecomplete-overlay
let _nextLevelBtn  = null; // #mc-nextlevel-btn

// ---------------------------------------------------------------------------
// Pointer-event wiring helpers
// ---------------------------------------------------------------------------

/**
 * Attach hold-action pointer events to a button element.
 * Sets the action true on pointerdown and clears it on release/cancel/leave.
 *
 * @param {HTMLElement} el
 * @param {string} actionName - Key in holdActions: 'moveLeft'|'moveRight'|'jump'
 */
function wireHold(el, actionName) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add('mc-pressed');
    setTouchHold(actionName, true);
  });

  const release = (e) => {
    e.preventDefault();
    el.classList.remove('mc-pressed');
    setTouchHold(actionName, false);
  };

  el.addEventListener('pointerup',     release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave',  release);
}

/**
 * Attach a one-shot action pointer event to a button element.
 * Fires the action once on pointerdown.
 *
 * @param {HTMLElement} el
 * @param {string} actionName - Key in justPressedActions: 'remnant'|'restart'|'nextLevel'|'start'
 */
function wireOneShot(el, actionName) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.classList.add('mc-pressed');
    fireTouchAction(actionName);
  });

  const release = (e) => {
    e.preventDefault();
    el.classList.remove('mc-pressed');
  };

  el.addEventListener('pointerup',     release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave',  release);
}

// ---------------------------------------------------------------------------
// Overlay visibility
// ---------------------------------------------------------------------------

function _showOnly(panel) {
  for (const p of [_menuOverlay, _gameOverlay, _gcOverlay]) {
    if (p) p.classList.toggle('mc-hidden', p !== panel);
  }
}

/**
 * Update the mobile overlay to reflect the current game mode.
 *
 * @param {{ mode: string, levelComplete?: boolean }} detail
 */
function _onModeChange({ mode, levelComplete = false }) {
  if (!_controls) return;

  if (mode === 'menu') {
    _showOnly(_menuOverlay);
  } else if (mode === 'playing') {
    _showOnly(_gameOverlay);
    if (_nextLevelBtn) {
      _nextLevelBtn.classList.toggle('mc-hidden', !levelComplete);
    }
  } else if (mode === 'gameComplete') {
    _showOnly(_gcOverlay);
  }
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Initialise the mobile UI.
 * Resolves DOM refs, wires events, and shows controls on touch devices.
 * Safe to call multiple times (no-op after first call).
 */
export function initMobileUI() {
  _controls     = document.getElementById('mobile-controls');
  _menuOverlay  = document.getElementById('mc-menu-overlay');
  _gameOverlay  = document.getElementById('mc-gameplay');
  _gcOverlay    = document.getElementById('mc-gamecomplete-overlay');
  _nextLevelBtn = document.getElementById('mc-nextlevel-btn');

  if (!_controls) return; // overlay not in DOM (shouldn't happen in production)

  // Only activate on touch-capable devices (can be overridden via URL param)
  const forceShow = new URLSearchParams(window.location.search).has('mobile');
  if (!isTouchCapable() && !forceShow) return;

  _controls.classList.add('mc-active');

  // ── Wire hold actions ─────────────────────────────────────────────────────
  const leftBtn    = document.getElementById('mc-left-btn');
  const rightBtn   = document.getElementById('mc-right-btn');
  const jumpBtn    = document.getElementById('mc-jump-btn');

  if (leftBtn)  wireHold(leftBtn,  'moveLeft');
  if (rightBtn) wireHold(rightBtn, 'moveRight');
  if (jumpBtn)  wireHold(jumpBtn,  'jump');

  // ── Wire one-shot actions ─────────────────────────────────────────────────
  const remnantBtn  = document.getElementById('mc-remnant-btn');
  const restartBtn  = document.getElementById('mc-restart-btn');
  const startBtn    = document.getElementById('mc-start-btn');
  const playAgainBtn = document.getElementById('mc-playagain-btn');
  const nextBtn     = document.getElementById('mc-nextlevel-btn');

  if (remnantBtn)   wireOneShot(remnantBtn,  'remnant');
  if (restartBtn)   wireOneShot(restartBtn,  'restart');
  if (nextBtn)      wireOneShot(nextBtn,     'nextLevel');
  if (startBtn)     wireOneShot(startBtn,    'start');
  if (playAgainBtn) wireOneShot(playAgainBtn, 'start');

  // ── Listen for game mode changes ──────────────────────────────────────────
  window.addEventListener('remnant:modeChange', (e) => {
    _onModeChange(e.detail);
  });

  window.addEventListener('remnant:gameComplete', () => {
    _onModeChange({ mode: 'gameComplete' });
  });

  // ── Prevent scroll/zoom on canvas ────────────────────────────────────────
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove',  (e) => e.preventDefault(), { passive: false });
  }
}
