// Input system — tracks keyboard state for arrow keys and space bar

const keys = {};
const justPressed = new Set(); // keys that fired in the current frame

window.addEventListener('keydown', (e) => {
  if (!keys[e.code]) {
    justPressed.add(e.code);
  }
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

/**
 * Returns true on the first frame a key is pressed (rising-edge detection).
 * Must be called before {@link clearJustPressed} is called each frame.
 * @param {string} code - A KeyboardEvent.code value (e.g. 'KeyR').
 */
export function wasKeyJustPressed(code) {
  return justPressed.has(code);
}

/**
 * Clear the one-shot pressed set.  Call once per game frame after input has
 * been read.
 */
export function clearJustPressed() {
  justPressed.clear();
}
