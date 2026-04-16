// Renderer — responsible for all draw calls

import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from './constants.js';

// ---------------------------------------------------------------------------
// Menu screen
// ---------------------------------------------------------------------------

/**
 * Draw the main menu / title screen.
 * Renders animated ghost silhouettes drifting in the background so the player
 * gets a visual hint of the echo mechanic before pressing Start.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawMenuScreen(ctx) {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(100,120,200,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Animated ghost silhouettes drifting left-right in the background.
  // The 80 px overflow margin lets ghosts fully exit one edge before wrapping
  // back from the other side, avoiding a jarring instant jump.
  const GHOST_OVERFLOW_MARGIN = 80;
  const t = Date.now() / 1000;
  for (let i = 0; i < 5; i++) {
    const dir   = i % 2 === 0 ? 1 : -1;
    const speed = 28 + i * 8;
    const xRaw  = (i * 170 + t * speed * dir) % (CANVAS_WIDTH + GHOST_OVERFLOW_MARGIN);
    const x     = xRaw < 0 ? xRaw + CANVAS_WIDTH + GHOST_OVERFLOW_MARGIN : xRaw;
    const y     = 170 + i * 50 + Math.sin(t * 0.7 + i * 1.3) * 18;

    ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t * 1.1 + i);
    ctx.fillStyle   = '#78a0e8';
    ctx.fillRect(x - 40, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.globalAlpha = 1;
  }

  // Title
  ctx.fillStyle = '#e94560';
  ctx.font      = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Remnant Lite', CANVAS_WIDTH / 2, 140);

  // Tagline
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font      = '16px monospace';
  ctx.fillText('Use your past self to solve puzzles.', CANVAS_WIDTH / 2, 176);

  // Divider
  ctx.strokeStyle = 'rgba(100,220,255,0.2)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2 - 160, 198);
  ctx.lineTo(CANVAS_WIDTH / 2 + 160, 198);
  ctx.stroke();

  // Controls hint
  ctx.fillStyle = 'rgba(168,200,255,0.65)';
  ctx.font      = '13px monospace';
  ctx.fillText('Move: ← → / A D      Jump: ↑ / W / Space', CANVAS_WIDTH / 2, 228);
  ctx.fillText('R — Leave Echo     T — Restart     N — Next level', CANVAS_WIDTH / 2, 248);

  // "Press Enter" prompt — pulsing
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.5);
  ctx.globalAlpha = pulse;
  ctx.fillStyle   = '#64dcff';
  ctx.font        = 'bold 19px monospace';
  ctx.fillText('Press ENTER to Start', CANVAS_WIDTH / 2, 330);
  ctx.globalAlpha = 1;

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font      = '11px monospace';
  ctx.fillText('Phase 10 Demo', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16);
}

// ---------------------------------------------------------------------------
// Game complete screen
// ---------------------------------------------------------------------------

/**
 * Draw the end-of-demo screen shown after the last tutorial level is cleared.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawGameCompleteScreen(ctx) {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Gold accent panel
  ctx.fillStyle = 'rgba(255,215,0,0.08)';
  ctx.fillRect(0, CANVAS_HEIGHT / 2 - 110, CANVAS_WIDTH, 220);

  ctx.strokeStyle = 'rgba(255,215,0,0.18)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(60, CANVAS_HEIGHT / 2 - 110, CANVAS_WIDTH - 120, 220);

  // Title
  ctx.fillStyle = '#ffd700';
  ctx.font      = 'bold 38px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Tutorial Complete', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 44);

  // Summary
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font      = '16px monospace';
  ctx.fillText('You used your past self to solve puzzles.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 4);

  // Prototype note
  ctx.fillStyle = 'rgba(168,200,255,0.55)';
  ctx.font      = '13px monospace';
  ctx.fillText('This is a prototype of Remnant.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);

  // Restart prompt — pulsing
  const t     = Date.now() / 1000;
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.5);
  ctx.globalAlpha = pulse;
  ctx.fillStyle   = '#64dcff';
  ctx.font        = 'bold 16px monospace';
  ctx.fillText('Press ENTER or R to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 84);
  ctx.globalAlpha = 1;
}

/**
 * Clear the canvas and fill the background.
 * @param {CanvasRenderingContext2D} ctx
 */
export function clearScreen(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Draw all static platforms.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ x: number, y: number, width: number, height: number }>} platforms
 */
export function drawPlatforms(ctx, platforms) {
  for (const p of platforms) {
    // Body
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Bright top edge so the standing surface is obvious
    ctx.fillStyle = '#7a7a9a';
    ctx.fillRect(p.x, p.y, p.width, 3);
  }
}

/**
 * Draw all interactable entities: buttons, doors, and goal zones.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} interactables
 * @param {object[]} remnants - Active Remnants array, used to draw the
 *   button→door link line when a Remnant is pressing a button.
 */
export function drawInteractables(ctx, interactables, remnants) {
  // Draw a faint debug line from each pressed button to its linked door
  // so the player can understand the puzzle at a glance.
  if (remnants?.length > 0) {
    for (const button of interactables) {
      if (button.type !== 'button' || !button.isPressed || !button.targets) continue;
      const isRemnantPressing =
        Array.isArray(button.pressedBy) && button.pressedBy.some(id => id !== 'player');
      if (!isRemnantPressing) continue;

      for (const targetId of button.targets) {
        const door = interactables.find(e => e.id === targetId);
        if (!door) continue;

        const bx = button.x + button.width  / 2;
        const by = button.y + button.height / 2;
        const dx = door.x   + door.width    / 2;
        const dy = door.y   + door.height   / 2;

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(168, 200, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(dx, dy);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  for (const entity of interactables) {
    switch (entity.type) {
      case 'button':
        drawButton(ctx, entity);
        break;
      case 'door':
        drawDoor(ctx, entity);
        break;
      case 'goal':
        drawGoal(ctx, entity);
        break;
    }
  }
}

/**
 * Draw a floor button.
 *  - Unpressed: green
 *  - Pressed by player only: bright yellow
 *  - Pressed by Remnant (alone or together): blue-white tint
 *    A small "GHOST" label distinguishes Remnant activation at a glance.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number,
 *           isPressed: boolean, pressedBy?: string[] }} button
 */
function drawButton(ctx, button) {
  const isRemnantPressing =
    button.isPressed &&
    Array.isArray(button.pressedBy) &&
    button.pressedBy.some(id => id !== 'player');

  // Base pad — color indicates who is pressing
  if (!button.isPressed) {
    ctx.fillStyle = '#2ecc71'; // unpressed — green
  } else if (isRemnantPressing) {
    ctx.fillStyle = '#7eb8f7'; // Remnant pressing — cool blue
  } else {
    ctx.fillStyle = '#f5c518'; // player pressing — bright yellow
  }
  ctx.fillRect(button.x, button.y, button.width, button.height);

  // Darker inset to show depth
  const inset = 3;
  if (!button.isPressed) {
    ctx.fillStyle = '#27ae60';
  } else if (isRemnantPressing) {
    ctx.fillStyle = '#4a8fd4';
  } else {
    ctx.fillStyle = '#c49a14';
  }
  ctx.fillRect(
    button.x + inset,
    button.y + inset,
    button.width - inset * 2,
    button.height - inset * 2,
  );

  // Small label above the button when the Remnant is the activator
  if (isRemnantPressing) {
    ctx.fillStyle = 'rgba(168, 200, 255, 0.9)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GHOST', button.x + button.width / 2, button.y - 4);
  }
}

/**
 * Draw a door — solid red-orange block when closed, faint outline when open.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number, isOpen: boolean }} door
 */
function drawDoor(ctx, door) {
  if (door.isOpen) {
    // Open — render a ghost outline only so the player can see where the door was
    ctx.strokeStyle = 'rgba(200, 100, 50, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x, door.y, door.width, door.height);
  } else {
    // Closed — solid, clearly blocking
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(door.x, door.y, door.width, door.height);

    // Bright edge highlight
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(door.x, door.y, door.width, 3);
  }
}

/**
 * Draw a goal zone — bright animated outline with a subtle fill.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number }} goal
 */
function drawGoal(ctx, goal) {
  // Pulsing fill
  ctx.fillStyle = 'rgba(100, 220, 255, 0.15)';
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

  // Bright border
  ctx.strokeStyle = '#64dcff';
  ctx.lineWidth = 2;
  ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);

  // Label
  ctx.fillStyle = '#64dcff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', goal.x + goal.width / 2, goal.y + goal.height / 2 + 4);
}

/**
 * Draw the player as a colored rectangle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} position - Top-left corner of the player.
 * @param {boolean} isGrounded - Whether the player is on the ground.
 */
export function drawPlayer(ctx, position, isGrounded) {
  ctx.fillStyle = isGrounded ? '#e94560' : '#ff6b8a';
  ctx.fillRect(position.x, position.y, PLAYER_WIDTH, PLAYER_HEIGHT);

  // Simple face / highlight so we can tell the direction
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(position.x + 4, position.y + 6, 10, 10);
}

/**
 * Draw a single Remnant ghost with clear visual states:
 *
 *  1. Normal (non-solid replay):  translucent blue fill, thin outline.
 *  2. Warning (approaching solid): brighter, animated pulsing outline.
 *  3. Solid phase:                 strong opacity, thick bright outline,
 *                                  warm-cyan fill, "SOLID" label.
 *  4. Finished + non-solid:        very faint — Remnant ended before solid phase.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} remnant - Active Remnant entity.
 * @param {number} index - Zero-based position in the remnants array (for labels).
 */
function drawSingleRemnant(ctx, remnant, index) {
  const { isSolidToPlayer, isFinished, solidPhaseStartTime, currentTime } = remnant;

  // Time remaining until solid phase begins (negative when already in solid phase).
  const timeUntilSolid = solidPhaseStartTime - currentTime;

  // Show a warning tint in the 500 ms window just before the solid phase starts.
  const isPreSolid = !isSolidToPlayer && !isFinished && timeUntilSolid <= 500;

  if (isSolidToPlayer) {
    // --- Solid phase: strong, bright, clearly a real object ---
    ctx.globalAlpha = isFinished ? 0.8 : 0.85;
    ctx.fillStyle = '#90c8ff';
    ctx.fillRect(remnant.x, remnant.y, remnant.width, remnant.height);

    ctx.globalAlpha = isFinished ? 0.9 : 1.0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(remnant.x, remnant.y, remnant.width, remnant.height);

    // "SOLID" label above so the mechanic is unmistakable during testing
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOLID', remnant.x + remnant.width / 2, remnant.y - 4);

  } else if (isPreSolid) {
    // --- Warning phase: animated pulse in the 0.5 s window before solid ---
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.014);

    ctx.globalAlpha = 0.38 + pulse * 0.18;
    ctx.fillStyle = '#b0d4ff';
    ctx.fillRect(remnant.x, remnant.y, remnant.width, remnant.height);

    ctx.globalAlpha = 0.65 + pulse * 0.35;
    ctx.strokeStyle = '#d8f0ff';
    ctx.lineWidth = 1.5 + pulse;
    ctx.strokeRect(remnant.x, remnant.y, remnant.width, remnant.height);

  } else if (isFinished) {
    // --- Finished but not solid: faint ghost, replay ended before solid phase ---
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#78a0e8';
    ctx.fillRect(remnant.x, remnant.y, remnant.width, remnant.height);

    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#a8c8ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(remnant.x, remnant.y, remnant.width, remnant.height);

  } else {
    // --- Normal non-solid replay: translucent blue, thin outline ---
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#78a0e8';
    ctx.fillRect(remnant.x, remnant.y, remnant.width, remnant.height);

    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = '#a8c8ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(remnant.x, remnant.y, remnant.width, remnant.height);
  }

  // Small "R1" / "R2" label above so multiple Remnants stay distinguishable
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = isSolidToPlayer ? '#ffffff' : '#a8c8ff';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`R${index + 1}`, remnant.x + remnant.width / 2, remnant.y - (isSolidToPlayer ? 14 : 4));

  // Restore full opacity for subsequent draw calls
  ctx.globalAlpha = 1;
}

/**
 * Draw all active Remnants.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} remnants - Array of active Remnant entities.
 */
export function drawRemnants(ctx, remnants) {
  for (let i = 0; i < remnants.length; i++) {
    drawSingleRemnant(ctx, remnants[i], i);
  }
}

/**
 * Draw a brief centred message overlay (fades in quickly, lingers, then fades out).
 * Has no effect when message is empty or timer has expired.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} message
 * @param {number} timer   - Seconds remaining for this message.
 * @param {number} total   - Total duration the message is displayed (used for fade-out).
 */
export function drawUIMessage(ctx, message, timer, total = 2.0) {
  if (!message || timer <= 0) return;

  // Fade out in the last 0.4 s of the message lifetime
  const alpha = timer < 0.4 ? timer / 0.4 : 1;

  ctx.save();
  ctx.globalAlpha = alpha;

  const w = 260;
  const h = 40;
  const x = (CANVAS_WIDTH  - w) / 2;
  const y = (CANVAS_HEIGHT - h) / 2 - 40; // slightly above centre

  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font      = 'bold 17px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(message, CANVAS_WIDTH / 2, y + h / 2 + 6);

  ctx.restore();
}

/**
 * Draw the HUD overlay.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{
 *   levelName:         string,
 *   levelIndex:        number,
 *   totalLevels:       number,
 *   goalReached:       boolean,
 *   levelComplete:     boolean,
 *   isLastLevel:       boolean,
 *   runState:          string,
 *   failTimer:         number,
 *   hint:              string,
 *   snapshotCount:     number,
 *   capturedCount:     number,
 *   remnants:          object[],
 *   maxRemnants:       number,
 *   interactables:     Array,
 * }} hud
 */
export function drawHUD(ctx, hud) {
  const {
    levelName,
    levelIndex,
    totalLevels,
    goalReached,
    levelComplete,
    isLastLevel,
    runState,
    failTimer,
    hint,
    snapshotCount,
    capturedCount,
    remnants,
    maxRemnants,
    interactables,
  } = hud;

  ctx.textAlign = 'left';
  ctx.font = '13px monospace';

  // ── Top-left column ──────────────────────────────────────────────────────

  // Level number + name
  if (levelName) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`Level ${levelIndex + 1}/${totalLevels}: ${levelName}`, 12, 20);
    ctx.font = '13px monospace';
  }

  // Remnant count
  const remnantCount = remnants.length;
  ctx.fillStyle = remnantCount >= maxRemnants
    ? 'rgba(255,180,80,0.9)'   // orange when at limit
    : 'rgba(168,200,255,0.85)'; // blue normally
  ctx.fillText(`Echoes: ${remnantCount} / ${maxRemnants}`, 12, 40);

  // Recording sample count
  ctx.fillStyle = 'rgba(100,220,255,0.7)';
  ctx.fillText(`Recording: ${snapshotCount} samples`, 12, 57);

  // Captured timeline count (shown once committed at least once)
  if (capturedCount > 0) {
    ctx.fillStyle = 'rgba(245,197,24,0.85)';
    ctx.fillText(`Captured: ${capturedCount} samples`, 12, 74);
  }

  // Per-remnant status (most recent only when multiple exist)
  if (remnants.length > 0) {
    const r = remnants[remnants.length - 1]; // newest
    let remnantStatus;
    if (r.isFinished) {
      remnantStatus = 'Finished';
    } else {
      remnantStatus = 'Playing';
    }
    const yBase = capturedCount > 0 ? 91 : 74;
    ctx.fillStyle = 'rgba(168,200,255,0.8)';
    ctx.fillText(`Latest echo: ${remnantStatus}`, 12, yBase);

    // Solid-phase status
    const solidLabel = r.isSolidToPlayer ? 'ON' : 'OFF';
    ctx.fillStyle = r.isSolidToPlayer
      ? 'rgba(144,200,255,1.0)'
      : 'rgba(168,200,255,0.5)';
    ctx.fillText(`Solid Phase: ${solidLabel}`, 12, yBase + 17);

    // Replay time
    if (!r.isFinished) {
      const current  = (r.currentTime  / 1000).toFixed(2);
      const duration = (r.duration     / 1000).toFixed(2);
      const solidAt  = (r.solidPhaseStartTime / 1000).toFixed(2);
      ctx.fillStyle = 'rgba(168,200,255,0.6)';
      ctx.fillText(`Replay: ${current}s / ${duration}s`, 12, yBase + 34);
      ctx.fillStyle = 'rgba(144,200,255,0.5)';
      ctx.fillText(`Solid starts: ${solidAt}s`, 12, yBase + 51);
    }
  }

  // Button state
  if (interactables) {
    const buttons = interactables.filter(e => e.type === 'button');
    if (buttons.length > 0) {
      const button = buttons[0];
      let buttonLabel;
      if (!button.isPressed) {
        buttonLabel = 'None';
      } else if (
        Array.isArray(button.pressedBy) &&
        button.pressedBy.some(id => id !== 'player') &&
        button.pressedBy.includes('player')
      ) {
        buttonLabel = 'Player + Echo';
      } else if (
        Array.isArray(button.pressedBy) &&
        button.pressedBy.some(id => id !== 'player')
      ) {
        buttonLabel = 'Echo';
      } else {
        buttonLabel = 'Player';
      }
      ctx.fillStyle = 'rgba(255,220,100,0.75)';
      // Place button label below the remnant block — use a fixed offset from bottom
      ctx.fillText(`Button: ${buttonLabel}`, 12, 200);
    }
  }

  // ── Bottom strip ─────────────────────────────────────────────────────────

  // Hint text
  if (hint) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(hint, 12, CANVAS_HEIGHT - 46);
  }

  // Controls
  ctx.fillStyle = 'rgba(100,220,255,0.45)';
  ctx.fillText('R — leave an echo   T — restart level   F1 — debug', 12, CANVAS_HEIGHT - 30);

  if (levelComplete) {
    ctx.fillStyle = 'rgba(100,220,255,0.45)';
    ctx.fillText('N — next level', 12, CANVAS_HEIGHT - 14);
  }

  // ── Fail state banner ─────────────────────────────────────────────────────

  if (runState === 'failed') {
    // Darken the screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 50, CANVAS_WIDTH, 100);

    ctx.fillStyle = '#ff4466';
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Run Failed', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 6);

    // Countdown until restart
    const restartIn = Math.max(0, failTimer).toFixed(1);
    ctx.font      = '13px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`Restarting in ${restartIn}s   (T — restart now)`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 22);
  }

  // ── Level completion banner ───────────────────────────────────────────────

  if (goalReached) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 44, CANVAS_WIDTH, 88);

    if (isLastLevel) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Tutorial Complete!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 4);

      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('You have mastered the Echo mechanic.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    } else {
      ctx.fillStyle = '#64dcff';
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Level Complete!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 4);

      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Press N for the next level', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
  }
}
