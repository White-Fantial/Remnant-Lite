# Project Pitch

> **Project:** Remnant Lite  
> **Status:** Prototype complete — seeking production decision

---

## Title

**Remnant** *(working title)*

---

## One-Line Pitch

> A puzzle-platformer where you leave behind a ghost of your recent past — and that ghost can hold doors open, press buttons, and become a platform you can stand on.

---

## Core Mechanic

At any moment, the player can press **R** to commit a recording of their last 5 seconds of movement.

That recording replays as a **Remnant** — a ghost figure that retraces the path exactly.

The Remnant is initially intangible (ghost phase): it moves through the world, activates buttons, and opens doors — all while the player is free to act elsewhere.

Near the end of its replay, the Remnant **solidifies**: it becomes a physical platform the player can jump on, stand on, and use to reach otherwise unreachable places.

After solidifying, it stays solid at its final position indefinitely.

The puzzle challenge is not speed or reaction time — it is **planning the past so the present can succeed.**

---

## Why It Is Interesting

**Self-cooperation.**  The player is their own teammate.  Every run creates a tool for the next run.

**Planning as the core skill.**  Players do not ask "how fast can I move?" — they ask "where should I stop so my past self is useful?"

**Mechanic teaches itself.**  The replay is visual and immediate.  Players discover what the ghost does by watching it, not by reading instructions.

**Single rule, multiple consequences.**  One mechanic (leave a recording) produces three distinct puzzle tools: button-holder, door-opener, platform.  The depth comes from combining these, not from adding new systems.

---

## What the Prototype Proved

- Players understand the mechanic through observation — no manual required.
- The button-door-Remnant puzzle pattern reliably produces "aha" moments.
- The solid-phase twist (ghost → platform) is a memorable surprise.
- Three tutorial levels are completable by a player with no prior knowledge.
- The planning loop is engaging: players think before they commit.

---

## Current State

| Property | Value |
|---|---|
| Platform | Browser (plain JavaScript, no framework) |
| Levels | 3 tutorial levels |
| Session length | ~5–10 minutes |
| Input | Keyboard only |
| Playtest data | In-memory JSON export available |
| Live demo | Deploy via GitHub Pages (see README) |

---

## Next Milestone

**Vertical slice: 8–10 authored levels, polished controls, structured playtest.**

Goals:
1. Validate the mechanic holds up across more complex puzzles.
2. Confirm the character controller feel is sufficient for players to trust their inputs.
3. Run a structured playtest with 10+ new players (no verbal instructions).
4. Produce a production decision: continue in web or rebuild in Unreal.
