import { profileFrames, sourceRadii } from '../../assets/references/digital-organism/motion-data.js';

const WIDTH = 1080;
const HEIGHT = 1620;
const DURATION = 3.6;
const TAU = Math.PI * 2;
const PINK = '#d99a9e';
const FONT = '"Microsoft YaHei", "Segoe UI", Arial, sans-serif';
const MONO = 'Consolas, "Microsoft YaHei", monospace';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fract = v => v - Math.floor(v);
const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7 + 13.13) * 43758.5453);

function text(ctx, value, x, y, size, color = PINK, weight = 400, family = FONT) {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

const GRAIN = Array.from({ length: 2600 }, (_, i) => ({
  x: hash(i, 1) * WIDTH, y: hash(i, 2) * HEIGHT,
  length: 1 + hash(i, 3) * 30, alpha: 0.018 + hash(i, 4) * 0.045,
}));

/** A time-indexed reconstruction of the source's accumulating radial line organism. */
export class DigitalOrganismScene {
  constructor() {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.duration = DURATION;
  }

  stateAt(elapsed = 0, reducedMotion = false, pointer = null) {
    const t = clamp(Number(elapsed) || 0, 0, DURATION);
    const frame = Math.min(119, Math.floor(t / 0.03));
    const sides = Math.max(10, frame + 1);
    const interactive = pointer && Number.isFinite(pointer.x) && Number.isFinite(pointer.y)
      && pointer.x >= 72 && pointer.x <= 1008 && pointer.y >= 254 && pointer.y <= 982;
    return {
      t, frame, sides, noiseOffset: frame * 0.0074,
      rotation: reducedMotion ? 0 : frame * 0.92,
      cx: interactive ? 540 + (pointer.x - 540) * 0.12 : 540,
      cy: interactive ? 635 + (pointer.y - 635) * 0.12 : 635,
      reducedMotion: Boolean(reducedMotion),
    };
  }

  drawOrganism(ctx, s) {
    if (s.frame === 0) return;
    // The GIF supplies radial contour envelopes; its original Perlin seed is not
    // available. Interpolate those measured envelopes, then rebuild every preceding
    // polygon from absolute time so reverse seeking cannot retain stale trails.
    const step = s.reducedMotion ? 3 : 1;
    for (let k = 1; k <= s.frame; k += step) {
      const sides = 96;
      let b = profileFrames.findIndex(value => value >= k);
      if (b < 0) b = profileFrames.length - 1;
      const a = Math.max(0, b - 1);
      const span = profileFrames[b] - profileFrames[a];
      const blend = span ? clamp((k - profileFrames[a]) / span, 0, 1) : 0;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const bin = i % 96;
        const angle = (bin + 0.5) / sides * TAU;
        const r = sourceRadii[a][bin] + (sourceRadii[b][bin] - sourceRadii[a][bin]) * blend;
        const x = s.cx + Math.cos(angle) * r;
        const y = s.cy + Math.sin(angle) * r * 0.82;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(236,159,174,${s.reducedMotion ? 0.65 : 0.55})`;
      ctx.lineWidth = k === s.frame ? 1.45 : 0.9;
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(s.cx, s.cy, 9 + s.frame * 0.06, 0, TAU);
    ctx.fillStyle = '#141c20'; ctx.fill();
  }

  render(ctx, state = {}) {
    const s = this.stateAt(state.elapsed, state.reducedMotion, state.pointer);
    ctx.save();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#141c20'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 0.6;
    for (const p of GRAIN) {
      ctx.strokeStyle = `rgba(179,193,191,${p.alpha})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.length, p.y); ctx.stroke();
    }
    text(ctx, '艺术程序设计', 101, 127, 26);
    text(ctx, '《数字有机体》', 440, 127, 32);
    text(ctx, '2026年3月23日', 840, 125, 22);

    ctx.strokeStyle = '#75595b'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.roundRect(72, 254, 936, 728, 4); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(73, 255, 934, 726); ctx.clip();
    this.drawOrganism(ctx, s);
    ctx.restore();

    ctx.textAlign = 'right';
    text(ctx, `sides: ${s.sides}`, 980, 298, 17, PINK, 400, MONO);
    text(ctx, `noise: ${s.noiseOffset.toFixed(2)}`, 980, 329, 17, PINK, 400, MONO);
    text(ctx, `rotation: ${Math.round(s.rotation)}`, 980, 360, 17, PINK, 400, MONO);
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#aa7a80'; ctx.lineWidth = 3;
    if (state.playing) {
      ctx.fillStyle = '#aa7a80'; ctx.fillRect(533, 1009, 6, 19); ctx.fillRect(543, 1009, 6, 19);
    } else {
      ctx.beginPath(); ctx.moveTo(533, 1010); ctx.lineTo(549, 1019); ctx.lineTo(533, 1028); ctx.closePath(); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(972, 1018, 7, 0, TAU); ctx.fillStyle = '#b90d17'; ctx.fill();

    text(ctx, '[ 核心代码 ]', 108, 1085, 22, '#c6d1d0');
    text(ctx, '[ 设计思路 ]', 576, 1085, 22, '#c6d1d0');
    ctx.beginPath(); ctx.roundRect(108, 1108, 414, 252, 5);
    ctx.fillStyle = '#10171b'; ctx.fill(); ctx.strokeStyle = '#846266'; ctx.lineWidth = 1.3; ctx.stroke();
    const code = [
      '// 噪声驱动的有机形态', 'for (int i = 0; i < s; i++) {', '  float angle = TAU / s * i;',
      '  float r = noise(cos(angle)+xoff,', '                  sin(angle)+yoff) * s;',
      '  vertex(cos(angle)*r,', '         sin(angle)*r);', '}', 's++;  // 边数递增', 'xoff += 0.01;  // 噪声偏移',
    ];
    code.forEach((line, i) => text(ctx, line, 122, 1134 + i * 22, 15.5, '#9ecab8', 400, MONO));
    const explanation = [
      '本作品以 Perlin 噪声为核心算法，', '通过动态递增的边数(s)构建从简', '单多边形到复杂有机形态的演变。', '',
      '噪声函数赋予图形自然生长的随', '机性，旋转动画增强时空连续感。', '',
      '色彩选用深绿背景与柔粉线条的', '对比，营造赛博自然的美学意境。', '规则与随机的平衡，让代码成为', '具有生命感的绘画工具。',
    ];
    explanation.forEach((line, i) => text(ctx, line, 576, 1123 + i * 26, 19, '#c7cdcd'));

    ctx.textAlign = 'center';
    text(ctx, '原作：盛海波  |  指导教师：张帆', 540, 1539, 20, '#b7848a');
    text(ctx, '时间索引重建 · 实测轮廓 · Canvas 2D', 540, 1573, 15, '#7e676d');
    ctx.restore();
  }
}
