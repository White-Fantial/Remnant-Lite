# Mechanics Reference

> **Project:** Remnant Lite  
> **Document purpose:** Authoritative rules reference for the prototype.  
> Another developer should be able to reimplement these rules from this document alone.

Rule entries are marked:
- **[Prototype]** — the current Lite implementation.
- **[Future idea]** — a possible variant or extension for a full version.

---

## 1. Player Movement

### Horizontal movement
**[Prototype]** The player moves left or right at a fixed speed of **280 px/s**.  
Velocity is set directly each frame from input — there is no acceleration or deceleration.  
If no key is held, horizontal velocity is 0.

**[Future idea]** Add acceleration / friction ramp for a smoother feel.

### Vertical movement / gravity
**[Prototype]** Gravity is **1800 px/s²** applied continuously.  
Jump velocity is **−620 px/s** (upward, Y axis inverted).  
The player cannot double-jump.

### Coyote time
**[Prototype]** The player has **100 ms** of coyote time after leaving a ledge.  
During this window a jump is still accepted even though `isGrounded` is false.

### Jump buffering
**[Prototype]** A jump input is remembered for **120 ms**.  
If the player lands within the buffer window, the buffered jump fires immediately on landing.

### Bounds clamping
**[Prototype]** The player is clamped to the canvas horizontal bounds (0 to 800 px).  
Falling below the death threshold triggers failure (see §9).

---

## 2. Remnant Creation (Recorder)

### What is recorded
**[Prototype]** The recorder captures the player's full state at a fixed interval.  
Each snapshot stores: `time` (ms), `x`, `y`, `vx`, `vy`, `facing` (1 or −1), `isGrounded`.

### Sample rate
**[Prototype]** One snapshot every **50 ms** (20 samples/second).

### Buffer length
**[Prototype]** The recorder retains the **last 5 seconds** of snapshots.  
Older samples are trimmed each frame.

### Committing a Remnant
**[Prototype]** Press **R** to commit.  
The current buffer (up to 5 s) is frozen into a Remnant's timeline.  
Time values are normalised so the first snapshot is at `t = 0`.  
The player immediately resets to the level spawn.  
A fresh empty recorder starts for the next run.

### Minimum samples
**[Prototype]** A Remnant is only created if the buffer contains **≥ 3 snapshots**.  
Pressing R immediately after spawning produces no Remnant.

---

## 3. Remnant Limit

**[Prototype]** A maximum of **2 Remnants** can be active at once.  
When a third is committed, the **oldest Remnant is evicted** (FIFO).  
The player receives a brief on-screen message: "Oldest Echo Removed."

**[Future idea]** Make the limit configurable per level via level data.

---

## 4. Remnant Playback

### Replay start
**[Prototype]** The Remnant begins replaying from `t = 0` (first snapshot) immediately when created.

### Position interpolation
**[Prototype]** The Remnant's position is **linearly interpolated** between adjacent snapshots.  
Discrete fields (`facing`, `isGrounded`) snap at the midpoint of each interval.

### Replay end
**[Prototype]** When `currentTime >= duration`, the Remnant is marked `isFinished = true` and `isPlaying = false`.  
It freezes at its final position.  
The `isSolidToPlayer` flag is **not changed** on finish — if the Remnant was in solid phase when it finished, it stays solid permanently.

---

## 5. Solid-Phase Rules

### Solid phase window
**[Prototype]** The final **1500 ms** of each Remnant's timeline is the solid phase.  
`solidPhaseStartTime = max(0, duration − 1500)`.  
For timelines shorter than 1500 ms, the entire replay is solid.

### Physical solidity
**[Prototype]** A Remnant is **physically solid to the player** only when `isSolidToPlayer = true`.  
Solid Remnants are added to the collision pipeline as AABB colliders.  
The player can stand on them, be blocked by them, and jump from them.

### Ghost phase
**[Prototype]** Before the solid phase, the Remnant is **intangible** — the player walks through it with no collision.  
Buttons can still be activated during the ghost phase (see §6).

**[Future idea]** Add a visual "warning flash" or colour ramp as the solid phase approaches so the player can anticipate it.

---

## 6. Activator (Button Interaction) Rules

### Who can activate buttons
**[Prototype]** Both the **live player** and all **active Remnants** can activate buttons.  
Activation is checked every frame via AABB overlap.

### Activation throughout replay
**[Prototype]** A Remnant activates buttons during the **entire replay** — both ghost and solid phases.  
There is no restriction on when the Remnant can press buttons.

### Button state
**[Prototype]** A button's `isPressed` state is recalculated every frame from current overlaps.  
A button is pressed as long as at least one activator overlaps it.  
When all activators leave, the button immediately becomes unpressed.

---

## 7. Door Rules

### Door state
**[Prototype]** A door is **open** if at least one button that targets it (`button.targets` array) is currently pressed.  
A door is **closed** otherwise.

### Door as collider
**[Prototype]** Closed doors are included in the AABB collision pipeline.  
Open doors are excluded — the player and Remnants pass through freely.

### Button-to-door mapping
**[Prototype]** A button's `targets` array contains the IDs of the doors it controls.  
A single button can target multiple doors.  A single door can be opened by multiple buttons.

---

## 8. Goal Zone Rules

**[Prototype]** The level is complete when the live player's AABB overlaps a goal zone.  
Remnants do not trigger goal zones.  
Goal completion is latched — once reached it cannot be undone within the same level.

---

## 9. Fail / Restart / Progression Rules

### Fail condition
**[Prototype]** If the player's `y` position exceeds the level's `deathY` threshold (default 580 px), the run fails.  
`runState` is set to `'failed'` and a 1.5-second countdown begins.

### Auto-restart
**[Prototype]** After the fail countdown, the level reloads automatically.  
Active Remnants are cleared.  The recorder restarts.  The player resets to spawn.

### Manual restart
**[Prototype]** Press **T** at any time to restart immediately.  Counts as a restart in metrics.

### Level advance
**[Prototype]** After reaching the goal, press **N** to advance to the next level.

### Level back
**[Prototype]** Press **P** at any time (when not in fail state) to go to the previous level.

### Session end
**[Prototype]** After completing the last level, the game transitions to a game-complete screen.  
A feedback overlay appears for optional structured feedback.  
Press **Enter** or **R** to replay from level 1.

---

## 10. HUD and UI Rules

**[Prototype]** The HUD shows: level name, current Remnant count / max, and elapsed time.  
Timed centred messages (e.g. "Level Complete!") fade out after their duration.  
Debug overlay (F1 / backtick) shows frame-rate, player position, and Remnant state.

---

## 11. Observation Mode

**[Prototype]** Press **O** to toggle observation mode.  
When active, `effectiveDt = dt × 0.3` — the game runs at 30% speed.  
This was added to help playtesting; it is not a gameplay mechanic.

**[Future idea]** Remove or gate behind a developer flag in a public release.
