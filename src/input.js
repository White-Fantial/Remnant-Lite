// Input system — unified action layer for keyboard and touch controls

// ---------------------------------------------------------------------------
// Raw keyboard state
// ---------------------------------------------------------------------------

const keys = {};
const justPressedKeys = new Set();

window.addEventListener('keydown', (e) => {
  if (!keys[e.code]) {
    justPressedKeys.add(e.code);
    _onKeyJustPressed(e.code);
  }
  keys[e.code] = true;
  _syncHoldActions();
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  _syncHoldActions();
});

// ---------------------------------------------------------------------------
// Unified action state
// ---------------------------------------------------------------------------

/**
 * Hold actions — true while the key/button is actively held (keyboard or touch).
 * @type {{ moveLeft: boolean, moveRight: boolean, jump: boolean }}
 */
const holdActions = {
  moveLeft:  false,
  moveRight: false,
  jump:      false,
};

/**
 * One-shot action names that fired this frame (keyboard or touch).
 * Cleared by {@link clearJustPressed} at end of each frame.
 */
const justPressedActions = new Set();

// ---------------------------------------------------------------------------
// Touch hold state (merged with keyboard in holdActions)
// ---------------------------------------------------------------------------

const _touchHold = {
  moveLeft:  false,
  moveRight: false,
  jump:      false,
};

/** Recompute merged hold actions from current keyboard + touch state. */
function _syncHoldActions() {
  holdActions.moveLeft  = !!(keys['ArrowLeft']  || keys['KeyA'])  || _touchHold.moveLeft;
  holdActions.moveRight = !!(keys['ArrowRight'] || keys['KeyD'])  || _touchHold.moveRight;
  holdActions.jump      = !!(keys['ArrowUp']    || keys['KeyW']   || keys['Space']) || _touchHold.jump;
}

/** Translate a just-pressed key code into a one-shot action (where applicable). */
function _onKeyJustPressed(code) {
  switch (code) {
    case 'KeyR':  justPressedActions.add('remnant');   break;
    case 'KeyT':  justPressedActions.add('restart');   break;
    case 'KeyN':  justPressedActions.add('nextLevel'); break;
    case 'Enter': justPressedActions.add('start');     break;
    case 'Space': justPressedActions.add('start');     break;
  }
}

// ---------------------------------------------------------------------------
// Public API — action-based (consumed by game logic)
// ---------------------------------------------------------------------------

/**
 * Returns true while a hold action is active (keyboard or touch held).
 * @param {'moveLeft'|'moveRight'|'jump'} name
 */
export function isActionDown(name) {
  return holdActions[name] === true;
}

/**
 * Returns true on the first frame a one-shot action fires.
 * Must be called before {@link clearJustPressed} each frame.
 * @param {'remnant'|'restart'|'nextLevel'|'start'} name
 */
export function wasActionJustPressed(name) {
  return justPressedActions.has(name);
}

/**
 * Set a touch hold-action state.
 * Call with active=true on pointerdown, active=false on pointerup/cancel/leave.
 * @param {'moveLeft'|'moveRight'|'jump'} name
 * @param {boolean} active
 */
export function setTouchHold(name, active) {
  if (Object.prototype.hasOwnProperty.call(_touchHold, name)) {
    _touchHold[name] = active;
    _syncHoldActions();
  }
}

/**
 * Fire a one-shot touch action for the current frame.
 * @param {'remnant'|'restart'|'nextLevel'|'start'} name
 */
export function fireTouchAction(name) {
  justPressedActions.add(name);
}

// ---------------------------------------------------------------------------
// Public API — raw keyboard (for non-action key checks: debug, observe, etc.)
// ---------------------------------------------------------------------------

/**
 * Returns true while the given key code is held down.
 * @param {string} code - A KeyboardEvent.code value (e.g. 'ArrowLeft', 'Space').
 */
export function isKeyDown(code) {
  return keys[code] === true;
}

/**
 * Returns true on the first frame a key is pressed (rising-edge detection).
 * Must be called before {@link clearJustPressed} is called each frame.
 * @param {string} code - A KeyboardEvent.code value (e.g. 'KeyR').
 */
export function wasKeyJustPressed(code) {
  return justPressedKeys.has(code);
}

/**
 * Clear all one-shot input state.  Call once per game frame after all input
 * has been read.
 */
export function clearJustPressed() {
  justPressedKeys.clear();
  justPressedActions.clear();
}
