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
| `← → ` / `A D` | Move left / right |
| `↑` / `W` / `Space` | Jump |
| `R` | Leave an Echo (record your path, then replay it) |
| `T` | Restart the current level |
| `N` | Advance to the next level (after completing a level) |
| `F1` / `` ` `` | Toggle debug overlay |

---

## Game Flow

1. **Menu** — press **Enter** to start.
2. **Play** — work through 3 tutorial levels using the Echo mechanic.
3. **Level complete** — press **N** to continue to the next level.
4. **Tutorial complete** — press **Enter** or **R** to play again.

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
index.html          ← entry point (loads src/main.js as an ES module)
src/
  main.js           ← game loop
  game.js           ← state machine, update & render dispatch
  renderer.js       ← all Canvas draw calls
  input.js          ← keyboard state
  physics.js        ← AABB movement & collision resolution
  constants.js      ← shared numeric constants
  levels/
    index.js        ← ordered level list
    level-01.js
    level-02.js
    level-03.js
  entities/
    remnant.js      ← Echo entity definition
  systems/
    recorder.js     ← timeline recording
    replay.js       ← Echo playback
    interaction.js  ← button / door / goal logic
    audio.js        ← Web Audio sound hooks
  utils/
    debug.js        ← debug overlay rendering
```

---

## Tech

- Vanilla JavaScript (ES modules)
- Canvas 2D API
- No dependencies, no build step, no framework
