# Next-Step Decision

> **Project:** Remnant Lite  
> **Document purpose:** Executive summary and recommended next move.

---

## Is the Idea Worth Continuing?

**Yes.**

The core mechanic — the player commits a recording of their own movement, which replays as a ghost that affects the world and eventually solidifies into a platform — is a genuinely novel idea with clear puzzle potential.  The prototype demonstrated this in a playable form.

---

## Why

### Strong mechanic identity
The "plan the past for the present" concept is memorable and distinct.  It is not a clone of an existing mechanic.  The closest references (Braid, time-rewind games) approach time from a different angle.  Remnant Lite's mechanic is about *depositing* a copy of yourself, not rewinding time.

### Memorable puzzle hook
The button-door-Remnant puzzle pattern generated reliable "aha" moments in playtesting.  Players who understood the mechanic immediately began thinking about what path their Remnant would take — evidence that the planning loop was engaging.

### Clear "aha" potential
The moment when the Remnant solidifies and becomes a standing platform is a strong discovery beat.  Players who reached this moment expressed genuine surprise.  This kind of discovery is rare and worth building on.

### Low complexity for high strategic depth
The mechanic has one rule with several consequences.  Players only need to learn: "press R to leave a ghost."  Everything else — the ghost pressing buttons, the ghost becoming a platform — follows from that one rule.  This is a good sign for scalability.

---

## What Must Improve Before Full Production

### 1. Character controller feel
Movement must feel responsive and trustworthy before players can think about puzzles.  The current instant-stop horizontal movement and stiff jump feel are acceptable for a prototype but will cause frustration in a production context.

**This is the most important foundation fix.**

### 2. Communication clarity
Three things must be clearly communicated to every player without text instructions:
- What the R key does (and when to press it).
- That the Remnant's ghost phase is intentional and temporary.
- That the Remnant's solid phase is approaching and usable.

None of these are reliably communicated in the current prototype.

### 3. Stronger puzzle cadence
Three levels is not enough to validate the mechanic's depth.  The next build needs 8–10 levels with a clear escalation curve: one-button puzzles → two-button puzzles → solid-phase platforming → combinations.

### 4. More robust replay handling
The current replay system does not handle edge cases: a Remnant that walks through geometry that has changed state since its run, very short recordings, or Remnants whose playback is interrupted by level events.  These must be defined and resolved.

### 5. Real audio
Sound is not optional in a production context.  The mechanic needs audio feedback for commit, solid-phase onset, and goal.  The current Web Audio stubs are placeholder.

---

## Recommended Next Move

**Option: Design and validate a stronger vertical slice before committing to a platform.**

Specifically:
1. Fix the character controller feel (highest priority).
2. Design 8–10 tightly authored levels that cover the full mechanic space.
3. Run a structured playtest with 10+ new players using only the game (no verbal instructions).
4. Evaluate whether the mechanic holds up across the full level set.
5. Then decide: continue in web or rebuild in Unreal.

**Do not commit to Unreal before this step.**  An engine change is expensive.  The prototype has proven the *concept* but not the *depth*.  A deeper web version with better feel and more levels is cheaper to build and will produce a more confident production decision.

**Do not add new systems before this step.**  Combat, story, progression, and multiplayer are all premature.  The core loop must be fully validated first.

---

## Alternative: Rebuild in Unreal Immediately

This is viable if:
- The team has strong Unreal experience and the web stack is a bottleneck.
- The character controller feel is considered a hard blocker that web cannot solve.
- The project has secured production resources (team, budget, timeline).

If rebuilding in Unreal, follow the migration plan in [migration-plan.md](./migration-plan.md) closely — especially the guidance on what to preserve and what to discard.

---

## Summary

| Question | Answer |
|---|---|
| Is the mechanic worth continuing? | Yes |
| Is the prototype sufficient to ship? | No |
| What is the highest-priority fix? | Character controller feel |
| What is the recommended next milestone? | Vertical slice: 8–10 levels, fixed controls, structured playtest |
| Should the engine change now? | No — validate depth first |
| What is the biggest risk? | Adding scope before the core is fully validated |
