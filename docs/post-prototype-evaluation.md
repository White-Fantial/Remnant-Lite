# Post-Prototype Evaluation

> **Prototype:** Remnant Lite  
> **Phases completed:** 1–11  
> **Status:** Playtest-ready, tutorial complete (3 levels)

---

## What Worked

### Remnant mechanic was understandable without explanation
Players who explored freely discovered that pressing R recorded their past movement and replayed it.  The replay is visual and immediate — watchers could observe the ghost figure retrace the path they had just walked.  The mechanic communicated itself through observation rather than instruction.

### Button / door interaction through Remnants felt intuitive
Once a player understood that the Remnant replays movement, the button-door puzzle (levels 1–2) followed naturally.  Players quickly reasoned: "if my past self stands on the button, the door stays open."  The spatial logic clicked because the button, door, and goal are all visible at once.

### Solid-phase twist created a distinct "aha" moment
Level 3 introduced the idea that a Remnant becomes physically solid near the end of its replay.  The visual change (bright outline, "SOLID" label) clearly communicated the state transition.  Players who discovered this reported surprise — the Remnant going from ghost to platform was a memorable beat.

### Final-seconds solidity encouraged deliberate planning
Because the Remnant is only solid during the last ~1.5 seconds of playback, players had to plan *where* to stop their run.  This created meaningful choice: the run itself became a design decision, not just movement.

### Three-level tutorial arc was achievable
Level 1 (observe the button effect) → Level 2 (replicate the solution intentionally) → Level 3 (use the Remnant as a platform) is a clean escalation.  Players were not overwhelmed and had enough context at each step.

### Observation mode (O key, 0.3× time scale) helped during playtesting
Slowing the game down let players watch the Remnant replay at a comfortable pace during the learning phase.  This was especially useful for level 3 where the solid-phase timing window was otherwise hard to observe.

### Analytics and session export worked cleanly
The in-memory event logger (analytics.js) and E-key JSON export functioned correctly.  The exported file contained enough signal to evaluate player behaviour without requiring a backend.

---

## What Did Not Work Well

### Remnant timing feedback was not clear enough
Players sometimes did not know when the solid phase would begin during a replay.  The visual cue (outline change) was present but subtle enough to miss if the player was not watching the Remnant closely.  A progress bar, colour ramp, or audio cue tied to the approach of the solid phase would help.

### Controls felt prototype-level
Movement worked correctly but lacked polish.  The horizontal deceleration was instant (velocity set to 0 each frame), which felt stiff compared to platformers players are used to.  Coyote time and jump buffering were implemented but players still occasionally felt the jump was "unresponsive."

### Some tutorial beats were too subtle
Level 1's intended lesson ("leave a Remnant on the button") assumed players would experiment with R naturally.  Players who did not press R early had no fallback guidance.  The contextual hint system (hints.js) was a partial fix but the hints appeared too late in some test sessions.

### "Echo" vs "Remnant" terminology was inconsistent
The in-game hint text said "Echo" (the working term during early phases) while some code comments and older UI messages still used "Remnant."  This inconsistency caused mild confusion when players tried to describe the mechanic.

### Level 2 felt nearly identical to Level 1
Both levels used a floor button + door + goal layout.  The intended difference (button distance from door makes the solution require a Remnant) was not visually obvious.  A first-time player could complete level 2 by copying level 1's solution without realising the spatial constraint had changed.

### No clear fail state visual
When a player fell out of bounds the "Run Failed" message appeared but the camera did not move.  The transition back to spawn was abrupt.  Players occasionally did not register that a fail-restart had occurred.

---

## What Remains Uncertain

### Whether 2 Remnants is the right limit
The `maxRemnants = 2` rule was designed to prevent overcrowding but was never stress-tested in puzzle design.  It is unclear whether 2 Remnants is enough to support more complex puzzles, or whether the limit should be configurable per level.

### Whether the system scales to harder puzzles
All three prototype levels use a single button and a single door.  It is unknown how the mechanic holds up with multiple buttons, multiple doors, timed sequences, or puzzles requiring two Remnants to cooperate.

### Whether the "aha" moment is reliable
The solid-phase discovery in level 3 worked well in early tests but was not reached by all players in the same way.  It is uncertain whether the onboarding is reliable enough across a wider player population.

### Whether the idea is strong enough for longer play sessions
Three levels is a short session (~5–10 minutes).  It is unknown whether the mechanic has enough depth to sustain 20–30 minutes of play without feeling repetitive.

### Whether narrative framing helps or hurts
The prototype had no story.  Early testers did not miss it, but it is unclear whether adding a light narrative ("you are revisiting your own past") would strengthen the mechanic's emotional resonance or distract from the puzzle clarity.
