import { sampleTimes, coordinates, colors } from '../../assets/references/grid-rhythm/motion-data.js';

const WIDTH = 1080;
const HEIGHT = 1620;
const DURATION = 1.24;
const FONT = '"Segoe UI", "Microsoft YaHei", Arial, sans-serif';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, k) => a + (b - a) * k;
const ROW_HUES = [252, 252, 251, 250, 247, 235, 226, 220, 100, 88, 92, 94, 95, 98, 104, 108, 110, 112, 287, 285];

function sampleAt(t) {
  let end = sampleTimes.findIndex(value => value >= t);
  if (end < 0) end = sampleTimes.length - 1;
  const start = Math.max(0, end - 1);
  const span = sampleTimes[end] - sampleTimes[start];
  return { start, end, k: span ? clamp((t - sampleTimes[start]) / span, 0, 1) : 0 };
}

function text(ctx, value, x, y, size, color, weight = 400) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function panel(ctx, x, y, w, h, color, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 26);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function rule(ctx, x, y, length, color) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + length, y);
  ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
}

/** Rebuilds the poster and its 400-node grid from measured, time-indexed source motion. */
export class GridRhythmScene {
  constructor() {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.duration = DURATION;
  }

  stateAt(elapsed = 0, reducedMotion = false, pointer = null) {
    const t = clamp(Number(elapsed) || 0, 0, DURATION);
    const sample = sampleAt(t);
    const interactive = pointer && Number.isFinite(pointer.x) && Number.isFinite(pointer.y)
      && pointer.x >= 40 && pointer.x <= 630 && pointer.y >= 275 && pointer.y <= 865;
    const focus = interactive ? { x: pointer.x, y: pointer.y } : null;
    const points = [];
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        const index = row * 20 + col;
        const a = (sample.start * 400 + index) * 2;
        const b = (sample.end * 400 + index) * 2;
        let x = mix(coordinates[a], coordinates[b], sample.k) / 4;
        let y = mix(coordinates[a + 1], coordinates[b + 1], sample.k) / 4;
        if (reducedMotion) {
          x = mix(60 + col * 25.8, x, 0.35);
          y = mix(297 + row * 25.4, y, 0.35);
        }
        // Pointer interaction is an additive, stateless repulsion over the recorded
        // field. It does not mutate the measured replay or accumulate hidden history.
        if (focus) {
          const dx = x - focus.x, dy = y - focus.y;
          const dist = Math.max(0.1, Math.hypot(dx, dy));
          const push = Math.max(0, 132 - dist) * (reducedMotion ? 0.12 : 0.45);
          x += dx / dist * push; y += dy / dist * push;
        }
        const slope = row > 17 ? -2.3 : -5 + 9 * Math.sin(row / 19 * Math.PI);
        const hue = (ROW_HUES[row] + slope * col + 360) % 360;
        const light = row > 17 ? 26 + col * 0.45 : 39 + 9 * Math.sin(col / 19 * Math.PI);
        const rgb = Array.from(colors.subarray(index * 3, index * 3 + 3));
        const color = Math.max(...rgb) > 30 ? `rgb(${rgb.join(',')})` : `hsl(${hue} 72% ${light}%)`;
        points.push({ x, y, row, col, hue, light, color });
      }
    }
    return { t, focus, points, interactive: Boolean(interactive) };
  }

  render(ctx, state = {}) {
    const s = this.stateAt(state.elapsed, state.reducedMotion, state.pointer);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const [x, y, r, color] of [
      [175, 525, 305, '#160d0b'], [420, 470, 175, '#1a0d14'],
      [770, 250, 225, '#160d15'], [240, 1060, 265, '#140b08'],
      [205, 1370, 270, '#150c13'],
    ]) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    }

    panel(ctx, 54, 54, 508, 208, '#b5386a', '#291e22');
    text(ctx, 'OPEN SOURCE', 82, 100, 35, '#ef337f');
    text(ctx, 'PROGRAMMING', 82, 147, 35, '#ef337f');
    text(ctx, 'BASICS', 82, 194, 35, '#ef337f');
    rule(ctx, 82, 220, 217, '#b5386a');

    const { points } = s;
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(210,220,216,.34)';
    ctx.beginPath();
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        const p = points[row * 20 + col];
        if (col < 19) {
          const q = points[row * 20 + col + 1];
          if (Math.hypot(p.x - q.x, p.y - q.y) < 95) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        }
        if (row < 19) {
          const q = points[(row + 1) * 20 + col];
          if (Math.hypot(p.x - q.x, p.y - q.y) < 95) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        }
      }
    }
    ctx.stroke();
    for (const p of points) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y + 1, 17.5, 17.5);
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f4f6ee'; ctx.fill();
    }

    panel(ctx, 675, 64, 325, 324, '#34b79a', '#192824');
    text(ctx, 'PARAMETERS', 704, 104, 26, '#34e8c2');
    rule(ctx, 704, 114, 181, '#34b79a');
    ['• Grid: 20 x 20', '• Cell size: 13.8px', '• Mouse radius: 80.0px', '• Wave amplitude: 5', '• Decay: 0.95'].forEach((line, i) => text(ctx, line, 704, 179 + i * 32, 20, '#33e6ba'));

    panel(ctx, 675, 424, 325, 298, '#bd5331', '#2d201b');
    text(ctx, 'EFFECTS', 704, 464, 26, '#dc7049');
    rule(ctx, 704, 474, 145, '#bd5331');
    ['• Dynamic grid with wave motion', '• Mouse-based repulsion', '• Color gradients by position', '• Real-time interaction'].forEach((line, i) => text(ctx, line, 704, 538 + i * 32, 18, '#dc7049'));

    panel(ctx, 675, 756, 325, 644, '#993bbf', '#251b2a');
    text(ctx, 'REFLECTION', 704, 797, 26, '#c13df0');
    rule(ctx, 704, 807, 181, '#993bbf');
    const reflection = [
      'Summary:', 'Through this course, I', 'learned open-source', 'programming concepts,', 'mastered Processing', 'basics and dynamic visual', 'design.', '',
      'Reflection:', 'Open source is not just', 'about sharing code,', 'but also a culture of', 'collaboration and', 'continuous learning.', '',
      'Future:', 'Explore physics simulation,', 'computer vision,', 'and interactive', 'installations.',
    ];
    reflection.forEach((line, i) => text(ctx, line, 704, 870 + i * 25, 18, '#c858e6'));

    panel(ctx, 54, 937, 508, 441, '#bc6439', '#2a201d');
    text(ctx, 'CODE STRUCTURE', 82, 976, 25, '#ec7e43');
    rule(ctx, 82, 987, 216, '#bc6439');
    const code = [
      ['// Grid parameters', '#43d36b'], ['int cols = 20, rows = 20;', '#ae43ed'], ['float cellSize = 16.5;', '#ae43ed'],
      ['// Wave motion', '#43d36b'], ['float waveX = sin(time + i*0.5) * 5;', '#ae43ed'], ['float waveY = cos(time + j*0.5) * 5;', '#ae43ed'],
      ['// Mouse interaction', '#43d36b'], ['if (dist(x, y, mouseX, mouseY) < 80) {', '#ae43ed'], ['  float force = (80 - dist) / 6;', '#ae43ed'],
      ['  offsets += (dx / d) * force * 0.5;', '#e4d8d2'], ['}', '#e4d8d2'], ['// Update with decay', '#43d36b'], ['offsets = offsets * 0.95 + wave * 0.05;', '#e4d8d2'],
    ];
    code.forEach(([line, color], i) => text(ctx, line, 82, 1038 + i * 27, 19, color));

    panel(ctx, 54, 1405, 508, 161, '#983bbe', '#251b2b');
    text(ctx, 'Xie Weini / 解薇霓', 82, 1441, 20, '#c75bea');
    rule(ctx, 82, 1454, 218, '#983bbe');
    text(ctx, 'Grid Rhythm · source study', 82, 1504, 18, '#aa62c5');
    text(ctx, 'Canvas reconstruction · 2026', 82, 1543, 17, '#aa62c5');
    ctx.restore();
  }
}
