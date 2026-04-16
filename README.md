# Remnant Lite

A puzzle-platformer prototype built with plain JavaScript and the Canvas API — no frameworks, no build step.

---

## What Remnant Lite Is

Remnant Lite is a prototype for a spatial planning puzzle-platformer.

You leave behind a **Remnant** — a ghost replay of your recent movements — that can hold buttons, open doors, and eventually solidify into a platform you can stand on.

The core skill is **planning the past so the present can succeed**: deciding where to walk so that your past self is useful, then using the effects of that run to reach the goal.

Three tutorial levels demonstrate the mechanic without instruction — the game communicates through play.

---

## What It Proves

- Players understand the Remnant mechanic through observation, without reading a manual.
- The button-door-Remnant puzzle pattern reliably produces "aha" moments.
- The solid-phase twist — ghost becomes platform — is a memorable discovery beat.
- The planning loop is engaging: players think before they commit.

See [`docs/post-prototype-evaluation.md`](docs/post-prototype-evaluation.md) and [`docs/next-step-decision.md`](docs/next-step-decision.md) for a full assessment.

---

## Current Feature Set

- 3 tutorial levels with escalating complexity
- Remnant recording (last 5 s of movement) and replay
- Ghost phase (Remnant activates buttons) → solid phase (Remnant is a physical platform)
- Up to 2 active Remnants per level (oldest evicted on overflow)
- Menu, level-complete, and game-complete screens
- Playtest analytics: session export (E key), observation mode (O key, 0.3× speed)
- Contextual hint system
- Debug overlay (F1)

---

## Controls

| Key | Action |
|-----|--------|
| `← →` / `A D` | Move left / right |
| `↑` / `W` / `Space` | Jump |
| `R` | Commit a Remnant (records last ~5 s, resets to spawn) |
| `T` | Restart the current level |
| `N` | Advance to the next level (after completing a level) |
| `O` | Toggle Observation Mode (0.3× time scale) |
| `E` | Export playtest session data as JSON |
| `F1` / `` ` `` | Toggle debug overlay |

---

## How to Run Locally

Clone the repo and open `index.html` with any static file server.  
**No build step required.**

```bash
# Using Python (built into macOS / most Linux distributions)
python3 -m http.server 8080
# Then open http://localhost:8080 in your browser

# Using Node.js (npx)
npx serve .
```

> Opening `index.html` directly as a `file://` URL will **not** work because
> ES module imports require an HTTP origin.

---

## Controls

| Key | Action |
|-----|--------|
| `← →` / `A D` | Move left / right |
| `↑` / `W` / `Space` | Jump |
| `R` | Leave an Echo (record your path, then replay it) |
| `T` | Restart the current level |
| `N` | Advance to the next level (after completing a level) |
| `O` | Toggle Observation Mode (0.3× time scale) |
| `E` | Export playtest session data as JSON |
| `F1` / `` ` `` | Toggle debug overlay |

---

## Game Flow

1. **Menu** — press **Enter** to start.
2. **Play** — work through 3 tutorial levels using the Echo mechanic.
3. **Level complete** — press **N** to continue to the next level.
4. **Tutorial complete** — a short feedback form appears; a session summary is shown.  
   Press **Enter** or **R** to play again.

---

## Playtest Instructions

> **For testers:** Please play through without reading any hints first.  
> Try to figure out what the Echo does on your own.

### What to do

1. Run the game and play all 3 levels.
2. When the tutorial ends, fill in the short feedback form (or skip it).
3. Press **E** at any point (or after finishing) to download your session data as a JSON file.
4. Send the JSON file and any notes to the developer.

### What the developer wants to know

- Did you understand what the Remnant does **without** being told?
- Was there a moment when it "clicked"?
- What was the most confusing or frustrating part?
- Did the controls feel responsive?

---

## How to Export Session Data

Press **E** at any time during or after a session.  
A JSON file named `remnant_playtest_YYYYMMDD.json` will download automatically.

The file contains:
- **events** — timestamped log of every action (level starts, fails, Remnant commits, etc.)
- **sessionMetrics** — total time, total Remnants, total restarts, levels completed
- **feedback** — your answers from the feedback form (if submitted)
- **insightMoments** — first-time discovery events (first Remnant commit, first door opened by Remnant, etc.)

If the download fails (e.g. on a `file://` origin), the data is printed to the browser console as JSON.

---

## Success Criteria

The prototype is considered successful if testers:

✅ Understand the Remnant mechanic without explanation  
✅ Intentionally plan Remnant usage  
✅ Report "aha" moments  
✅ Find controls responsive

The prototype needs redesign if testers:

❌ Don't understand what the Remnant does  
❌ Use trial-and-error instead of planning  
❌ Ignore the Remnant mechanic entirely  
❌ Find timing frustrating

---

## GitHub Pages Deployment

The project runs directly from the repository root with no build step, making it straightforward to host on GitHub Pages.

### Enable GitHub Pages

1. Go to your repository on GitHub.
2. Open **Settings → Pages**.
3. Under **Branch**, select `main` (or your default branch) and set the folder to `/ (root)`.
4. Click **Save**.

After a minute or two, your game will be live at:

```
https://<your-username>.github.io/Remnant-Lite/
```

### Verify it works

- Open the Pages URL in your browser.
- You should see the **Remnant Lite** menu screen.
- No server-side code or build artifacts are needed.

---

## Project Structure

```
index.html              ← entry point (loads src/main.js + src/feedback-ui.js as ES modules)
src/
  main.js               ← game loop
  game.js               ← state machine, update & render dispatch
  renderer.js           ← all Canvas draw calls
  input.js              ← keyboard state
  physics.js            ← AABB movement & collision resolution
  constants.js          ← shared numeric constants
  feedback-ui.js        ← playtest feedback overlay logic
  levels/
    index.js            ← ordered level list
    level-01.js
    level-02.js
    level-03.js
  entities/
    remnant.js          ← Remnant entity definition
  systems/
    recorder.js         ← timeline recording
    replay.js           ← Remnant playback
    interaction.js      ← button / door / goal logic
    audio.js            ← Web Audio sound hooks
    analytics.js        ← in-memory event logger + JSON export
    hints.js            ← contextual hint system
  utils/
    debug.js            ← debug overlay rendering
```

---

## Tech

- Vanilla JavaScript (ES modules)
- Canvas 2D API
- No dependencies, no build step, no framework

---

## Documentation Index

| Document | Purpose |
|---|---|
| [`docs/post-prototype-evaluation.md`](docs/post-prototype-evaluation.md) | What worked, what did not, what remains uncertain |
| [`docs/core-design-summary.md`](docs/core-design-summary.md) | Validated concept — pitch, player fantasy, core loop, mechanic rules |
| [`docs/mechanics-reference.md`](docs/mechanics-reference.md) | Authoritative rules reference for the prototype |
| [`docs/technical-architecture.md`](docs/technical-architecture.md) | System responsibilities, update loop, data flow |
| [`docs/migration-plan.md`](docs/migration-plan.md) | How to evolve Remnant Lite into a fuller game |
| [`docs/production-backlog.md`](docs/production-backlog.md) | Proposed next backlog by category and priority |
| [`docs/scope-guardrails.md`](docs/scope-guardrails.md) | What should not be added too early — scope protection |
| [`docs/level-design-review.md`](docs/level-design-review.md) | Per-level analysis of intended lesson and recommended changes |
| [`docs/next-step-decision.md`](docs/next-step-decision.md) | Executive summary — is the idea worth continuing? |
| [`docs/project-pitch.md`](docs/project-pitch.md) | Short pitch-deck style summary for collaborators |
| [`CHANGELOG.md`](CHANGELOG.md) | Phase-by-phase changelog |
