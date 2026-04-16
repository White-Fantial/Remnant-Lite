# Production Backlog Proposal

> **Project:** Remnant Lite → Full Version  
> **Document purpose:** Proposed next backlog, organised by category and priority.  
> Priority key: **Must Have** | **Should Have** | **Nice to Have** | **Later / Unknown**

---

## Core Mechanics

| Item | Priority | Notes |
|---|---|---|
| Improved character controller (acceleration, deceleration, better jump curve) | **Must Have** | Prototype movement is functional but not polished |
| Solid-phase visual and audio feedback (clear transition cue) | **Must Have** | Current visual is too subtle; players miss the window |
| Remnant replay handles dynamic level state (closed doors during replay) | **Must Have** | Edge case exists in prototype; undefined behaviour |
| Configurable Remnant limit per level | **Should Have** | Currently hardcoded to 2 globally |
| Timed buttons (press window expires after N seconds) | **Should Have** | Enables more complex puzzle designs |
| Two-Remnant cooperative puzzles | **Should Have** | Core of the "plan ahead" skill scaling |
| Remnant replay speed control (replay at custom rate) | **Nice to Have** | Could create timing-based puzzles |
| Remnant type variants (heavier, faster, different solid timing) | **Later / Unknown** | Do not add until base mechanic is fully validated |

---

## Level Design

| Item | Priority | Notes |
|---|---|---|
| Level 1 redesign for stronger zero-assumption onboarding | **Must Have** | Current level 1 requires some prior understanding |
| 5–8 new puzzle levels with escalating complexity | **Must Have** | 3-level tutorial is too short for full validation |
| Levels requiring two simultaneous Remnants | **Should Have** | Tests the limit mechanic meaningfully |
| Levels with vertical layouts (Remnant as lift/platform chain) | **Should Have** | Solid-phase mechanic has untapped vertical potential |
| Level select screen with completion tracking | **Should Have** | Quality-of-life for repeated playtesting |
| Level editor or JSON-driven level loader | **Should Have** | Current JS-object format requires code changes to edit levels |
| Authored hint triggers per level (replace timer-based hints) | **Should Have** | Current hints are generic and time-based |
| Death / fail feedback (clearer visual when out of bounds) | **Should Have** | Current "Run Failed" message is easy to miss |
| Large "impossible without Remnant" levels | **Nice to Have** | Stress-test the mechanic at scale |
| Hidden shortcuts enabled by clever Remnant placement | **Nice to Have** | Rewards mastery |

---

## UX / Onboarding

| Item | Priority | Notes |
|---|---|---|
| First-run tutorial that explicitly shows the R key action | **Must Have** | Current: players must discover R themselves |
| Clearer Remnant commit feedback (animation, audio, screen flash) | **Must Have** | Current feedback is a sound stub and a console log |
| Consistent terminology throughout (pick one: Remnant or Echo) | **Must Have** | Current codebase uses both |
| Solid-phase approach indicator (progress bar or glow ramp) | **Must Have** | Players need to anticipate the solid phase |
| Pause menu | **Should Have** | No pause currently exists |
| In-game control reminders (key legend overlay) | **Should Have** | Controls are listed only in README |
| Accessible text sizing and contrast | **Should Have** | Current HUD text is small and low-contrast |
| Mobile / gamepad input | **Nice to Have** | Currently keyboard-only |

---

## Visual Language

| Item | Priority | Notes |
|---|---|---|
| Consistent visual language for ghost vs solid Remnant state | **Must Have** | Current difference (outline brightness) is too subtle |
| Sprite or character art for player and Remnants | **Should Have** | Currently both are coloured rectangles |
| Interactable states communicated visually without text | **Should Have** | Currently buttons/doors rely on colour labels |
| Background / environment art | **Nice to Have** | Not needed until mechanic readability is solid |
| Particle effects for commit, solid phase, goal | **Nice to Have** | Polish layer |
| Lighting system | **Later / Unknown** | Significant complexity; not needed yet |

---

## Audio

| Item | Priority | Notes |
|---|---|---|
| Designed sound effects for commit, solid phase transition, button, door, goal | **Must Have** | Currently stubs only |
| Remnant "solidifying" sound cue (audio equivalent of visual transition) | **Must Have** | Critical for eyes-free timing awareness |
| Background ambient audio | **Should Have** | Minimal ambience helps spatial presence |
| Music | **Nice to Have** | Not critical for mechanic validation |
| Adaptive audio (music reacts to Remnant count or phase) | **Later / Unknown** | Complex; defer until audio basics are done |

---

## Content Pipeline

| Item | Priority | Notes |
|---|---|---|
| JSON level format with a loader | **Should Have** | Enables non-code level authoring |
| Level validation tool (checks for unsolvable configurations) | **Should Have** | Prevents broken levels from reaching players |
| Asset pipeline (sprites, audio loading) | **Should Have** | Required before any production art |
| Automated level smoke test (solver or sanity check) | **Nice to Have** | Would catch regression in level changes |

---

## Save / Progression

| Item | Priority | Notes |
|---|---|---|
| Level completion tracking (localStorage or equivalent) | **Should Have** | Currently all progress is lost on refresh |
| Session resumption | **Should Have** | Players should not restart from level 1 after closing the browser |
| Per-level best-time tracking | **Nice to Have** | Speed-run layer; low priority |
| Global progression / unlock system | **Later / Unknown** | Adds complexity before mechanic depth is proven |

---

## Tooling

| Item | Priority | Notes |
|---|---|---|
| Remove console.log from production paths | **Must Have** | Current `updateRemnantRecorder` logs every commit |
| Level editor (even basic: drag-and-drop platform placement) | **Should Have** | Greatly speeds up puzzle iteration |
| Automated syntax / lint check in CI | **Should Have** | Currently no CI |
| Playtest data aggregation tool | **Nice to Have** | Currently: manual review of individual JSON exports |

---

## Playtest & Analytics

| Item | Priority | Notes |
|---|---|---|
| Wider playtest of onboarding (10+ participants, new to game) | **Must Have** | Core validation step before building more content |
| Analytics for solid-phase discovery timing | **Should Have** | Key metric: when do players first land on a solid Remnant? |
| Session replay or heatmap tooling | **Nice to Have** | Would show where players get stuck spatially |
| Formal playtesting protocol with structured interview | **Should Have** | Currently ad hoc |

---

## Future / Stretch Ideas

These should not be started until the core mechanic is validated in a fuller context.

| Item | Priority |
|---|---|
| Narrative framing ("you are revisiting your own timeline") | **Later / Unknown** |
| Multiple Remnant types (different physics, different solid timing) | **Later / Unknown** |
| Remnants that interact with each other | **Later / Unknown** |
| Time-rewind as a separate mechanic layer | **Later / Unknown** |
| Procedurally generated puzzle rooms | **Later / Unknown** |
| Co-op mode (two players, shared Remnant pool) | **Later / Unknown** |
| Competitive mode (race against opponent's Remnant) | **Later / Unknown** |
