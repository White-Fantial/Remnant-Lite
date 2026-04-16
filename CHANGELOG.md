# Changelog

All notable changes to Remnant Lite are documented here.

---

## [0.1.0-remnant-lite] — Phase 12 (Production-Readiness Package)

> Intended tag: `v0.1.0-remnant-lite`

### Added
- `docs/post-prototype-evaluation.md` — grounded evaluation of what worked, what did not, and what remains uncertain.
- `docs/core-design-summary.md` — concise validated design reference with pitch, player fantasy, core loop, and mechanic rules summary.
- `docs/mechanics-reference.md` — authoritative prototype rules reference; sufficient to reimplement from scratch.
- `docs/technical-architecture.md` — system responsibilities, update loop order, data flow, and reusability assessment.
- `docs/migration-plan.md` — options for continuing in web vs. rebuilding in Unreal; migration priorities.
- `docs/production-backlog.md` — proposed next backlog organised by category and priority (Must Have → Later).
- `docs/scope-guardrails.md` — explicit list of what should not be added too early, with criteria for evaluating new features.
- `docs/level-design-review.md` — per-level analysis of intended lesson, confusion points, what worked, and recommended changes.
- `docs/next-step-decision.md` — executive summary answering "is the idea worth continuing?" and recommending the next move.
- `docs/project-pitch.md` — short pitch deck style summary for collaborator handoff.
- `CHANGELOG.md` — this file.
- Updated `README.md` with retrospective sections, docs index, and live demo guidance.

### Changed
- Removed stale `console.log` statements from `updateRemnantRecorder` hot path in `src/game.js`.
- Cleaned up minor terminology inconsistencies in level hint text (Echo → Remnant).

---

## Phase 11 — Playtest Readiness

### Added
- `state.playtest` with `enabled` and `observationMode` flags.
- `state.sessionMetrics` — session-wide aggregates (totalTime, totalRemnants, totalRestarts, levelsCompleted, levelTimes, insightMoments).
- `state.feedback` — structured playtest feedback from in-game form.
- `src/systems/analytics.js` — in-memory event logger with timestamped events and JSON export.
- `src/systems/hints.js` — contextual hint system; shows timed messages when player appears stuck.
- `src/feedback-ui.js` — DOM-based feedback overlay shown after tutorial completion.
- `OBSERVATION_TIME_SCALE` constant (0.3×) — O key toggles 0.3× time scale for observation.
- E key — exports session data as JSON download.
- `insightMoments` tracking for first Remnant commit, first door opened by Remnant, first button pressed by Remnant.

---

## Phase 8–10 — Tutorial Flow and Demo Packaging

### Added
- `state.mode` top-level: `'menu'` | `'playing'` | `'gameComplete'`.
- Menu screen and game-complete screen.
- `startGame()` resets session and loads level 0.
- `state.runState`: `'playing'` | `'failed'` | `'levelComplete'`.
- `state.ui.message` / `messageTimer` — centred timed messages with fade.
- `state.debug.enabled` — F1 / backtick toggle.
- `state.metrics` — per-level counters (attempts, remnantCommits, restartCount, elapsedTime).
- Coyote time (`COYOTE_TIME = 0.10 s`) and jump buffering (`JUMP_BUFFER_TIME = 0.12 s`).
- `src/systems/audio.js` — named Web Audio hooks (`Sounds.BUTTON_PRESS`, `DOOR_OPEN`, etc.).
- `src/utils/debug.js` — debug overlay and ghost trail rendering.
- GitHub Pages deployment instructions in README.

---

## Phase 4–7 — Recorder, Replay, and Solid-Phase Identity

### Added
- `src/systems/recorder.js` — rolling-buffer recorder; samples player state at 50 ms intervals; retains last 5 seconds.
- `src/systems/replay.js` — linear interpolation of Remnant position from normalised timeline.
- `src/entities/remnant.js` — Remnant entity factory; solid-phase window (`solidPhaseStartTime = duration − 1500 ms`).
- `src/systems/interaction.js` — activator abstraction; both player and Remnants can press buttons.
- Solid-phase rule: Remnant is physically solid only during its final 1500 ms and stays solid after replay ends.
- FIFO Remnant eviction: oldest Remnant is removed when limit (2) is exceeded.
- `MIN_REMNANT_SAMPLES = 3` guard to prevent trivial commits.

---

## Phase 1–3 — Foundation and First Puzzle Interactions

### Added
- Project setup: `index.html`, `src/main.js`, `src/game.js`, `src/renderer.js`, `src/input.js`, `src/physics.js`, `src/constants.js`.
- AABB collision and gravity system (`physics.js`).
- Level data schema: `platforms`, `interactables` (button, door, goal), `playerSpawn`, `bounds`, `deathY`.
- Level 01 — "Echo on the Switch": button → door → goal; introduces Remnant mechanic.
- Level 02 — "Past Self, Open the Way": reinforces intentional Remnant use.
- Level 03 — "Solid at the End": introduces solid-phase platform mechanic.
- `src/levels/index.js` — ordered level list.
- Button pressed-state → door open/close logic.
- Goal zone detection and level completion.
- Fail condition (fall below `deathY`) with auto-restart after 1.5 s.
- T-key manual restart; N-key level advance; P-key level back.
