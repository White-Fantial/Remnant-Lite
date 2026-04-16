// Input system — tracks keyboard state for arrow keys and space bar

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

/**
 * Returns true while the given key code is held down.
 * @param {string} code - A KeyboardEvent.code value (e.g. 'ArrowLeft', 'Space').
 */
export function isKeyDown(code) {
  return keys[code] === true;
}
