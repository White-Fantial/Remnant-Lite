# Remnant Lite

A small puzzle-platformer prototype built with plain JavaScript and the Canvas API — no frameworks, no build step.

You leave behind an **Echo** (a ghost replay of your past movements) that can interact with the world while you move freely.  
Use it to hold buttons, open doors, and reach places your present self cannot.

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

- Did you understand what the Echo does **without** being told?
- Was there a moment when it "clicked"?
- What was the most confusing or frustrating part?
- Did the controls feel responsive?

---

## How to Export Session Data

Press **E** at any time during or after a session.  
A JSON file named `remnant_playtest_YYYYMMDD.json` will download automatically.

The file contains:
- **events** — timestamped log of every action (level starts, fails, echo commits, etc.)
- **sessionMetrics** — total time, total echoes, total restarts, levels completed
- **feedback** — your answers from the feedback form (if submitted)
- **insightMoments** — first-time discovery events (first echo commit, first door opened by echo, etc.)

If the download fails (e.g. on a `file://` origin), the data is printed to the browser console as JSON.

---

## Success Criteria

The prototype is considered successful if testers:

✅ Understand the Echo mechanic without explanation  
✅ Intentionally plan Echo usage  
✅ Report "aha" moments  
✅ Find controls responsive

The prototype needs redesign if testers:

❌ Don't understand what the Echo does  
❌ Use trial-and-error instead of planning  
❌ Ignore the Echo mechanic entirely  
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
    remnant.js          ← Echo entity definition
  systems/
    recorder.js         ← timeline recording
    replay.js           ← Echo playback
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
