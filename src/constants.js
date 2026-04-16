// Game constants — shared across all modules

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const GRAVITY = 1800;       // pixels per second²
export const PLAYER_SPEED = 280;   // pixels per second (horizontal)
export const JUMP_VELOCITY = -620; // pixels per second (upward)

export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;

// Recorder
export const RECORDER_INTERVAL_MS = 50;      // sample every 50 ms
export const RECORDER_BUFFER_SECONDS = 5;    // keep last 5 seconds of history

// Game feel
export const COYOTE_TIME      = 0.10;  // seconds of grace period after leaving a ledge
export const JUMP_BUFFER_TIME = 0.12;  // seconds a jump input is remembered before landing

// Fail / death
export const FAIL_DELAY       = 1.5;   // seconds before auto-restart after failure
export const DEATH_Y_DEFAULT  = 580;   // fallback Y threshold for out-of-bounds death

// Playtest
export const OBSERVATION_TIME_SCALE = 0.3; // time multiplier when observation mode is active
