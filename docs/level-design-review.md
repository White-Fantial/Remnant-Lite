# Level Design Review

> **Project:** Remnant Lite  
> **Document purpose:** Per-level analysis to guide future level design decisions.

---

## Level 01 — "Echo on the Switch"

### Intended lesson
Introduce the Remnant mechanic.  The player should discover that pressing R records their movement and plays it back, and that the replay can activate a button — affecting the world while the player is elsewhere.

### What the player is supposed to understand
- The button opens the door while something stands on it.
- Standing on the button and walking through the door at the same time is not possible alone.
- Pressing R creates a ghost of past movement.
- The ghost will retrace the path and stand on the button.
- While the ghost holds the button, the player can walk through.

### Likely confusion points
- **Not pressing R:** Some players explore the button and door without discovering R.  The hint system helps but fires late.  Level 1 should make the R key feel naturally inviting — perhaps by labelling the button with "press R" nearby.
- **Not understanding the reset:** When R is pressed, the player jumps back to spawn.  This is jarring without context.  Players sometimes interpret this as a bug.
- **Pressing R too early (before reaching the button):** A Remnant that never reached the button is useless.  Players who commit too early then do not know why it did not work.
- **Terminology:** The hint says "Leave a Remnant" but earlier UI says "Echo."  Players repeat the word they read last, which varies.

### What worked
- The room is small enough that the player can see the button, door, and goal simultaneously from spawn.
- The cause-and-effect of the button and door is immediately observable (step on it → door opens; step off → door closes).
- The gap between button and door is large enough that players quickly realise they cannot dash through in time.

### What should change in a full version
1. Add a clear R-key prompt on or near the button area.
2. Make the player reset animation more deliberate (a brief flash or warp effect) so it feels intentional.
3. Unify terminology: pick "Remnant" or "Echo" and use it everywhere.
4. Consider a brief introductory animation or tooltip on first run showing what R does.
5. Increase the visual distinctiveness of the Remnant (colour, trail) so it is obviously the player's past self.

---

## Level 02 — "Past Self, Open the Way"

### Intended lesson
Reinforce the mechanic from level 1.  The player should now use the Remnant intentionally rather than discovering it by accident.

### What the player is supposed to understand
- The same button-door-goal pattern as level 1.
- The button is close enough to reach, but far enough from the door that leaving the button closes it before you can pass through.
- The Remnant must be deliberately positioned on the button.

### Likely confusion points
- **Level feels identical to level 1:** The visual layout is similar.  Players who solved level 1 by luck may not register that level 2 is testing deliberate application.
- **Spatial constraint not obvious:** The reason the player cannot sprint through (distance between button and door) is not communicated visually.  Players may attempt the sprint repeatedly before committing a Remnant.
- **Remnant does not start at the button:** If the player committed a Remnant from spawn (e.g. to test the mechanic again), the Remnant replays from spawn and never reaches the button.  The level does not communicate "your Remnant needs to be standing on the button."

### What worked
- For players who understood level 1, level 2 was solvable with minimal additional explanation.
- The level confirmed that the mechanic generalises: button → door → goal is a reusable pattern.

### What should change in a full version
1. Visually differentiate level 2 from level 1 more clearly (different room shape, different button/goal placement).
2. Add a visual indicator showing the required Remnant placement (e.g. a glowing footprint on the button).
3. Consider making the spatial constraint more intuitive — perhaps a very narrow gap that visibly snaps shut when the player steps off.
4. Add a brief replay of the level 1 insight moment so it is clear this level is building on it.

---

## Level 03 — "Solid at the End"

### Intended lesson
Introduce the solid-phase mechanic.  The player should discover that the Remnant becomes physically solid near the end of its replay, and that it can be used as a platform to reach otherwise unreachable geometry.

### What the player is supposed to understand
- The high ledge is unreachable from a ground jump (mathematical fact: jump apex is below ledge top).
- The Remnant starts as a ghost (intangible).
- Near the end of its replay, the Remnant changes state (bright outline, "SOLID" label) and becomes a physical platform.
- If the player positions the Remnant's final state under the ledge, they can jump from the Remnant to the ledge.

### Likely confusion points
- **Noticing the visual state change:** The Remnant's outline brightening is subtle.  Players watching for where to go (the goal, the ledge) may not notice the Remnant's appearance change.
- **Understanding that the solid phase is timed:** Players who jump onto the Remnant early (during the ghost phase) fall through.  Without a visual warning, this feels like a bug.
- **Choosing where to stop the run:** The mechanic requires the player to stop their run in a specific position so the Remnant solidifies there.  This is the first time the game requires the player to plan the *end position* of their run, not just the path.  This is the hardest conceptual leap.
- **The hint is not quite enough:** The hint "End your run under the ledge. When your past self solidifies, jump on it." is accurate but assumes the player understands "solidifies."

### What worked
- Players who understood the solid-phase transition reported the highest "aha" moments in the session.
- The level geometry is clearly designed around the mechanic (the ledge is obviously just out of reach).
- The goal zone is visibly placed on the ledge, communicating where the player needs to reach.

### What should change in a full version
1. Add a clear visual and audio cue as the Remnant approaches its solid phase (progress bar, colour ramp, growing sound effect).
2. Add a "ghost phase" visual indicator when the player tries to land on the Remnant before it is solid (a visual "not yet" rather than silent pass-through).
3. Consider adding a pre-level diagram or silhouette showing a figure standing on a ghost that solidifies — purely visual, no text.
4. Make the "end your run here" positioning more forgiving: a wider solid-phase window or a visible landing zone marker below the ledge.
5. This level has the strongest mechanic moment of the three; it should come later in the sequence, after more intermediate steps build up to the solid-platform concept.

---

## General Level Design Observations

### What worked across all levels
- All three levels are visible in their entirety from spawn — no camera scrolling or hidden areas.
- The goal zone is always visible from the start.
- The levels are short enough that failed runs are not frustrating.

### What should change in a full version
1. **More intermediate steps between levels 1 and 3.**  The jump from "Remnant presses button" to "Remnant is a platform" is large.  At least 2–3 intermediate levels should explore variations of button-door puzzles before introducing the solid phase.
2. **Distinct visual themes per level.**  Currently all three look the same (grey rectangles).  Visual differentiation helps players understand they are in a new context.
3. **Authored hint triggers per level.**  The current hint system fires on a generic timer.  Each level should have specific hint messages tied to player behaviour (e.g. "walked past button 3 times → hint: try standing on it").
4. **Level-specific Remnant limit.**  Currently the limit is global (2).  Some levels may work better with exactly 1 Remnant; others may require 2.  The limit should be per-level.
5. **Stronger "impossible without Remnant" moments.**  All three levels can technically be attempted without a Remnant (the player just cannot succeed).  The visual design should make the impossibility of the non-Remnant path more obvious — e.g. a gap the player can see but clearly cannot jump.
