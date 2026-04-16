// Debug utilities — overlay rendering and ghost trail visualization.
// Only called when state.debug.enabled is true; no impact on normal play.

import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants.js';

// ---------------------------------------------------------------------------
// Debug overlay
// ---------------------------------------------------------------------------

/**
 * Draw a compact debug information panel in the top-right corner.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{
 *   player:           { position: {x:number,y:number}, velocity: {x:number,y:number},
 *                       isGrounded: boolean, coyoteTimer: number, jumpBuffer: number },
 *   remnants:         object[],
 *   snapshotCount:    number,
 *   blockingCount:    number,
 *   pressedButtons:   string[],
 *   metrics:          { attempts:number, remnantCommits:number, restartCount:number, elapsedTime:number },
 *   canvasWidth:      number,
 * }} info
 */
export function drawDebugOverlay(ctx, info) {
  const { player, remnants, snapshotCount, blockingCount, pressedButtons, metrics, canvasWidth } = info;

  const PAD   = 6;
  const W     = 210;
  const lineH = 11;

  // Count lines to size the background dynamically.
  // + 4 px extra bottom padding so text does not clip the background edge.
  const baseLines    = 12;
  const remnantLines = remnants.length * 2;
  const totalLines   = baseLines + remnantLines;
  const EXTRA_PAD    = 4; // bottom breathing room below last text row
  const H            = PAD * 2 + lineH + totalLines * lineH + EXTRA_PAD;

  const ox = canvasWidth - W - PAD;
  const oy = PAD;

  // Semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
  ctx.fillRect(ox, oy, W, H);

  ctx.save();
  ctx.textAlign = 'left';

  let y = oy + PAD + lineH;

  /** Draw one label: value row. */
  const row = (label, value, color = 'rgba(180, 255, 180, 0.9)') => {
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(130, 180, 130, 0.7)';
    ctx.fillText(label, ox + PAD, y);
    ctx.fillStyle = color;
    ctx.fillText(String(value), ox + PAD + 86, y);
    y += lineH;
  };

  // Header
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = 'rgba(100, 255, 100, 0.95)';
  ctx.fillText('DEBUG  [F1 / `]', ox + PAD, oy + PAD + lineH - 2);
  y += 2;

  // Player
  row('pos',      `${Math.round(player.position.x)}, ${Math.round(player.position.y)}`);
  row('vel',      `${Math.round(player.velocity.x)}, ${Math.round(player.velocity.y)}`);
  row('grounded', player.isGrounded ? 'yes' : 'no',
    player.isGrounded ? 'rgba(100,255,100,0.9)' : 'rgba(255,180,100,0.9)');
  row('coyote',   player.coyoteTimer > 0 ? player.coyoteTimer.toFixed(2) + 's' : 'off',
    player.coyoteTimer > 0 ? 'rgba(255,230,100,0.9)' : 'rgba(130,130,130,0.7)');
  row('jumpBuf',  player.jumpBuffer  > 0 ? player.jumpBuffer.toFixed(2)  + 's' : 'off',
    player.jumpBuffer  > 0 ? 'rgba(255,230,100,0.9)' : 'rgba(130,130,130,0.7)');

  y += 2;

  // Remnants
  row('remnants',  remnants.length, 'rgba(168,200,255,0.9)');
  for (let i = 0; i < remnants.length; i++) {
    const r     = remnants[i];
    const phase = r.isSolidToPlayer ? 'SOLID' : r.isFinished ? 'done' : 'ghost';
    row(`  R${i + 1} state`, phase,
      r.isSolidToPlayer ? 'rgba(144,210,255,1)' : 'rgba(150,150,200,0.8)');
    row(`  R${i + 1} time`,
      `${(r.currentTime / 1000).toFixed(2)}/${(r.duration / 1000).toFixed(2)}s`);
  }

  row('snapshots',   snapshotCount);
  row('colliders',   blockingCount);
  row('buttons',     pressedButtons.length > 0 ? pressedButtons.join(', ') : 'none');

  y += 2;

  // Metrics
  row('attempts',    metrics.attempts,       'rgba(255,220,120,0.9)');
  row('commits',     metrics.remnantCommits, 'rgba(255,220,120,0.9)');
  row('restarts',    metrics.restartCount,   'rgba(255,220,120,0.9)');
  row('elapsed',     metrics.elapsedTime.toFixed(1) + 's', 'rgba(255,220,120,0.9)');

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Ghost trail / path visualization
// ---------------------------------------------------------------------------

/**
 * Draw breadcrumb trails for:
 *  - the live player's recent recording buffer (pink dots)
 *  - each active Remnant's full timeline (blue dots), highlighting the solid
 *    phase segment in a brighter tint, plus a yellow playback-head marker.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array|null} recorderBuffer - The recorder's internal _buffer array.
 * @param {object[]}   remnants       - Active Remnant entities.
 */
export function drawGhostTrail(ctx, recorderBuffer, remnants) {
  ctx.save();

  // --- Live player trail (last 40 recording samples) ---
  if (recorderBuffer && recorderBuffer.length > 1) {
    const start  = Math.max(0, recorderBuffer.length - 40);
    const recent = recorderBuffer.slice(start);
    for (let i = 0; i < recent.length; i++) {
      const alpha = (i / recent.length) * 0.45;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#e94560';
      ctx.fillRect(
        recent[i].x + (PLAYER_WIDTH  / 2) - 2,
        recent[i].y + (PLAYER_HEIGHT / 2) - 2,
        4, 4,
      );
    }
  }

  ctx.globalAlpha = 1;

  // --- Remnant timelines ---
  for (const remnant of remnants) {
    const { timeline, solidPhaseStartTime } = remnant;
    if (!timeline || timeline.length < 2) continue;

    // Sample at most 50 points across the timeline
    const step = Math.max(1, Math.floor(timeline.length / 50));

    for (let i = 0; i < timeline.length; i += step) {
      const s           = timeline[i];
      const isSolidZone = s.time >= solidPhaseStartTime;
      ctx.globalAlpha = isSolidZone ? 0.35 : 0.15;
      ctx.fillStyle   = isSolidZone ? '#90c8ff' : '#5878c8';
      ctx.fillRect(
        s.x + (PLAYER_WIDTH  / 2) - 2,
        s.y + (PLAYER_HEIGHT / 2) - 2,
        4, 4,
      );
    }

    // Playback-head marker (bright yellow square)
    ctx.globalAlpha = 0.8;
    ctx.fillStyle   = '#ffee55';
    ctx.fillRect(
      remnant.x + (PLAYER_WIDTH  / 2) - 3,
      remnant.y + (PLAYER_HEIGHT / 2) - 3,
      6, 6,
    );
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
