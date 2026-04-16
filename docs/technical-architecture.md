# Technical Architecture

> **Project:** Remnant Lite  
> **Document purpose:** Structure, responsibilities, and data flow of the prototype codebase.  
> This document is intended to make migration or handoff significantly easier.

---

## Project Layout

```
index.html                  ← entry point; loads ES modules
src/
  main.js                   ← game loop (requestAnimationFrame)
  game.js                   ← state machine, update/render dispatch
  renderer.js               ← all Canvas 2D draw calls
  input.js                  ← keyboard state (pressed / justPressed)
  physics.js                ← AABB collision resolution
  constants.js              ← all shared numeric constants
  feedback-ui.js            ← playtest feedback overlay (DOM-based)
  levels/
    index.js                ← ordered export of all levels
    level-01.js             ← "Echo on the Switch"
    level-02.js             ← "Past Self, Open the Way"
    level-03.js             ← "Solid at the End"
  entities/
    remnant.js              ← Remnant entity factory + solid-phase logic
  systems/
    recorder.js             ← rolling-buffer timeline sampler
    replay.js               ← timeline interpolation + Remnant advancement
    interaction.js          ← activator list builder (player + Remnants)
    audio.js                ← Web Audio API sound stubs
    analytics.js            ← in-memory event logger + JSON export
    hints.js                ← contextual hint timing system
  utils/
    debug.js                ← debug overlay and ghost trail rendering
```

No build step, no bundler, no framework.  All files are plain ES modules loaded directly by the browser.

---

## Update Loop Order

Each frame, `main.js` calls `update(dt)` then `render()` on `game.js`.

### `update(dt)` order (playing mode)

| Step | System | Responsibility |
|---|---|---|
| 1 | Input | Debug toggle (F1 / backtick) |
| 2 | Input | Observation mode toggle (O) |
| 3 | Input | Session export (E) |
| 4 | Input | Manual restart (T) |
| 5 | Input | Level navigation (N / P) |
| 6 | Fail state | Tick countdown, auto-restart |
| 7 | Player | Horizontal velocity from input |
| 8 | Player | Jump buffer + coyote time |
| 9 | Physics | resolveMovement (collision + gravity) |
| 10 | Recorder | tickRecorder, handle R-key commit |
| 11 | Replay | advanceRemnant for all active Remnants |
| 12 | Interaction | getActivators (player + Remnants) |
| 13 | Buttons | updateButtons (pressed state + flash) |
| 14 | Doors | updateDoors (open/close from buttons) |
| 15 | Goal | updateGoal (level completion latch) |
| 16 | Fail check | checkFailCondition (Y out-of-bounds) |
| 17 | Hints | updateHints (contextual messages) |
| 18 | UI | updateUIMessages (timer decay) |
| 19 | Metrics | Accumulate elapsedTime / totalTime |
| 20 | Input | clearJustPressed |

### `render()` order (playing mode)

1. `clearScreen` — wipe canvas
2. `drawPlatforms` — static geometry
3. `drawInteractables` — buttons, doors, goal zones
4. `drawRemnants` — ghost figures (with solid-phase visual)
5. `drawPlayer` — live player figure
6. `drawHUD` — level name, Remnant count, timer
7. `drawUIMessage` — centred timed message with fade
8. `drawGhostTrail` (debug only) — Remnant path history
9. `drawDebugOverlay` (debug only) — FPS, state, position

---

## System Responsibilities

### `main.js` — Game Loop
- Owns the `requestAnimationFrame` loop.
- Computes `dt` (delta time in seconds, capped at 100 ms to prevent spiral-of-death).
- Calls `update(dt)` and `render()` from `game.js`.
- **Reusable:** The loop pattern is standard and transfers to any target.

### `game.js` — State Machine and Dispatch
- Owns the entire `state` object (single source of truth).
- Routes updates by `state.mode`: `'menu'` | `'playing'` | `'gameComplete'`.
- Contains all high-level game logic (player input, fail/restart, level progression).
- **Prototype-specific:** The state shape and routing logic are tightly coupled to the current feature set and should be redesigned for a full version.

### `renderer.js` — Canvas Drawing
- All draw calls are in one file; no rendering logic lives elsewhere.
- Stateless: reads from `state` and writes to the canvas.
- Draws: background, platforms, interactables, Remnants, player, HUD, messages.
- **Reusable concept:** The separation of draw calls from logic is a good pattern.  Specific canvas calls would be replaced by a 3D/sprite renderer in a full version.

### `input.js` — Keyboard State
- Maintains two sets: `_held` (currently down) and `_justPressed` (pressed this frame).
- `isKeyDown(code)` — check held state.
- `wasKeyJustPressed(code)` — check and consume a one-shot press.
- `clearJustPressed()` — called at the end of each frame.
- **Reusable concept:** The held/just-pressed separation is a solid input pattern.

### `physics.js` — AABB Collision
- `resolveMovement(position, velocity, w, h, colliders, dt)` — applies gravity, moves the entity, resolves AABB overlaps against each collider, returns `isGrounded`.
- `aabbOverlap(...)` — pure boolean overlap test used by interaction and goal systems.
- **Reusable:** The AABB routines are generic and transfer directly.

### `constants.js` — Shared Constants
- All numeric game constants are defined here and imported by other modules.
- **Reusable:** The pattern of centralising constants is good practice.

### `systems/recorder.js` — Timeline Recording
- `createRecorder()` — returns an empty recorder instance.
- `tickRecorder(recorder, player, nowMs)` — samples player state at 50 ms intervals; trims the buffer to the last 5 seconds.
- `getCurrentRecording(recorder)` — returns a normalised copy of the buffer.
- **Reusable concept:** The rolling-buffer sampler is portable.  A full version would record richer state (animations, facing, action flags).

### `systems/replay.js` — Remnant Playback
- `advanceRemnant(remnant, dt)` — advances `currentTime`, interpolates position from the timeline, updates `isSolidToPlayer`.
- Uses binary-search linear interpolation between adjacent samples.
- **Reusable concept:** The interpolation approach transfers.  A full engine would drive animation state from the same timeline data.

### `entities/remnant.js` — Remnant Factory
- `createRemnant(timeline)` — creates a Remnant entity from a normalised timeline.
- Computes `solidPhaseStartTime = max(0, duration − 1500 ms)`.
- Sets initial position, flags (`canActivateButtons = true`, `isSolidToPlayer = false`).
- **Reusable concept:** The entity shape (id, timeline, currentTime, flags) is a clean design.

### `systems/interaction.js` — Activator Logic
- `getActivators(state)` — returns the list of entities that can press buttons this frame.
- Includes the live player and all Remnants where `canActivateButtons = true`.
- **Reusable:** The activator pattern cleanly decouples "who can interact" from "what interaction does."

### `levels/` — Level Data
- Each level is a plain JS object: `name`, `hint`, `playerSpawn`, `platforms`, `interactables`, `deathY`, `bounds`.
- Interactables use a typed record: `button`, `door`, `goal`, each with an `id`.
- Buttons have a `targets` array of door IDs they control.
- **Reusable concept:** The data-driven level format is good.  A full version would load this from JSON or a dedicated level editor.

### `systems/audio.js` — Sound Hooks
- Provides a `Sounds` object with named functions: `BUTTON_PRESS`, `DOOR_OPEN`, `DOOR_CLOSE`, `GOAL_REACHED`, `REMNANT_COMMIT`, `REMNANT_REMOVED`, `RESTART`, `FAIL_RESET`.
- **Current status:** The hooks are wired but audio generation is stub/minimal.  The architecture (named hooks called from game logic) is correct; the implementation needs real audio assets.

### `systems/analytics.js` — Event Logger
- In-memory array of timestamped events.
- `logEvent(type, data)` — appends an event.
- `exportSessionData(sessionMetrics, feedback)` — downloads JSON via browser Blob API.
- **Prototype-specific:** Designed for local playtest data collection, not a production telemetry system.

### `systems/hints.js` — Contextual Hints
- Timer-based system that shows a hint message when a player appears stuck (no Remnant committed after N seconds).
- **Prototype-specific:** Simple and functional for a tutorial.  A full version would replace this with authored hint triggers per level.

### `feedback-ui.js` — Feedback Overlay
- DOM-based overlay shown after tutorial completion.
- Collects: "understood mechanic?", "aha moment", "confusing parts", "control feel."
- Dispatches a `remnant:gameComplete` event from `game.js` to show the overlay.
- **Prototype-specific:** For playtesting only.  Not needed in a shipped game.

### `utils/debug.js` — Debug Rendering
- `drawDebugOverlay(ctx, state)` — draws FPS, player position, and Remnant states.
- `drawGhostTrail(ctx, remnants)` — draws the path history of active Remnants.
- **Reusable concept:** Keeping debug rendering in a separate util is good practice.

---

## Data Flow

```
input.js
  ↓ isKeyDown / wasKeyJustPressed
game.js (update)
  ↓ player velocity
physics.js (resolveMovement)
  ↓ resolved position, isGrounded
  ↓ player state
recorder.js (tickRecorder)
  ↓ timeline buffer
  [R key] → getCurrentRecording → createRemnant → entities.remnants[]
  ↓ dt per remnant
replay.js (advanceRemnant)
  ↓ remnant.x, remnant.y, isSolidToPlayer
interaction.js (getActivators)
  ↓ activator list
game.js (updateButtons, updateDoors)
  ↓ interactable.isPressed, isOpen
game.js (updateGoal, checkFailCondition)
  ↓ state.runState, state.mode
renderer.js (render)
  ↓ Canvas 2D draw calls
```

---

## Known Technical Limitations

| Limitation | Notes |
|---|---|
| Physics is not simulated for Remnants | Remnants replay recorded positions; they do not simulate physics independently. This means a Remnant's recorded path can be invalidated if the level state changes (e.g. a door closes mid-replay). |
| Single-canvas 2D renderer | No sprite sheets, no particle system, no layered rendering. Visual quality is prototype-level. |
| No save system | All state is in-memory. Refreshing the page resets everything. |
| No level editor | Levels are hardcoded JS objects. Adding or editing levels requires code changes. |
| Audio is minimal | The Web Audio hooks are wired but no designed sound assets exist. |
| No mobile / gamepad support | Input is keyboard-only. |
| `file://` origin limitation | ES module imports require HTTP. Players must use a local server or hosted URL. |

---

## What Is Reusable vs Prototype-Only

### Reusable (port or adapt)
- AABB physics (`physics.js`)
- Recorder rolling-buffer pattern (`recorder.js`)
- Activator abstraction (`interaction.js`)
- Level data schema (platforms, interactables, typed entities with IDs)
- Held / just-pressed input pattern (`input.js`)
- Solid-phase timing rule (1500 ms window, per-Remnant flag)

### Prototype-only (redesign or discard)
- Canvas 2D renderer — replace with sprite/3D renderer
- `game.js` state object — too flat; a full version needs a proper scene graph or ECS
- `feedback-ui.js` — playtest-only
- `analytics.js` — replace with a proper telemetry pipeline
- `hints.js` — replace with authored level-specific triggers
- Observation mode — playtest utility, not a game feature
