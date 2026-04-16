// Game core — world state, update logic, render dispatch

import { isKeyDown, wasKeyJustPressed, clearJustPressed } from './input.js';
import { resolveMovement, aabbOverlap } from './physics.js';
import {
  clearScreen,
  drawPlatforms,
  drawInteractables,
  drawPlayer,
  drawRemnants,
  drawHUD,
  drawUIMessage,
  drawMenuScreen,
  drawGameCompleteScreen,
} from './renderer.js';
import {
  CANVAS_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_VELOCITY,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
  FAIL_DELAY,
  DEATH_Y_DEFAULT,
} from './constants.js';
import { levels } from './levels/index.js';
import {
  createRecorder,
  tickRecorder,
  getCurrentRecording,
  getSnapshotCount,
} from './systems/recorder.js';
import { createRemnant } from './entities/remnant.js';
import { advanceRemnant } from './systems/replay.js';
import { getActivators } from './systems/interaction.js';
import { Sounds } from './systems/audio.js';
import { drawDebugOverlay, drawGhostTrail } from './utils/debug.js';
import { logEvent, exportSessionData } from './systems/analytics.js';
import { resetHints, updateHints } from './systems/hints.js';

/** Minimum number of timeline samples required to spawn a Remnant. */
const MIN_REMNANT_SAMPLES = 3;

/** @type {CanvasRenderingContext2D} */
let ctx;

/**
 * Tracks whether this is the very first loadLevel call so metrics are
 * initialised correctly on page load.
 */
let _initialLoad = true;

/**
 * Structured game state.
 *
 * mode — top-level game mode: 'menu' | 'playing' | 'gameComplete'
 * entities.remnants — ordered array of active Remnants (creation order).
 * rules.maxRemnants — how many Remnants can exist at once; oldest is evicted
 *                     when the limit is exceeded.
 */
const state = {
  /** Top-level mode controlling which screen is shown. */
  mode: 'menu',

  currentLevelIndex: 0,
  levelComplete:     false,

  /** 'playing' | 'failed' | 'levelComplete' */
  runState:  'playing',
  failTimer: 0, // seconds remaining before auto-restart

  player: {
    position:     { x: 0, y: 0 },
    velocity:     { x: 0, y: 0 },
    isGrounded:   false,
    width:        PLAYER_WIDTH,
    height:       PLAYER_HEIGHT,
    coyoteTimer:  0,    // seconds of coyote grace remaining
    jumpBuffer:   0,    // seconds a buffered jump remains pending
    _prevJumpKey: false, // rising-edge tracker for jump buffer fill
  },
  level: {
    name:        '',
    hint:        '',
    playerSpawn: { x: 0, y: 0 },
    platforms:   [],
    deathY:      DEATH_Y_DEFAULT,
    bounds:      { left: 0, right: CANVAS_WIDTH, top: 0, bottom: 450 },
  },
  interactables: [], // buttons, doors, goal zones
  goalReached:   false,

  entities: {
    remnants: [], // active replaying Remnants (up to rules.maxRemnants)
  },
  rules: {
    maxRemnants: 2,
  },

  remnant: {
    recorder:       null, // Recorder instance — created on level load
    latestTimeline: [],   // Last captured timeline (R key)
  },

  /** Lightweight timed message shown in the centre of the screen. */
  ui: {
    message:      '',
    messageTimer: 0, // seconds remaining
    messageFull:  0, // total display duration (used for fade calc)
  },

  /** Debug overlay toggle. */
  debug: {
    enabled: false,
  },

  /**
   * Playtest mode controls.
   *
   * enabled         — master switch; when true, hint UI, analytics, and the
   *                   feedback overlay are all active.
   * observationMode — when true the game runs at 0.3× speed so players can
   *                   observe Remnant behaviour (toggled with O key).
   */
  playtest: {
    enabled:         true,
    observationMode: false,
  },

  /** In-session playtest counters — in-memory only, no persistence. */
  metrics: {
    attempts:        0, // run attempts for current level (resets on level change)
    remnantCommits:  0, // Remnants created this level
    restartCount:    0, // explicit T-key restarts (persists across level loads for session)
    levelStartTime:  0, // performance.now() at last loadLevel
    elapsedTime:     0, // seconds since last loadLevel (accumulated via dt)
  },

  /**
   * Session-wide aggregates — never reset between levels, only on startGame().
   *
   * totalTime        — cumulative seconds across the whole session.
   * totalRemnants    — Remnants committed across all levels.
   * totalRestarts    — restarts + fails across all levels.
   * levelsCompleted  — number of goal zones reached.
   * levelTimes       — array of { levelIndex, name, time } per completion.
   * insightMoments   — key discovery events (first commit, first door open, etc.).
   */
  sessionMetrics: {
    totalTime:       0,
    totalRemnants:   0,
    totalRestarts:   0,
    levelsCompleted: 0,
    levelTimes:      [],
    insightMoments:  [],
  },

  /**
   * Feedback collected via the in-game feedback overlay.
   * null until the player submits the form.
   */
  feedback: null,
};

// ---------------------------------------------------------------------------
// UI message helpers
// ---------------------------------------------------------------------------

/**
 * Queue a centred timed message.  Overwrites any current message immediately.
 *
 * @param {string} text     - Message text.
 * @param {number} duration - Seconds to display the message.
 */
function showMessage(text, duration = 2.0) {
  state.ui.message      = text;
  state.ui.messageTimer = duration;
  state.ui.messageFull  = duration;
}

/**
 * Tick the UI message timer down each frame.
 * @param {number} dt
 */
function updateUIMessages(dt) {
  if (state.ui.messageTimer > 0) {
    state.ui.messageTimer = Math.max(0, state.ui.messageTimer - dt);
    if (state.ui.messageTimer === 0) {
      state.ui.message = '';
    }
  }
}

// ---------------------------------------------------------------------------
// Level loading and progression
// ---------------------------------------------------------------------------

/**
 * Load a level by index into state, resetting all level-local data cleanly.
 * Safe to call during gameplay — no page reload required.
 *
 * @param {number} index - Zero-based index into the levels array.
 */
function loadLevel(index) {
  if (index < 0 || index >= levels.length) return;

  const levelData          = levels[index];
  const isSameLevelReload  = !_initialLoad && index === state.currentLevelIndex;
  _initialLoad             = false;

  state.currentLevelIndex = index;
  state.levelComplete     = false;
  state.runState          = 'playing';
  state.failTimer         = 0;

  state.level.name        = levelData.name ?? '';
  state.level.hint        = levelData.hint ?? '';
  state.level.playerSpawn = levelData.playerSpawn;
  state.level.platforms   = levelData.platforms;
  state.level.deathY      = levelData.deathY  ?? DEATH_Y_DEFAULT;
  state.level.bounds      = levelData.bounds  ?? {
    left: 0, right: CANVAS_WIDTH, top: 0, bottom: 450,
  };

  // Shallow-copy interactables so mutating isPressed/isOpen is safe
  state.interactables = (levelData.interactables ?? []).map(e => ({ ...e }));
  state.goalReached   = false;

  // Clear all active Remnants so the room starts fresh
  state.entities.remnants = [];

  state.player.position.x  = levelData.playerSpawn.x;
  state.player.position.y  = levelData.playerSpawn.y;
  state.player.velocity.x  = 0;
  state.player.velocity.y  = 0;
  state.player.isGrounded  = false;
  state.player.coyoteTimer = 0;
  state.player.jumpBuffer  = 0;
  state.player._prevJumpKey = false;

  // Start a fresh recorder for this run
  state.remnant.recorder       = createRecorder();
  state.remnant.latestTimeline = [];

  // Clear any stale message
  state.ui.message      = '';
  state.ui.messageTimer = 0;

  // --- Metrics ---
  if (!isSameLevelReload) {
    // New level — reset per-level counters; also reset hint state
    state.metrics.attempts       = 0;
    state.metrics.remnantCommits = 0;
    state.metrics.restartCount   = 0;
    resetHints();
  }
  state.metrics.attempts++;
  if (isSameLevelReload) {
    state.metrics.restartCount++;
    state.sessionMetrics.totalRestarts++;
  }
  state.metrics.elapsedTime   = 0;
  state.metrics.levelStartTime = performance.now();

  // Analytics
  logEvent('level_start', { level: index, name: levelData.name ?? '' });
}

/**
 * Restart the current level from scratch.
 * Equivalent to reloading the same level index.
 */
function restartCurrentLevel() {
  logEvent('restart_level', {
    level:        state.currentLevelIndex,
    timeInLevel:  parseFloat(state.metrics.elapsedTime.toFixed(2)),
    remnants:     state.entities.remnants.length,
  });
  Sounds.RESTART();
  loadLevel(state.currentLevelIndex);
  showMessage('Level Restarted', 1.2);
}

/**
 * Advance to the next level.
 * If already on the last level, does nothing (completion UI handles this).
 */
function goToNextLevel() {
  const nextIndex = state.currentLevelIndex + 1;
  if (nextIndex < levels.length) {
    loadLevel(nextIndex);
  }
}

// ---------------------------------------------------------------------------
// Fail condition
// ---------------------------------------------------------------------------

/**
 * Check whether the player has fallen out of bounds and trigger failure.
 */
function checkFailCondition() {
  if (state.runState !== 'playing') return;
  if (state.player.position.y > state.level.deathY) {
    state.runState  = 'failed';
    state.failTimer = FAIL_DELAY;
    showMessage('Run Failed', FAIL_DELAY + 0.3);
    Sounds.FAIL_RESET();

    state.sessionMetrics.totalRestarts++;
    logEvent('level_fail', {
      level:        state.currentLevelIndex,
      timeInLevel:  parseFloat(state.metrics.elapsedTime.toFixed(2)),
      remnants:     state.entities.remnants.length,
    });
  }
}

/**
 * Tick the fail timer and auto-restart when it expires.
 * @param {number} dt
 */
function updateFailState(dt) {
  if (state.runState !== 'failed') return;
  state.failTimer -= dt;
  if (state.failTimer <= 0) {
    // Auto-restart after fail: counts as a restart in metrics (isSameLevelReload = true)
    loadLevel(state.currentLevelIndex);
  }
}

// ---------------------------------------------------------------------------
// Subsystem helpers
// ---------------------------------------------------------------------------

/**
 * Build the list of colliders that are blocking movement this frame.
 * Closed doors are included; open doors are excluded.
 * Solid-phase Remnants are included so the player can stand on them.
 *
 * @returns {Array<{ x: number, y: number, width: number, height: number }>}
 */
function getBlockingColliders() {
  const colliders = [...state.level.platforms];

  for (const entity of state.interactables) {
    if (entity.type === 'door' && !entity.isOpen) {
      colliders.push(entity);
    }
  }

  // Each solid-phase Remnant becomes a physical platform for the player.
  for (const remnant of state.entities.remnants) {
    if (remnant.isSolidToPlayer) {
      colliders.push(remnant);
    }
  }

  return colliders;
}

/**
 * Update button pressed state.
 * Accepts a list of activators so both the live player and all active Remnants
 * can press buttons — no separate code path for each.
 *
 * @param {Array<{ id: string, x: number, y: number, width: number, height: number }>} activators
 */
function updateButtons(activators) {
  for (const entity of state.interactables) {
    if (entity.type !== 'button') continue;

    const wasPressed = entity.isPressed;

    entity.pressedBy = activators
      .filter(a =>
        aabbOverlap(
          a.x, a.y, a.width, a.height,
          entity.x, entity.y, entity.width, entity.height,
        )
      )
      .map(a => a.id);

    entity.isPressed = entity.pressedBy.length > 0;

    // Play click on fresh press
    if (entity.isPressed && !wasPressed) {
      Sounds.BUTTON_PRESS();

      // Detect first time a Remnant presses a button — key insight moment
      const isRemnantPress = entity.pressedBy.some(id => id !== 'player');
      if (isRemnantPress) {
        // Ghost success highlight: store a flash timer on the entity
        entity.successFlash = 1.2; // seconds

        const alreadyTracked = state.sessionMetrics.insightMoments
          .some(m => m.type === 'first_remnant_presses_button');
        if (!alreadyTracked) {
          const moment = {
            type:  'first_remnant_presses_button',
            level: state.currentLevelIndex,
            time:  parseFloat(state.metrics.elapsedTime.toFixed(2)),
          };
          state.sessionMetrics.insightMoments.push(moment);
          logEvent('first_remnant_presses_button', { level: moment.level, time: moment.time });
        }
      }
    }

    // Decay the success flash timer each frame
    if (entity.successFlash > 0) {
      entity.successFlash = Math.max(0, entity.successFlash - (1 / 60));
    }
  }
}

/**
 * Resolve door open/closed state from linked button states.
 * A door is open if at least one button that targets it is pressed.
 * When a Remnant is responsible for opening a door, set a success flash.
 */
function updateDoors() {
  // Build set of door IDs that Remnants are holding open
  const remnantOpenDoorIds = new Set();
  for (const entity of state.interactables) {
    if (entity.type !== 'button' || !entity.isPressed || !entity.targets) continue;
    const isRemnantPressing = Array.isArray(entity.pressedBy) &&
      entity.pressedBy.some(id => id !== 'player');
    if (isRemnantPressing) {
      for (const targetId of entity.targets) {
        remnantOpenDoorIds.add(targetId);
      }
    }
  }

  const openDoorIds = new Set();
  for (const entity of state.interactables) {
    if (entity.type === 'button' && entity.isPressed && entity.targets) {
      for (const targetId of entity.targets) {
        openDoorIds.add(targetId);
      }
    }
  }

  for (const entity of state.interactables) {
    if (entity.type === 'door') {
      const wasOpen = entity.isOpen;
      entity.isOpen = openDoorIds.has(entity.id);
      if (entity.isOpen !== wasOpen) {
        if (entity.isOpen) {
          Sounds.DOOR_OPEN();

          // Ghost success highlight when a Remnant opens the door
          if (remnantOpenDoorIds.has(entity.id)) {
            entity.successFlash = 1.2;

            const alreadyTracked = state.sessionMetrics.insightMoments
              .some(m => m.type === 'first_remnant_opens_door');
            if (!alreadyTracked) {
              const moment = {
                type:  'first_remnant_opens_door',
                level: state.currentLevelIndex,
                time:  parseFloat(state.metrics.elapsedTime.toFixed(2)),
              };
              state.sessionMetrics.insightMoments.push(moment);
              logEvent('first_remnant_opens_door', { level: moment.level, time: moment.time });
            }
          }
        } else {
          Sounds.DOOR_CLOSE();
        }
      }

      // Decay door success flash
      if (entity.successFlash > 0) {
        entity.successFlash = Math.max(0, entity.successFlash - (1 / 60));
      }
    }
  }
}

/**
 * Check whether the player has reached any goal zone.
 * @param {{ position: { x: number, y: number }, width: number, height: number }} player
 */
function updateGoal(player) {
  if (state.goalReached) return; // latch — stays true once reached
  for (const entity of state.interactables) {
    if (entity.type !== 'goal') continue;
    if (
      aabbOverlap(
        player.position.x, player.position.y, player.width, player.height,
        entity.x, entity.y, entity.width, entity.height,
      )
    ) {
      state.goalReached   = true;
      state.levelComplete = true;
      state.runState      = 'levelComplete';
      Sounds.GOAL_REACHED();

      const isLastLevel  = state.currentLevelIndex === levels.length - 1;
      const levelTime    = parseFloat(state.metrics.elapsedTime.toFixed(2));

      state.sessionMetrics.levelsCompleted++;
      state.sessionMetrics.levelTimes.push({
        levelIndex: state.currentLevelIndex,
        name:       state.level.name,
        time:       levelTime,
      });

      logEvent('level_complete', {
        level:   state.currentLevelIndex,
        time:    levelTime,
        remnants: state.entities.remnants.length,
      });

      showMessage(
        isLastLevel ? 'Tutorial Complete!' : 'Level Complete!',
        3.5,
      );
    }
  }
}

/**
 * Tick the recorder and handle Remnant commit input (R key).
 *
 * When R is pressed:
 *  1. Capture the current buffered timeline.
 *  2. If there are enough samples, create a new Remnant.
 *  3. If at the Remnant limit, evict the oldest Remnant first (index 0).
 *  4. Push the new Remnant to the end of the array.
 *  5. Reset the player to the level spawn.
 *  6. Start a fresh recorder.
 *
 * @param {number} nowMs - Current wall-clock time in milliseconds.
 */
function updateRemnantRecorder(nowMs) {
  const { recorder } = state.remnant;
  if (!recorder) return;

  tickRecorder(recorder, state.player, nowMs);

  if (wasKeyJustPressed('KeyR')) {
    const timeline = getCurrentRecording(recorder);
    state.remnant.latestTimeline = timeline;

    if (timeline.length >= MIN_REMNANT_SAMPLES) {
      const newRemnant = createRemnant(timeline);

      // Evict oldest Remnant when at limit (FIFO replacement)
      if (state.entities.remnants.length >= state.rules.maxRemnants) {
        const evicted = state.entities.remnants.shift();
        console.log(`Remnant evicted: ${evicted.id}`);
        Sounds.REMNANT_REMOVED();
        showMessage('Oldest Echo Removed', 1.2);
      }

      state.entities.remnants.push(newRemnant);
      state.metrics.remnantCommits++;
      state.sessionMetrics.totalRemnants++;

      // Track first-ever remnant commit as a key insight moment
      if (state.sessionMetrics.totalRemnants === 1) {
        const moment = {
          type:  'first_remnant_commit',
          level: state.currentLevelIndex,
          time:  parseFloat(state.metrics.elapsedTime.toFixed(2)),
        };
        state.sessionMetrics.insightMoments.push(moment);
        logEvent('first_remnant_commit', { level: state.currentLevelIndex, time: moment.time });
      }

      logEvent('remnant_commit', {
        level:    state.currentLevelIndex,
        time:     parseFloat(state.metrics.elapsedTime.toFixed(2)),
        samples:  timeline.length,
        duration: parseFloat((newRemnant.duration / 1000).toFixed(2)),
      });

      // Reset player to spawn so the new run begins cleanly
      state.player.position.x  = state.level.playerSpawn.x;
      state.player.position.y  = state.level.playerSpawn.y;
      state.player.velocity.x  = 0;
      state.player.velocity.y  = 0;
      state.player.isGrounded  = false;
      state.player.coyoteTimer = 0;
      state.player.jumpBuffer  = 0;

      // Start a fresh recorder — the replay and recording are now independent
      state.remnant.recorder = createRecorder();

      Sounds.REMNANT_COMMIT();

      console.log(
        `Remnant spawned: ${newRemnant.id}, ` +
        `${timeline.length} samples, ` +
        `duration ${(newRemnant.duration / 1000).toFixed(2)}s — ` +
        `active: ${state.entities.remnants.length}/${state.rules.maxRemnants}`,
      );
    } else {
      console.log(`Timeline too short to spawn a Remnant (${timeline.length} samples)`);
    }
  }
}

/**
 * Advance all active Remnants' playback each frame.
 * @param {number} dt - Delta time in seconds.
 */
function updateAllRemnants(dt) {
  for (const remnant of state.entities.remnants) {
    advanceRemnant(remnant, dt);
  }
}

/**
 * Handle player input and movement with coyote time and jump buffering.
 * @param {number} dt
 */
function updatePlayer(dt) {
  const { player } = state;

  // --- Horizontal input ---
  player.velocity.x = 0;
  if (isKeyDown('ArrowLeft') || isKeyDown('KeyA'))  player.velocity.x = -PLAYER_SPEED;
  if (isKeyDown('ArrowRight') || isKeyDown('KeyD')) player.velocity.x =  PLAYER_SPEED;

  // --- Jump buffer: fill on rising edge of jump key ---
  const jumpKey = isKeyDown('ArrowUp') || isKeyDown('KeyW') || isKeyDown('Space');
  if (jumpKey && !player._prevJumpKey) {
    player.jumpBuffer = JUMP_BUFFER_TIME;
  }
  player._prevJumpKey = jumpKey;

  // Decay jump buffer
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

  // --- Jump: consume buffer if coyote window is open ---
  // coyoteTimer > 0 means the player was grounded recently (or still is).
  if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
    player.velocity.y    = JUMP_VELOCITY;
    player.coyoteTimer   = 0; // consume coyote window to prevent double-jump
    player.jumpBuffer    = 0;
    player.isGrounded    = false;
  }

  // --- Physics + collision resolution against platforms and closed doors ---
  player.isGrounded = resolveMovement(
    player.position,
    player.velocity,
    player.width,
    player.height,
    getBlockingColliders(),
    dt,
  );

  // --- Update coyote timer based on this frame's grounded result ---
  if (player.isGrounded) {
    player.coyoteTimer = COYOTE_TIME;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  // --- Clamp to canvas horizontal bounds ---
  if (player.position.x < 0) {
    player.position.x = 0;
  }
  if (player.position.x + player.width > CANVAS_WIDTH) {
    player.position.x = CANVAS_WIDTH - player.width;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the game — show the main menu.
 * The first level is only loaded when the player explicitly starts the game.
 *
 * Note: `state` is declared with `mode: 'menu'` and correct defaults at module
 * level, so this one-time call on page load requires no further reset.
 *
 * @param {CanvasRenderingContext2D} context
 */
export function init(context) {
  ctx = context;
  // state.mode is already 'menu' from its declaration; set explicitly for clarity.
  state.mode = 'menu';
}

/**
 * Start (or restart) the game from level 1.
 * Resets all state so it feels like a fresh run.
 */
function startGame() {
  state.mode   = 'playing';
  _initialLoad = true; // treat first loadLevel as a brand-new session

  // Reset session-wide aggregates for a new playthrough
  state.sessionMetrics.totalTime       = 0;
  state.sessionMetrics.totalRemnants   = 0;
  state.sessionMetrics.totalRestarts   = 0;
  state.sessionMetrics.levelsCompleted = 0;
  state.sessionMetrics.levelTimes      = [];
  state.sessionMetrics.insightMoments  = [];
  state.feedback                       = null;

  // Exit observation mode if it was active
  state.playtest.observationMode = false;

  loadLevel(0);
  logEvent('session_start');
}

/**
 * Update all game logic for one frame.
 *
 * Input is routed by top-level mode first:
 *
 *  Menu       — Enter / Space → start game
 *  GameComplete — Enter / R → restart from level 1
 *  Playing    — full gameplay update (see order below):
 *    1.  Debug toggle (F1 / backtick)
 *    2.  O — observation mode (0.3× time scale) toggle
 *    3.  E — export session data to JSON
 *    4.  T — instant restart
 *    5.  Level navigation (N / P) when level is complete
 *    6.  Fail state tick + UI messages
 *    7.  Player movement
 *    8.  Recorder tick + Remnant commit (R key)
 *    9.  Advance all Remnant replays
 *   10.  Gather activators
 *   11.  Update buttons
 *   12.  Update doors
 *   13.  Update goal / level completion
 *   14.  Check fail condition (out of bounds)
 *   15.  Contextual hints
 *   16.  Update UI messages
 *   17.  Accumulate elapsed time metrics
 *   18.  Clear one-shot input flags
 *
 * @param {number} dt - Delta time in seconds.
 */
export function update(dt) {
  // ── Menu mode ─────────────────────────────────────────────────────────────
  if (state.mode === 'menu') {
    if (wasKeyJustPressed('Enter') || wasKeyJustPressed('Space')) {
      startGame();
    }
    clearJustPressed();
    return;
  }

  // ── Game-complete mode ────────────────────────────────────────────────────
  if (state.mode === 'gameComplete') {
    if (wasKeyJustPressed('Enter') || wasKeyJustPressed('KeyR')) {
      startGame();
    }
    clearJustPressed();
    return;
  }

  // ── E key — export session data (available from any playing state) ─────
  if (wasKeyJustPressed('KeyE')) {
    state.sessionMetrics.totalTime =
      parseFloat((state.sessionMetrics.totalTime + state.metrics.elapsedTime).toFixed(2));
    exportSessionData(state.sessionMetrics, state.feedback);
    showMessage('Session data exported', 2.0);
    clearJustPressed();
    return;
  }

  // ── Playing mode ──────────────────────────────────────────────────────────

  // 1. Debug overlay toggle — F1 or backtick, works in all playing states
  if (wasKeyJustPressed('F1') || wasKeyJustPressed('Backquote')) {
    state.debug.enabled = !state.debug.enabled;
    clearJustPressed();
    return;
  }

  // 2. O — observation mode toggle (0.3× time scale)
  if (wasKeyJustPressed('KeyO') && state.playtest.enabled) {
    state.playtest.observationMode = !state.playtest.observationMode;
    const label = state.playtest.observationMode ? 'Observation Mode ON (0.3×)' : 'Observation Mode OFF';
    showMessage(label, 1.5);
    logEvent('observation_mode_toggle', {
      active: state.playtest.observationMode,
      level:  state.currentLevelIndex,
    });
    clearJustPressed();
    return;
  }

  // Apply time scale for observation mode — slow-motion when active
  const effectiveDt = state.playtest.observationMode ? dt * 0.3 : dt;

  // 3. T — instant restart, works in all playing states
  if (wasKeyJustPressed('KeyT')) {
    restartCurrentLevel();
    clearJustPressed();
    return;
  }

  // 4. Level navigation — only when not in fail state
  if (state.runState !== 'failed') {
    if (wasKeyJustPressed('KeyN') && state.levelComplete) {
      const nextIndex = state.currentLevelIndex + 1;
      if (nextIndex < levels.length) {
        goToNextLevel();
      } else {
        // Last level cleared — transition to the game-complete screen
        logEvent('session_complete', {
          totalTime:       parseFloat(state.sessionMetrics.totalTime.toFixed(2)),
          levelsCompleted: state.sessionMetrics.levelsCompleted,
          totalRemnants:   state.sessionMetrics.totalRemnants,
          totalRestarts:   state.sessionMetrics.totalRestarts,
        });
        state.mode = 'gameComplete';
        // Notify the feedback overlay to show after a short delay
        window.dispatchEvent(new CustomEvent('remnant:gameComplete'));
      }
      clearJustPressed();
      return;
    }
    if (wasKeyJustPressed('KeyP')) {
      loadLevel(Math.max(0, state.currentLevelIndex - 1));
      clearJustPressed();
      return;
    }
  }

  // 5. While failed, tick the auto-restart countdown and keep messages updated
  if (state.runState === 'failed') {
    updateFailState(effectiveDt);
    updateUIMessages(effectiveDt);
    state.metrics.elapsedTime          += effectiveDt;
    state.sessionMetrics.totalTime     += effectiveDt;
    clearJustPressed();
    return;
  }

  // Freeze gameplay (but not input) when level is complete
  if (state.runState === 'levelComplete') {
    updateUIMessages(effectiveDt);
    state.metrics.elapsedTime          += effectiveDt;
    state.sessionMetrics.totalTime     += effectiveDt;
    clearJustPressed();
    return;
  }

  // 6–14. Normal gameplay update
  updatePlayer(effectiveDt);
  updateRemnantRecorder(performance.now());
  updateAllRemnants(effectiveDt);

  const activators = getActivators(state);
  updateButtons(activators);
  updateDoors();
  updateGoal(state.player);
  checkFailCondition();

  // 15. Contextual hints (only when playtest mode is on)
  if (state.playtest.enabled) {
    updateHints(
      effectiveDt,
      state.metrics,
      state.currentLevelIndex,
      state.entities.remnants.length,
      showMessage,
    );
  }

  // 16–17.
  updateUIMessages(effectiveDt);
  state.metrics.elapsedTime          += effectiveDt;
  state.sessionMetrics.totalTime     += effectiveDt;

  clearJustPressed();
}

/**
 * Render the current frame.
 * Rendering is layered by top-level mode:
 *  1. Menu         → title screen only
 *  2. GameComplete → end screen only
 *  3. Playing      → background → world → HUD → overlays
 */
export function render() {
  // ── Menu screen ───────────────────────────────────────────────────────────
  if (state.mode === 'menu') {
    drawMenuScreen(ctx);
    return;
  }

  // ── Game-complete screen ──────────────────────────────────────────────────
  if (state.mode === 'gameComplete') {
    drawGameCompleteScreen(ctx, state.sessionMetrics);
    return;
  }

  // ── Gameplay layers ───────────────────────────────────────────────────────

  const { recorder }      = state.remnant;
  const snapshotCount     = recorder ? getSnapshotCount(recorder) : 0;
  const { remnants }      = state.entities;
  const isLastLevel       = state.currentLevelIndex === levels.length - 1;
  const blockingColliders = getBlockingColliders();

  // Layer 1 — background
  clearScreen(ctx);

  // Debug ghost trails beneath world
  if (state.debug.enabled) {
    drawGhostTrail(ctx, recorder ? recorder._buffer : null, remnants);
  }

  // Layer 2 — world (platforms, interactables, Remnants, player)
  drawPlatforms(ctx, state.level.platforms);
  drawInteractables(ctx, state.interactables, remnants);
  drawRemnants(ctx, remnants);
  drawPlayer(ctx, state.player.position, state.player.isGrounded);

  // Layer 3 — HUD
  drawHUD(ctx, {
    levelName:        state.level.name,
    levelIndex:       state.currentLevelIndex,
    totalLevels:      levels.length,
    goalReached:      state.goalReached,
    levelComplete:    state.levelComplete,
    isLastLevel,
    runState:         state.runState,
    failTimer:        state.failTimer,
    hint:             state.level.hint,
    snapshotCount,
    capturedCount:    state.remnant.latestTimeline.length,
    remnants,
    maxRemnants:      state.rules.maxRemnants,
    interactables:    state.interactables,
    observationMode:  state.playtest.observationMode,
    playtestEnabled:  state.playtest.enabled,
  });

  // Layer 4 — overlays (timed messages, debug panel)
  drawUIMessage(ctx, state.ui.message, state.ui.messageTimer, state.ui.messageFull);

  if (state.debug.enabled) {
    const pressedButtons = state.interactables
      .filter(e => e.type === 'button' && e.isPressed)
      .map(e => e.id);

    drawDebugOverlay(ctx, {
      player:        state.player,
      remnants,
      snapshotCount,
      blockingCount: blockingColliders.length,
      pressedButtons,
      metrics:       state.metrics,
      canvasWidth:   CANVAS_WIDTH,
    });
  }
}

/**
 * Store player feedback responses (called from the feedback overlay).
 * Responses are attached to the session data so they appear in the export.
 *
 * @param {object} responses - Key/value pairs of feedback answers.
 */
export function submitFeedback(responses) {
  state.feedback = responses;
}