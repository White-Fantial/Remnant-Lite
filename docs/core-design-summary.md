# Core Design Summary

> **Project:** Remnant Lite  
> **Document purpose:** Concise validated design reference for guiding a full version.

---

## One-Line Pitch

> You leave behind a ghost of your recent past — and that ghost can hold doors open, press buttons, and become a platform you can stand on.

---

## Player Fantasy

The player is their own best teammate.  Every run is also a setup for the next run.  The skill is not speed or reaction — it is **planning the past so the present can succeed**.

The core feeling to preserve:  
*"I'm going to walk this path so that my future self can use me as a stepping stone."*

---

## Core Loop

1. **Explore** — the player moves freely, observing buttons, doors, platforms, and the goal.
2. **Plan** — the player decides what path their past self needs to take.
3. **Commit** — press R to capture the last ~5 seconds of movement as a Remnant.
4. **Reset** — the player returns to spawn; the Remnant begins replaying.
5. **Act** — the player uses the live environment (Remnant pressing buttons, Remnant becoming a platform) to reach the goal.
6. **Repeat or succeed** — if the solution was wrong, plan again.

---

## Mechanic Rules (Summary)

Full rules are documented in [mechanics-reference.md](./mechanics-reference.md).

| Property | Value |
|---|---|
| Recorder buffer | Last 5 seconds of movement |
| Sample rate | Every 50 ms |
| Remnant limit | 2 active at once (oldest evicted) |
| Solid-phase window | Final 1500 ms of replay |
| Button activation | Throughout entire replay |
| Solid activation | Only during solid phase (and after) |

---

## What Makes the Idea Special

**The past is a resource.**  Most games treat time as a fixed axis.  Remnant Lite makes the player's recent movement into an object they can place in the world.

**Self-cooperation without a second player.**  The puzzle challenge is that the player cannot be in two places at once — but their past self can.  This creates spatial reasoning puzzles that feel clever without requiring multiplayer.

**Replay as stage prop.**  The Remnant is not just a visual effect.  It has physical presence that grows over time (ghost → solid).  This materiality makes the mechanic feel tangible and satisfying.

**Planning the past is a novel skill.**  Players are not used to asking "what should I have done?" as a forward-looking design decision.  This novelty is the mechanic's primary identity.

---

## What Must Not Be Lost in Future Development

These properties define the mechanic.  Losing any of them changes the game into something else.

1. **The Remnant replays real movement** — not an AI path or a scripted animation.  The player's actual inputs become the replay.  This makes mistakes matter and successes feel earned.

2. **The Remnant starts as a ghost and becomes solid** — this temporal arc is the emotional hook.  The player watches their past self and at a certain moment gains a new tool.  Removing this collapses the mechanic into a simple co-op button press.

3. **The player resets to spawn after committing** — this forces a clean break between "the run that created the Remnant" and "the run that uses it."  Without the reset, players can overlap their actions and the planning dimension disappears.

4. **The puzzle environment reacts to the Remnant** — buttons stay pressed, doors stay open, platforms are usable.  The Remnant must affect the world, not just be visible.

5. **The buffer is short enough to require intentional planning** — a 5-second window means the player cannot simply move for 60 seconds and then commit.  The constraint forces deliberate final positioning.

---

## Evolved Concept (vs Original Assumptions)

| Original assumption | Evolved understanding |
|---|---|
| Remnant is a "death replay" | Remnant is a committed action, not tied to death |
| Timing was the main challenge | Spatial planning is the main challenge |
| Ghost is primarily visual feedback | Ghost is a physical puzzle element |
| One Remnant is enough | Two Remnants open more puzzle possibilities |
| Mechanic needs explanation | Mechanic communicates itself if the level is designed well |
