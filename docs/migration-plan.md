# Migration Plan

> **Project:** Remnant Lite  
> **Document purpose:** How to evolve the prototype into a fuller game.  
> This document is the primary reference for the next development decision.

---

## Option A — Continue in Web (JavaScript / Canvas or WebGL)

### When this makes sense
- The team wants to keep iteration fast (no compile step, instant browser preview).
- The next milestone is more puzzle levels and stronger onboarding, not visual quality.
- The project needs to be shareable as a URL without installation.
- The team has web skills and no Unreal expertise.

### What must be improved before continuing in web

| Area | Required change |
|---|---|
| Controller feel | Add acceleration / deceleration, better jump curve |
| Renderer | Move from Canvas 2D to WebGL (PixiJS or custom) or at minimum add sprite sheet support |
| Level format | Convert level JS objects to JSON; add a simple level loader |
| Audio | Design and implement real sound assets using Web Audio |
| Replay system | Validate that Remnant positions handle dynamic level state (moving platforms, sequential buttons) |
| Save system | Add localStorage for level progress |
| Mobile input | Add on-screen touch controls |

### Likely next features (web continuation)

1. 5–8 additional puzzle levels with escalating complexity
2. Multi-button puzzles requiring two Remnants to cooperate
3. Timed elements (buttons that only stay pressed for N seconds)
4. Stronger visual communication for solid-phase transition
5. Real sound design
6. Level select screen

---

## Option B — Rebuild in Unreal (or another full engine)

### When this makes sense
- The next milestone requires 3D, or physics that Canvas cannot support.
- The team has Unreal experience and wants production-quality feel.
- The project is targeting console or a commercial release.
- Character controller feel is a priority that web cannot achieve at acceptable cost.

### What transfers conceptually

These systems are engine-agnostic and should be reproduced faithfully:

| System | What to preserve |
|---|---|
| Recorder | Rolling-buffer snapshot at fixed interval; normalised timeline on commit |
| Replay | Linear interpolation of position + discrete properties; binary search between samples |
| Solid-phase rule | Last N seconds of replay = physical collision enabled; stays solid after replay ends |
| Activator pattern | Decouple "who can press buttons" from "what buttons do"; include both player and Remnants |
| Level data schema | Typed interactables (button/door/goal) with ID-based targeting |
| FIFO Remnant eviction | When limit is exceeded, evict the oldest |

### What should be rewritten from scratch

| Area | Reason |
|---|---|
| Physics | Use the engine's character movement component; do not port the AABB system |
| Rendering | Use engine materials, animations, lighting; no canvas draw calls |
| Input | Use the engine's input system; map the same conceptual actions |
| Level loading | Use the engine's level/map system; export level data from the level editor |
| Audio | Use the engine's audio system with designed assets |
| Analytics | Use a proper telemetry pipeline or engine plugin |

### Prototype lessons that matter most in Unreal

1. **Controller feel is critical** — The AABB physics was acceptable for a prototype but would feel wrong in Unreal.  Spend time on the character controller before building puzzles.

2. **Keep the mechanic clock running in real time** — The recorder must capture actual elapsed time, not engine ticks, to keep replay faithful.

3. **Solid-phase visual must be obvious** — A subtle outline is not enough in 3D.  The Remnant needs a material change, particle effect, or audio cue to communicate the transition.

4. **The level must be readable at a glance** — In Unreal the camera distance, prop placement, and silhouettes all matter.  Do not add visual noise before the puzzle logic is clear.

5. **Replay-against-dynamic-state is the hard problem** — If a Remnant walks through a door that is now closed (because the player did not hold the button), the Remnant clips through geometry.  Decide explicitly whether Remnants should collide with dynamic level state during replay, and design around that rule.

### What should not be copied literally

- The `game.js` flat state object — use a proper component or subsystem architecture.
- The `feedback-ui.js` DOM overlay — use in-world or engine-native UI.
- The `console.log` commit messages — use a proper logging system.
- The observation mode (O key, 0.3×) — this was a playtest hack; ship a proper pause/slow-mo feature or remove it.

---

## Migration Priorities (Any Path)

In order of importance, regardless of which option is chosen:

1. **Preserve mechanic clarity** — Do not add features that obscure the core "plan the past, use the present" loop.

2. **Improve character controller feel** — Players must trust the controls before they can think about puzzles.

3. **Rebuild the replay system more robustly** — Handle edge cases: very short timelines, Remnants encountering changed geometry, multiple Remnants interacting.

4. **Redesign levels with stronger onboarding** — Level 1 should be nearly impossible to misunderstand.  The "aha" moment for the Remnant mechanic should happen within the first 60 seconds.

5. **Add proper visual communication for solid phase** — The transition from ghost to solid must be unmistakable.

6. **Add real audio** — Sound cues for commit, solid transition, button press, and goal are the minimum set.

7. **Validate with a wider playtest before adding content** — Get the foundation right before building more levels.

---

## What to Avoid Losing

The most important lesson from the prototype:

> The mechanic's strength is its simplicity.  The player does one thing (move) and the game turns that movement into a tool.  Every layer of complexity should deepen that loop, not compete with it.

Do not let migration become an opportunity to add combat, story, or systems before the core is proven in a fuller context.  See [scope-guardrails.md](./scope-guardrails.md).
