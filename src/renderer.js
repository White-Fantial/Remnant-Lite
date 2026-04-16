// Renderer — responsible for all draw calls

import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from './constants.js';

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
 */
export function drawInteractables(ctx, interactables) {
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
 * Draw a floor button — green when idle, bright yellow when pressed.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, width: number, height: number, isPressed: boolean }} button
 */
function drawButton(ctx, button) {
  // Base pad
  ctx.fillStyle = button.isPressed ? '#f5c518' : '#2ecc71';
  ctx.fillRect(button.x, button.y, button.width, button.height);

  // Darker inset to show it can be pressed
  const inset = 3;
  ctx.fillStyle = button.isPressed ? '#c49a14' : '#27ae60';
  ctx.fillRect(
    button.x + inset,
    button.y + inset,
    button.width - inset * 2,
    button.height - inset * 2,
  );
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
 * Draw the active Remnant ghost.
 * Rendered as a semi-transparent rectangle with a colored outline so it is
 * clearly distinct from the solid player.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object | null} remnant - Active Remnant entity, or null.
 */
export function drawRemnant(ctx, remnant) {
  if (!remnant) return;

  const alpha = remnant.isFinished ? 0.25 : 0.5;

  // Translucent ghost fill
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#78a0e8';
  ctx.fillRect(remnant.x, remnant.y, remnant.width, remnant.height);

  // Bright outline
  ctx.globalAlpha = remnant.isFinished ? 0.35 : 0.75;
  ctx.strokeStyle = '#a8c8ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(remnant.x, remnant.y, remnant.width, remnant.height);

  // Restore full opacity for subsequent draw calls
  ctx.globalAlpha = 1;
}

/**
 * Draw the HUD overlay: level name, goal state, recording stats, and hints.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} levelName
 * @param {boolean} goalReached
 * @param {string} [hint]
 * @param {{
 *   snapshotCount: number,
 *   capturedCount: number,
 *   activeRemnant: object | null,
 * }} [recording]
 */
export function drawHUD(ctx, levelName, goalReached, hint, recording) {
  ctx.textAlign = 'left';
  ctx.font = '13px monospace';

  // Level name — top-left
  if (levelName) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(levelName, 12, 20);
  }

  // Recording / Remnant stats — top-left below level name
  if (recording) {
    ctx.fillStyle = 'rgba(100,220,255,0.7)';
    ctx.fillText(`Recording: ${recording.snapshotCount} samples`, 12, 40);

    // Captured timeline sample count (shown once at least one commit has been made)
    if (recording.capturedCount > 0) {
      ctx.fillStyle = 'rgba(245,197,24,0.85)';
      ctx.fillText(`Captured: ${recording.capturedCount} samples`, 12, 57);
    }

    // Active Remnant status
    const r = recording.activeRemnant;
    let remnantStatus;
    if (!r) {
      remnantStatus = 'None';
    } else if (r.isFinished) {
      remnantStatus = 'Finished';
    } else {
      remnantStatus = 'Playing';
    }

    ctx.fillStyle = 'rgba(168,200,255,0.8)';
    ctx.fillText(`Remnant: ${remnantStatus}`, 12, 74);

    // Remnant time — shown while actively replaying
    if (r && !r.isFinished) {
      const current  = (r.currentTime  / 1000).toFixed(2);
      const duration = (r.duration     / 1000).toFixed(2);
      ctx.fillStyle = 'rgba(168,200,255,0.6)';
      ctx.fillText(`Remnant Time: ${current} / ${duration}`, 12, 91);
    }
  }

  // Hint — bottom of screen (level-specific, only shown when provided)
  if (hint) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(hint, 12, CANVAS_HEIGHT - 30);
  }

  // Remnant commit hint — bottom of screen
  ctx.fillStyle = 'rgba(100,220,255,0.45)';
  ctx.fillText('Press R to leave a Remnant', 12, CANVAS_HEIGHT - 14);

  // Goal reached banner
  if (goalReached) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 34, CANVAS_WIDTH, 68);

    ctx.fillStyle = '#64dcff';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Goal reached', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 32);
  }
}
