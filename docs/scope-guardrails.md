# Scope Guardrails

> **Project:** Remnant Lite → Full Version  
> **Document purpose:** Protect the project from scope creep.  
> The prototype's strength is its clarity.  This document is a guardrail, not a ceiling.

---

## What Should Not Be Added Too Early

The following features should not be added until the core mechanic is validated and the fundamental puzzle experience is solid.

### Combat
The Remnant mechanic is a spatial planning tool.  Combat introduces reaction-time demands that compete with planning.  Adding combat before the puzzle side is mature will dilute both.

### Story overload
A light narrative context can help.  A heavy story with cutscenes, dialogue, lore documents, and character development is a distraction.  The game should be understood through play, not read through text.

### Too many Remnant variants
The prototype has one Remnant type.  The design space for variant types (different physics, different solid timing, different activation rules) is large.  This space should only be explored after the base Remnant is exhaustively tested in complex puzzles.

### Large levels before small levels work
A large level amplifies every design weakness.  Long traversal distances hide puzzle logic.  Big spaces make it hard to see the full puzzle at once.  All levels should start small, readable, and completable without hints.

### Content quantity before content quality
Adding 20 levels of mediocre puzzles is worse than 8 excellent ones.  Puzzle quality (clarity, elegance, the "aha" moment) should be the metric, not level count.

### Heavy graphics before mechanic readability
Visual polish should follow, not lead.  The Remnant must be clearly readable as a ghost, as it approaches solidity, and as a solid platform.  Adding background art, lighting, or visual effects before this communication is clear will obscure the mechanic.

### Complex upgrade systems
No skill trees, no unlocks, no progression systems that modify how the Remnant behaves.  These add complexity before the player has fully internalised the base rules.

### Procedural or random puzzle generation
Procedural generation is hard to make puzzle-coherent.  Every puzzle in this game needs to be authored and tested to ensure the solution exists, is findable, and feels satisfying.

### Multiplayer / network features
The mechanic works alone.  Multiplayer is a separate product design question.  It should not be considered until the single-player experience is fully mature.

### Mobile-first redesign
Adapting the control scheme and UI for mobile before the desktop experience is excellent is an unnecessary distraction.  Mobile can be a later port.

---

## Criteria for Allowing a New Feature

Before adding any new mechanic, system, or content type, answer all of these questions:

1. **Does it deepen the core Remnant loop?**  
   The feature should make "plan the past, use the present" more interesting — not replace it with a different mechanic.

2. **Is the base case fully working first?**  
   Every new feature should rest on a stable foundation.  If the base Remnant mechanic still has known problems, those must be resolved first.

3. **Has the current state been playtested with new users?**  
   New features should not be added to solve problems that have not been observed with real players.

4. **Can the feature be removed if it does not work?**  
   Prefer features that are modular and can be cut without breaking everything else.

5. **Does it add visible complexity to the player's model?**  
   If a player needs to learn a new rule to understand the feature, that rule must be worth the cognitive load.

6. **Would a simpler version of this feature be enough?**  
   Start with the minimal version of any new idea.  Add complexity only if the minimal version proves insufficient.

---

## Questions to Ask Before Adding Anything

- "What problem does this solve for the player?"
- "What happens to a new player who encounters this for the first time?"
- "What does this cost in terms of design complexity, development time, and testing?"
- "Is there a simpler way to achieve the same goal?"
- "Would removing this make the game clearer?"
- "Has this been requested by multiple playtesters, or is it just an idea?"

---

## The Prototype's Core Strength

The Remnant Lite prototype works because it does one thing and does it clearly.  Players can hold the entire mechanic in their head after 60 seconds of play.

Every future feature must be held to the same standard:  
**If you cannot explain it in one sentence, it is probably too complex for this game right now.**
