// Scene 06: Jev · System One Isometric Mechanical Schema Reader (Warm Ivory & Champagne Gold)
// The rig is an orthographic model measured from the reference frame: camera azimuth ≈ 40°,
// elevation ≈ 27°. One world unit equals one reference pixel (1600 × 900 frame) at k = 1.
const WIDTH = 1080;
const HEIGHT = 1350;
const DURATION = 18;
const MONO = '"SF Mono", "SFMono-Regular", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace';
const SANS = '"Inter", "SF Pro Text", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';

const EX = { x: 0.766, y: 0.2918 };
const EY = { x: 0.6428, y: -0.3478 };
const EZ = -0.891;
const FLAT = 0.454;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

const VIEW = { ox: 25.5, oy: 454, k: 0.83 };
const PILLAR_U = [506.5, 554.1, 601.7, 649.3];
const PILLAR_V = 223;
const PILLAR_Z = 50;
const DIAL = { u: 778, v: 232.5 };
const GATE_PADS = [[943.3, 254], [979.2, 260.6], [1020.4, 260.7]];

const PAPER = '#fafaf8';
const LINE = '#a3a3a0';
const WARM = { top: '#fdfdfb', left: '#f4f4f0', right: '#e2e2de', line: LINE };
const COOL = { top: '#fbfbfd', left: '#edecef', right: '#d4d3d7', line: '#9c9ca5' };
const DUSK = { top: '#fcfcfa', left: '#f4f4f3', right: '#cccbcf', line: '#a2a2a0' };
const GOLD = { top: '#f3e5c1', left: '#e6d09c', right: '#d4b97e', line: '#ab8f57' };
const PLATE = { top: '#f4eedb', left: '#e4d5b2', right: '#cfbb8c', line: '#b19d6d' };
const PALE = { top: '#f5f0db', left: '#ece2c6', right: '#e2d4b0', line: '#c6b07a' };
const AMBER = '229, 158, 58';

// Turned-brass body shading sampled across a reference pillar (left highlight, dark core, warm bounce).
const BODY_GOLD = [[0, '#dccfae'], [0.12, '#ece1c0'], [0.2, '#f1dfc3'], [0.3, '#e6d3ad'], [0.42, '#dccaa0'], [0.52, '#d2bf8c'], [0.62, '#c2ad77'], [0.7, '#c3ab76'], [0.8, '#d3b985'], [0.9, '#ccb684'], [1, '#c4b28f']];
const BASE_GOLD = [[0, '#e9dcc0'], [0.14, '#fcefdb'], [0.3, '#f6e8c6'], [0.48, '#dccfa1'], [0.7, '#cfc193'], [0.86, '#c4b47a'], [1, '#bcae8c']];
const BODY_WHITE = [[0, '#ececE8'], [0.18, '#fbfbf9'], [0.45, '#f1f1ee'], [0.78, '#dfdfdb'], [1, '#d3d3cf']];
const BODY_COOL = [[0, '#e6e5ea'], [0.2, '#f8f8fa'], [0.5, '#e7e6eb'], [0.8, '#d3d2d7'], [1, '#c8c7cc']];
const BODY_IVORY = [[0, '#ecebe6'], [0.2, '#fdfdfc'], [0.55, '#f2f1ed'], [1, '#d9d8d2']];

const STAGES = [
  {
    fig: 'Fig 1',
    label: '高频的小判断',
    caption: '高频的小判断，不需要一段散文答案：LLM 逐字写 token，Jev 只读一次。',
    footL: 'PROSE ANSWER · 70–500 MS',
    footR: 'LLM writes tokens · Jev reads once',
    trace: 'prose · token by token',
  },
  {
    fig: 'Fig 2',
    label: '状态与类型化问题',
    caption: '先给出状态，再提出类型化的问题：答案的形状（schema）事先就定好了。',
    footL: 'STATE + TYPED QUESTIONS',
    footR: 'schema in · one read out',
    trace: 'schema · single read',
    hud: { title: '置信门 · gate', value: '> 0.9', rows: [['> 0.9', '直接执行'], ['0.5–0.9', '大模型复核'], ['< 0.5', '上人工桌']] },
  },
  {
    fig: 'Fig 3',
    label: '案例一：退款工单',
    caption: 'Jev 同时回答三个问题。是不是退款请求？零点九三，是。',
    footL: 'NOUL 0.93 > GATE 0.9',
    footR: 'routed to billing · no human',
    trace: 'noul 0.93 → billing',
    hud: { title: 'noul · 是/否', value: '0.93', rows: [['P(yes)', '0.93'], ['判断', '是']] },
  },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeOut = x => 1 - (1 - x) ** 3;
const easeInOut = x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

// Damped spring step response (0 → 1) for settling motion.
function spring(x, zeta = 0.45, omega = 12) {
  if (x <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * x) * (Math.cos(wd * x) + ((zeta * omega) / wd) * Math.sin(wd * x));
}

// Rounded rectangle in the platform plane, ordered front → right → back → left corner.
function rrect(u0, v0, u1, v1, r, seg = 6) {
  const rr = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  if (rr < 0.01) return [[u1, v0], [u1, v1], [u0, v1], [u0, v0]];
  const pts = [];
  const corners = [[u1 - rr, v0 + rr, -90], [u1 - rr, v1 - rr, 0], [u0 + rr, v1 - rr, 90], [u0 + rr, v0 + rr, 180]];
  for (const [cu, cv, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = (a0 + (90 * i) / seg) * DEG;
      pts.push([cu + rr * Math.cos(a), cv + rr * Math.sin(a)]);
    }
  }
  return pts;
}

function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const q of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const q = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// No-op 2D context: lets a layer's draw code run once to measure its projected bounds.
const NULL_CTX = new Proxy({}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (prop === 'measureText') return () => ({ width: 0 });
    return () => {};
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
});

function makeCanvas(w, h) {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  return null;
}

// Axonometric painter bound to one context and one view (origin + scale).
class Iso {
  constructor(ctx, view) {
    this.ctx = ctx;
    this.ox = view.ox;
    this.oy = view.oy;
    this.k = view.k;
    this.dpr = view.dpr || 1;
  }

  p(u, v, z = 0) {
    const x = this.ox + this.k * (u * EX.x + v * EY.x);
    const y = this.oy + this.k * (u * EX.y + v * EY.y + z * EZ);
    if (this.bounds) this.mark(x, y);
    return [x, y];
  }

  // Bounds probe used when sizing cached layers.
  mark(x, y) {
    const b = this.bounds;
    if (!b) return;
    if (x < b.x0) b.x0 = x;
    if (y < b.y0) b.y0 = y;
    if (x > b.x1) b.x1 = x;
    if (y > b.y1) b.y1 = y;
  }

  w(px) {
    return Math.max(0.5, px * this.k);
  }

  path(points, close = true) {
    const { ctx } = this;
    ctx.beginPath();
    points.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    if (close) ctx.closePath();
  }

  stroke(color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.w(width);
    this.ctx.stroke();
  }

  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  line(a, b, color, width = 1) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    this.stroke(color, width);
  }

  setShadow(blur, dy, alpha, dx = 0) {
    const { ctx } = this;
    ctx.shadowColor = `rgba(64, 60, 50, ${alpha})`;
    ctx.shadowBlur = blur * this.k * this.dpr;
    ctx.shadowOffsetX = dx * this.k * this.dpr;
    ctx.shadowOffsetY = dy * this.k * this.dpr;
  }

  hgrad(x0, x1, stops) {
    const g = this.ctx.createLinearGradient(x0, 0, x1, 0);
    for (const [o, c] of stops) g.addColorStop(o, c);
    return g;
  }

  // Rounded prism: top face + visible front-left (-v) and front-right (+u) faces.
  prism(u0, v0, u1, v1, z0, z1, o = {}) {
    const { ctx } = this;
    const pal = o.pal || WARM;
    const r = o.r || 0;
    const ring = rrect(u0, v0, u1, v1, r, o.seg || 6);
    const n = ring.length;
    const top = ring.map(([u, v]) => this.p(u, v, z1));
    const bot = ring.map(([u, v]) => this.p(u, v, z0));
    let iL = 0;
    let iR = 0;
    for (let i = 1; i < n; i++) {
      if (top[i][0] < top[iL][0] - 1e-6) iL = i;
      if (top[i][0] > top[iR][0] + 1e-6) iR = i;
    }
    const front = [];
    for (let i = iL, g = 0; g <= n; i = (i + 1) % n, g++) {
      front.push(i);
      if (i === iR) break;
    }
    const back = [];
    for (let i = iR, g = 0; g <= n; i = (i + 1) % n, g++) {
      back.push(i);
      if (i === iL) break;
    }
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return null;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (o.shadow) {
      ctx.save();
      this.setShadow(...o.shadow);
      this.path([...back.map(i => top[i]), ...front.map(i => bot[i])]);
      this.fill(pal.top);
      ctx.restore();
    }
    const tall = z1 - z0 > 0.01;
    if (tall) {
      this.path([...front.map(i => top[i]), ...front.slice().reverse().map(i => bot[i])]);
      const xL = top[iL][0];
      const xR = top[iR][0];
      const width = Math.max(1, xR - xL);
      const tf = clamp((this.p(u1, v0, z1)[0] - xL) / width, 0, 1);
      const d = r > 0 ? clamp((r * this.k * 0.62) / width, 0.003, 0.3) : 0.0015;
      const g = ctx.createLinearGradient(xL, 0, xR, 0);
      g.addColorStop(0, pal.left);
      g.addColorStop(clamp(tf - d, 0, 1), pal.left);
      g.addColorStop(clamp(tf + d, 0, 1), pal.right);
      g.addColorStop(1, pal.right);
      ctx.fillStyle = g;
      ctx.fill();
    }
    this.path(top);
    this.fill(o.topFill || pal.top);
    const lc = o.line || pal.line;
    const lw = o.lw ?? 1;
    if (tall && o.bands) {
      for (const b of o.bands) {
        this.path(front.map(i => this.p(ring[i][0], ring[i][1], b.z)), false);
        this.stroke(b.color, b.w ?? 0.8);
      }
    }
    if (o.inset) {
      const d = o.inset.d;
      const inner = rrect(u0 + d, v0 + d, u1 - d, v1 - d, Math.max(0, (o.inset.r ?? r) - d * 0.4), o.seg || 6);
      this.path(inner.map(([u, v]) => this.p(u, v, z1)));
      this.stroke(o.inset.color, o.inset.w ?? 0.8);
    }
    this.path(top);
    this.stroke(lc, lw);
    if (tall) {
      this.path(front.map(i => bot[i]), false);
      this.stroke(lc, lw);
      this.line(top[iL], bot[iL], lc, lw);
      this.line(top[iR], bot[iR], lc, lw);
      if (r < 0.01) this.line(this.p(u1, v0, z0), this.p(u1, v0, z1), lc, lw);
    }
    ctx.restore();
    return { top, bot, front, ring };
  }

  // Vertical cylinder standing on (u, v).
  cyl(u, v, z0, z1, r, o = {}) {
    const { ctx } = this;
    const [cx, yb] = this.p(u, v, z0);
    const yt = this.p(u, v, z1)[1];
    const rx = r * this.k;
    const ry = rx * FLAT;
    const lc = o.line || LINE;
    const lw = o.lw ?? 1;
    const alpha = o.alpha ?? 1;
    if (this.bounds) {
      this.mark(cx - rx, yt - ry);
      this.mark(cx + rx, yb + ry);
    }
    if (alpha <= 0.002) return { cx, yt, yb, rx, ry };
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (o.shadow) {
      ctx.save();
      this.setShadow(...o.shadow);
      ctx.beginPath();
      ctx.ellipse(cx, yb, rx, ry, 0, 0, TAU);
      this.fill(o.topColor || '#ffffff');
      ctx.restore();
    }
    if (z1 - z0 > 0.01) {
      ctx.beginPath();
      ctx.moveTo(cx - rx, yt);
      ctx.lineTo(cx - rx, yb);
      ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true);
      ctx.lineTo(cx + rx, yt);
      ctx.ellipse(cx, yt, rx, ry, 0, 0, Math.PI, false);
      ctx.closePath();
      ctx.fillStyle = this.hgrad(cx - rx, cx + rx, o.body || BODY_WHITE);
      ctx.fill();
      this.stroke(lc, lw);
    }
    if (o.topColor !== null) {
      ctx.beginPath();
      ctx.ellipse(cx, yt, rx, ry, 0, 0, TAU);
      this.fill(o.topColor || '#fdfdfb');
      this.stroke(lc, lw);
    }
    ctx.restore();
    return { cx, yt, yb, rx, ry };
  }

  // Circle perpendicular to the given world axis.
  circle(cu, cv, cz, axis, r, n = 40) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const c = Math.cos(a) * r;
      const s = Math.sin(a) * r;
      if (axis === 'u') pts.push(this.p(cu, cv + c, cz + s));
      else if (axis === 'v') pts.push(this.p(cu + c, cv, cz + s));
      else pts.push(this.p(cu + c, cv + s, cz));
    }
    return pts;
  }

  // Horizontal flat ellipse outline (circle lying in the platform plane).
  disc(u, v, z, r) {
    const [cx, cy] = this.p(u, v, z);
    const rx = r * this.k;
    if (this.bounds) {
      this.mark(cx - rx, cy - rx * FLAT);
      this.mark(cx + rx, cy + rx * FLAT);
    }
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, rx, rx * FLAT, 0, 0, TAU);
  }
}

export class JevIsometricScene {
  constructor() {
    this.duration = DURATION;
    this.layers = new Map();
    this.layerKey = '';
    this.sprites = new Map();
  }

  // Static z-bands of the rig are rasterised once per DPR/view into tight, pixel-aligned layers;
  // only the moving parts are drawn every frame.
  layer(ctx, iso, name, draw) {
    const key = `${iso.dpr}|${iso.ox}|${iso.oy}|${iso.k}`;
    if (key !== this.layerKey) {
      this.layers.clear();
      this.layerKey = key;
    }
    if (!this.layers.has(name)) this.layers.set(name, this.buildLayer(iso, draw));
    const L = this.layers.get(name);
    if (L) ctx.drawImage(L.canvas, L.x, L.y, L.w, L.h);
    else draw(iso);
  }

  buildLayer(iso, draw) {
    const view = { ox: iso.ox, oy: iso.oy, k: iso.k, dpr: iso.dpr };
    const probe = new Iso(NULL_CTX, view);
    probe.bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    draw(probe);
    const b = probe.bounds;
    if (!Number.isFinite(b.x0)) return null;
    const d = iso.dpr;
    const pad = 64;
    const dx0 = Math.floor((b.x0 - pad) * d);
    const dy0 = Math.floor((b.y0 - pad) * d);
    const dx1 = Math.ceil((b.x1 + pad) * d);
    const dy1 = Math.ceil((b.y1 + pad) * d);
    const canvas = makeCanvas(dx1 - dx0, dy1 - dy0);
    const c = canvas && canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(d, 0, 0, d, -dx0, -dy0);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    draw(new Iso(c, view));
    return { canvas, x: dx0 / d, y: dy0 / d, w: (dx1 - dx0) / d, h: (dy1 - dy0) / d };
  }

  font(ctx, size = 12, weight = 400, family = MONO) {
    ctx.font = `${weight} ${size}px ${family}`;
  }

  text(ctx, str, x, y, color = '#27272a', size = 12, weight = 400, align = 'left', family = MONO) {
    this.font(ctx, size, weight, family);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  // Letter-spaced text drawn glyph by glyph so tracking is identical across browsers.
  spaced(ctx, str, x, y, spacing, align = 'left') {
    const chars = [...String(str)];
    const widths = chars.map(c => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1);
    let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
    ctx.textAlign = 'left';
    chars.forEach((c, i) => {
      ctx.fillText(c, cx, y);
      cx += widths[i] + spacing;
    });
    return total;
  }

  render(ctx, state = {}) {
    const s = this.stateAt(Number(state.elapsed) || 0, Boolean(state.reducedMotion));
    ctx.save();
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.drawRig(ctx, s, VIEW);
    this.drawHeader(ctx, s);
    this.drawHud(ctx, s);
    this.drawCaption(ctx, s);
    this.drawTelemetry(ctx, s);
    this.drawFooter(ctx, s);
    ctx.restore();
  }

  // Cross-fade weights for the copy of each act (incoming copy rises 6px, outgoing drifts up 4px).
  textMix(t) {
    const fades = [[6, 0, 1], [12, 1, 2], [17.55, 2, 0]];
    for (const [T, from, to] of fades) {
      if (t >= T - 0.22 && t < T + 0.32) {
        const x = easeInOut(span(t, T - 0.22, T + 0.32));
        return [{ idx: from, a: 1 - x, dy: -4 * x }, { idx: to, a: x, dy: 6 * (1 - x) }];
      }
    }
    const idx = t < 6 ? 0 : t < 12 ? 1 : t < 17.55 ? 2 : 0;
    return [{ idx, a: 1, dy: 0 }];
  }

  stateAt(elapsed, rm = false) {
    const t = ((elapsed % DURATION) + DURATION) % DURATION;
    // Loop reset: every act-2/3 element returns to the Fig 1 rest pose before t wraps to 0.
    const reset = easeInOut(span(t, 17.2, 17.85));
    const keep = 1 - reset;

    let bead = -1;
    let beadGlow = 0;
    if (!rm && t > 0.6 && t < 5.4) {
      const q = (t - 0.6) / 0.16;
      bead = Math.floor(q) % 13;
      beadGlow = 1 - (q % 1);
    }

    const swingRaw = rm ? easeInOut(span(t, 13.1, 13.9)) : t >= 13.1 ? spring(t - 13.1, 0.36, 9) : 0;
    const swing = swingRaw * keep;

    const rings = [0.55, 0.27, 0.19, 0.15].map((target, i) => {
      const t0 = 12.45 + 0.17 * i;
      if (t < t0) return null;
      const x = t - t0;
      const pr = rm ? easeOut(clamp(x / 0.5, 0, 1)) : spring(x, 0.5, 13);
      return { f: lerp(1.75, target, pr) + reset * 0.9, a: clamp(x / 0.16, 0, 1) * keep };
    });

    const cardX = t - 15.9;
    const cardDrop = cardX <= 0 ? 0 : rm ? easeOut(clamp(cardX / 0.5, 0, 1)) : spring(cardX, 0.55, 14);

    return {
      t,
      rm,
      text: this.textMix(t),
      drum: rm ? 0.4 : (t * 5 * Math.PI) / 18,
      bead,
      beadGlow,
      plateU: lerp(196, 471, easeInOut(span(t, 6.7, 9.1))),
      plateA: span(t, 6.25, 6.75) * keep,
      tokenU: lerp(229, 310, easeInOut(span(t, 6.7, 8.7))),
      tokenA: span(t, 6.45, 6.85) * keep,
      head: 7 * (easeOut(span(t, 9.0, 9.45)) - easeInOut(span(t, 10.9, 11.4))),
      scan: span(t, 9.45, 10.85),
      scanA: t > 9.4 && t < 10.95 ? Math.sin(Math.PI * span(t, 9.4, 10.95)) : 0,
      readA: span(t, 9.4, 9.75) * keep,
      glowA: span(t, 12.2, 12.65) * keep,
      pulse: rm ? 0.5 : 0.5 + 0.5 * Math.sin((TAU * t) / 1.5),
      rays: rm ? 0 : t * 0.35,
      rings,
      needleA: span(t, 7.0, 7.6) * keep,
      needleDeg: lerp(296, 220, swing),
      p: 0.93 * swing,
      gateA: span(t, 14.15, 14.45) * keep,
      press: 7 * easeOut(span(t, 14.1, 14.4)) * keep,
      paper: 54 + 26 * easeInOut(span(t, 14.6, 16.1)) * keep,
      cardZ: lerp(46, 13.5, cardDrop),
      cardA: (cardX > 0 ? clamp(cardX / 0.12, 0, 1) : 0) * keep,
      tokens: span(t, 0.45, 5.2),
      tokensA: (1 - 0.5 * span(t, 6, 6.6)) * keep,
      gatePulse: t >= 6 && t < 12 && !rm ? 0.5 + 0.5 * Math.sin((TAU * (t - 6)) / 1.6) : 0,
    };
  }

  // ------------------------------------------------------------------ rig
  drawRig(ctx, s, view) {
    const iso = new Iso(ctx, { ...view, dpr: this.dprOf(ctx) });
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // Painter's order, interleaving cached static bands with live parts where they occlude each other.
    this.layer(ctx, iso, 'back', L => {
      this.drawSlab(L);
      this.drawCompute(L);
      this.drawGantryRear(L);
      this.drawRails(L);
      this.drawStack(L);
      this.drawInput(L);
    });
    this.drawPlate(iso, s);
    this.drawGantryFront(iso, s);
    this.drawCard(iso, s);
    this.layer(ctx, iso, 'bed', L => {
      this.drawPrinter(L);
      this.drawBed(L);
    });
    this.drawPaper(iso, s);
    this.drawRoller(iso);
    this.drawToken(iso, s);
    this.drawRings(iso, s);
    this.drawNeedle(iso, s);
    if (s.glowA > 0.002) this.drawGlow(iso, s);
    this.drawInputLive(iso, s);
    this.layer(ctx, iso, 'panel', L => this.drawPanel(L));
    this.drawGate(iso, s);
    this.layer(ctx, iso, 'switches', L => this.drawSwitches(L));
    this.lever(iso, 1056, 38, 43, s.press);
    ctx.restore();
  }

  drawSlab(iso) {
    const { ctx } = iso;
    const U = 1095.5;
    const V = 623.3;
    const slab = iso.prism(0, 0, U, V, -38, 0, {
      r: 8,
      seg: 8,
      pal: { top: '#fdfdfb', left: '#f5f5f1', right: '#e3e3df', line: '#a6a6a3' },
      shadow: [34, 13, 0.17, -3],
      bands: [
        { z: -4.8, color: '#d9d9d6', w: 0.8 },
        { z: -7.6, color: '#e7e7e4', w: 0.8 },
        { z: -23, color: '#e0e0dd', w: 0.8 },
      ],
    });
    // Millimetre ruler ticks along the long front-left face.
    for (let u = 33.3; u < U - 20; u += 33.3) iso.line(iso.p(u, 0, -13.6), iso.p(u, 0, -30.4), '#d0d0cd', 0.8);
    // Conduit trim on three sides (open along the front-left edge); insets measured per side.
    const dl = 13;
    const db = 15;
    const dr = 22;
    const rt = 12;
    const trim = [];
    const arc = (cu, cv, a0, a1) => {
      for (let i = 0; i <= 8; i++) {
        const a = (a0 + ((a1 - a0) * i) / 8) * DEG;
        trim.push(iso.p(cu + rt * Math.cos(a), cv + rt * Math.sin(a), 0));
      }
    };
    trim.push(iso.p(300, dl, 0));
    arc(dl + rt, dl + rt, 270, 180);
    arc(dl + rt, V - db - rt, 180, 90);
    arc(U - dr - rt, V - db - rt, 90, 0);
    arc(U - dr - rt, dr + rt, 0, -90);
    trim.push(iso.p(965, dr, 0));
    iso.path(trim, false);
    iso.stroke('#b4b4b1', 0.9);
    for (const [u, v] of [[1079.6, 594], [1079.4, 17]]) {
      iso.disc(u, v, 0, 4.2);
      iso.stroke('#b3b3b0', 0.8);
      iso.line(iso.p(u - 2.4, v, 0), iso.p(u + 2.4, v, 0), '#c4c4c1', 0.7);
    }
    for (const [u, v] of [[669, V - db], [U - dr, 352], [U - dr, 102]]) this.post(iso, u, v);
    ctx.globalAlpha = 1;
    return slab;
  }

  post(iso, u, v, h = 12, size = 10) {
    iso.prism(u - size / 2, v - size / 2, u + size / 2, v + size / 2, 0, h, {
      r: 2,
      seg: 3,
      pal: { top: '#fefefe', left: '#f0f0ee', right: '#dcdcd9', line: '#a7a7a4' },
      shadow: [5, 2, 0.12],
    });
  }

  drawCompute(iso) {
    const u0 = 13;
    const v0 = 470;
    const u1 = 237.2;
    const v1 = 607.2;
    // Small conduit post + cable feeding the rail from the block's right face.
    this.post(iso, 255.6, 537, 11);
    iso.prism(u0, v0, u1, v1, 0, 178, {
      r: 3,
      pal: { top: '#fdfdfb', left: '#f5f5f1', right: '#e3e3df', line: '#a2a29f' },
      shadow: [16, 4, 0.13, -2],
      bands: [
        { z: 174.5, color: '#e1e1de', w: 0.8 },
        { z: 112.5, color: '#d2d2cf', w: 0.9 },
      ],
      inset: { d: 5, color: '#dcdcd9', w: 0.8, r: 10 },
    });
    // Seven cooling louvres on the front-left face.
    for (let i = 0; i < 7; i++) {
      const ua = 35.4 + 16.5 * i;
      const ub = ua + 10.5;
      const quad = [iso.p(ua, v0, 20), iso.p(ub, v0, 20), iso.p(ub, v0, 96), iso.p(ua, v0, 96)];
      iso.path(quad);
      iso.fill('#efefeb');
      iso.stroke('#a5a5a2', 0.9);
      iso.line(iso.p(ua + 1.6, v0, 21.5), iso.p(ua + 1.6, v0, 94.5), '#dadad6', 0.8);
    }
    // Recessed circular port.
    const [px, py] = iso.p(180, v0, 84);
    const { ctx } = iso;
    const g = ctx.createRadialGradient(px - 3 * iso.k, py - 3 * iso.k, 1, px, py, 15.8 * iso.k);
    g.addColorStop(0, '#fbfbf9');
    g.addColorStop(1, '#eaeae6');
    ctx.beginPath();
    ctx.arc(px, py, 15.7 * iso.k, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    iso.stroke('#9f9f9c', 0.9);
    ctx.beginPath();
    ctx.arc(px, py, 12.6 * iso.k, 0, TAU);
    iso.stroke('#c2c2bf', 0.8);
    // Cable from the block face down to the conduit post.
    iso.line(iso.p(u1, 540, 56), iso.p(255.6, 537, 11), '#8f8f8c', 0.75);
  }

  drawRails(iso) {
    const rail = { top: '#f9f9f7', left: '#eeeeeb', right: '#dbdbd8', line: '#a8a8a5' };
    const stop = { top: '#fbfbfc', left: '#eeedf0', right: '#cdccd1', line: '#a0a0a7' };
    // Narrow end stop, the twin guide rails of the gantry channel, then the far end stop.
    iso.prism(172, 393, 182, 454, 0, 19, { r: 2.5, seg: 3, pal: stop, shadow: [8, 2, 0.1] });
    iso.prism(182, 417.6, 733, 437.8, 0, 16.8, { r: 3, pal: rail, inset: { d: 3.5, color: '#e3e3e0', w: 0.7 } });
    iso.prism(203, 368.6, 733, 390.5, 0, 16.8, { r: 3, pal: rail, inset: { d: 3.5, color: '#e3e3e0', w: 0.7 } });
    iso.prism(733, 394, 743, 455, 0, 19, { r: 2.5, seg: 3, pal: stop, shadow: [8, 2, 0.1] });
  }

  // Schema plate rides the rails in from the left in act 2, then is read by the sensor head.
  drawPlate(iso, s) {
    if (s.plateA <= 0.002) return;
    const { ctx } = iso;
    const u0 = s.plateU;
    const u1 = u0 + 99;
    const lift = (1 - easeOut(s.plateA)) * 14;
    const z0 = 17 + lift;
    iso.prism(u0, 366, u1, 449, z0, z0 + 4, { r: 4, pal: PLATE, alpha: s.plateA, shadow: [10, 4, 0.12] });
    ctx.save();
    ctx.globalAlpha *= s.plateA;
    for (const [v, a, b] of [[432, 12, 86], [414, 12, 66], [396, 12, 80], [380, 12, 56]]) iso.line(iso.p(u0 + a, v, z0 + 4), iso.p(u0 + b, v, z0 + 4), 'rgba(166, 134, 74, 0.5)', 0.8);
    ctx.restore();
    if (s.scanA > 0.01) {
      const u = lerp(u0 + 6, u1 - 6, s.scan);
      ctx.save();
      ctx.globalAlpha = s.scanA;
      iso.line(iso.p(u, 369, z0 + 4.2), iso.p(u, 446, z0 + 4.2), `rgba(${AMBER}, 0.95)`, 1.6);
      ctx.restore();
    }
  }

  drawGantryRear(iso) {
    iso.cyl(504, 472.5, 0, 9, 19, { body: BODY_COOL, topColor: '#fbfbfd', line: '#9d9da7', shadow: [8, 2, 0.12] });
    iso.prism(495.5, 464, 512.5, 481, 9, 104, { r: 3, pal: COOL });
  }

  drawGantryFront(iso, s) {
    const legPal = COOL;
    const u0 = 495.5;
    const u1 = 512.5;
    // Sensor head with fluted lower collar and gold reading puck.
    const drop = s.head;
    const hz0 = 74 - drop;
    const head = iso.cyl(504, 430, hz0, 104, 13, { body: BODY_COOL, topColor: null, line: '#9d9da7' });
    for (let i = 1; i < 8; i++) {
      const x = head.cx - head.rx + (head.rx * 2 * i) / 8;
      const yb = head.yb + Math.sqrt(Math.max(0, 1 - ((x - head.cx) / head.rx) ** 2)) * head.ry;
      iso.line([x, yb - 15 * iso.k], [x, yb - 1], 'rgba(150, 150, 162, 0.55)', 0.6);
    }
    const glow = Math.max(s.scanA, s.glowA * 0.55);
    if (glow > 0.01) {
      const { ctx } = iso;
      const [cx, cy] = iso.p(504, 430, hz0 - 8);
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 30 * iso.k);
      g.addColorStop(0, `rgba(${AMBER}, ${0.38 * glow})`);
      g.addColorStop(1, `rgba(${AMBER}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 * iso.k, 0, TAU);
      ctx.fill();
    }
    iso.cyl(504, 430, hz0 - 10, hz0 - 2, 9, { body: BODY_GOLD, topColor: '#f3e3bb', line: GOLD.line });
    iso.prism(u0, 377, u1, 394, 0, 104, { r: 3, pal: legPal });
    iso.prism(u0, 377, u1, 481, 104, 129, { r: 6, pal: legPal, shadow: [10, 3, 0.1] });
  }

  // Stacked gold output cards behind the printer.
  drawStack(iso) {
    const plates = [[881, 512, 1026, 595, 0], [883.5, 516, 1023.5, 594, 4.6], [886, 520, 1021, 593, 9.2]];
    for (const [a, b, c, d, z] of plates) iso.prism(a, b, c, d, z, z + 3.4, { r: 5, pal: PLATE, shadow: z ? null : [12, 3, 0.14] });
  }

  drawCard(iso, s) {
    if (s.cardA > 0.002) iso.prism(888, 522, 1019, 592, s.cardZ, s.cardZ + 3.4, { r: 5, pal: PLATE, alpha: s.cardA });
  }

  drawPrinter(iso) {
    iso.cyl(1032.5, 526, 0, 16, 4.5, { body: BODY_COOL, topColor: '#fbfbfd', line: '#9d9da7' });
    iso.prism(941.5, 412, 1040, 480, 0, 35, {
      r: 5,
      pal: { top: '#fefefd', left: '#f5f5f1', right: '#e4e4e0', line: '#a3a3a0' },
      shadow: [18, 5, 0.16, -3],
      bands: [{ z: 17.5, color: '#d6d6d3', w: 0.8 }],
      inset: { d: 5, color: '#e0e0dd', w: 0.7 },
    });
    const { ctx } = iso;
    ctx.fillStyle = '#c3c3bf';
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 4; j++) {
        const [x, y] = iso.p(958 + i * 10, 424 + j * 12.5, 35);
        ctx.beginPath();
        ctx.arc(x, y, 0.85 * iso.k, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Receipt sheet feeding up out of the printer slot.
  drawPaper(iso, s) {
    const { ctx } = iso;
    const pz = 42 + s.paper;
    const sheet = [iso.p(970, 481, 40), iso.p(1021, 481, 40), iso.p(1021, 481, pz), iso.p(970, 481, pz)];
    iso.path(sheet);
    const pg = ctx.createLinearGradient(sheet[3][0], sheet[3][1], sheet[0][0], sheet[0][1]);
    pg.addColorStop(0, '#f1f1ef');
    pg.addColorStop(1, '#e4e4e1');
    ctx.fillStyle = pg;
    ctx.fill();
    iso.stroke('#b2b2af', 0.8);
    if (s.paper > 55) {
      ctx.save();
      ctx.globalAlpha = clamp((s.paper - 55) / 10, 0, 1);
      for (let i = 0; i < 3; i++) {
        const z = pz - 9 - i * 6.5;
        iso.line(iso.p(976, 481, z), iso.p(1008 - i * 7, 481, z), 'rgba(140, 140, 136, 0.55)', 0.7);
      }
      ctx.restore();
    }
  }

  // Gold-capped feed roller in front of the sheet.
  drawRoller(iso) {
    const { ctx } = iso;
    const R = 7;
    const back = iso.circle(963.5, 479, 42, 'u', R, 24);
    const front = iso.circle(1027.4, 479, 42, 'u', R, 24);
    iso.path(hull([...back, ...front]));
    const [ax, ay] = iso.p(995, 479, 42 + R);
    const [bx, by] = iso.p(995, 479, 42 - R);
    const rg = ctx.createLinearGradient(ax, ay, bx, by);
    rg.addColorStop(0, '#fdfdfc');
    rg.addColorStop(0.55, '#eeeeeb');
    rg.addColorStop(1, '#d6d6d2');
    ctx.fillStyle = rg;
    ctx.fill();
    iso.stroke('#a3a3a0', 0.8);
    for (const ring of [back, front]) {
      iso.path(ring);
      iso.fill('#f2e2bb');
      iso.stroke(GOLD.line, 0.9);
    }
  }

  drawBed(iso) {
    const v0 = 177;
    const v1 = 296;
    iso.prism(156, v0, 886, v1, 0, 45, {
      r: 4,
      pal: DUSK,
      shadow: [14, 4, 0.12, -2],
      bands: [{ z: 41.5, color: '#dcdcd9', w: 0.8 }],
      inset: { d: 7, color: '#d9d9d6', w: 0.8 },
    });
    // 34 slot windows along the front-left wall.
    for (let i = 0; i < 34; i++) {
      const ua = 183 + 18.45 * i;
      const ub = ua + 10;
      iso.path([iso.p(ua, v0, 5.5), iso.p(ub, v0, 5.5), iso.p(ub, v0, 31), iso.p(ua, v0, 31)]);
      iso.fill('#f0f0ee');
      iso.stroke('#a7a7a4', 0.85);
      iso.line(iso.p(ua + 1.4, v0, 7), iso.p(ua + 1.4, v0, 29.5), '#dadad7', 0.7);
    }
    // Fine millimetre ruler strip in front of the bed.
    iso.prism(150, 145, 905, 160, 0, 2.6, { r: 2, pal: { top: '#fbfbf9', left: '#ececea', right: '#dededb', line: '#acaca9' }, lw: 0.85 });
    for (let i = 0; i <= 116; i++) {
      const u = 158 + i * 6.45;
      const long = i % 5 === 0;
      iso.line(iso.p(u, long ? 147 : 149.5, 2.6), iso.p(u, 157.5, 2.6), long ? '#b2b2af' : '#c9c9c6', 0.7);
    }
    // Slot track (1) with recessed groove and tick scale.
    iso.prism(207, 218, 435, 251, 45, 53, {
      r: 8,
      pal: { top: '#f9f9f7', left: '#ebebe8', right: '#d9d9d6', line: '#a3a3a0' },
      shadow: [6, 2, 0.1],
    });
    const groove = rrect(214, 224.5, 428, 243.5, 4, 4).map(([u, v]) => iso.p(u, v, 53));
    iso.path(groove);
    iso.fill('#efefec');
    iso.stroke('#b0b0ad', 0.8);
    iso.line(iso.p(216, 225.8, 53), iso.p(426, 225.8, 53), '#9d9d9a', 0.9);
    for (let i = 0; i <= 28; i++) {
      const u = 221 + i * 7.25;
      iso.line(iso.p(u, i % 4 === 0 ? 231 : 235, 53), iso.p(u, 242, 53), '#c3c3c0', 0.6);
    }
    this.tag(iso, 434.3, 242.5, 45, '1');
    // Plinth and four turned-brass calibration pillars (2).
    iso.prism(469, 199, 690, 247, 45, 50, { r: 8, pal: { top: '#fbfbfc', left: '#eeeeeb', right: '#dededb', line: '#b0b0ad' }, lw: 0.85 });
    this.tag(iso, 667, 234, 50, '2');
    for (let i = 0; i < 4; i++) {
      this.pillarBody(iso, PILLAR_U[i], PILLAR_V, PILLAR_Z);
      this.pillarCap(iso, PILLAR_U[i], PILLAR_V, PILLAR_Z);
    }
    // Circular dial (3) with tick arc and brass hub.
    this.drawDial(iso);
  }

  // Gold slider carriage in the slot track (1).
  drawToken(iso, s) {
    if (s.tokenA <= 0.002) return;
    const lift = (1 - easeOut(s.tokenA)) * 10;
    iso.prism(s.tokenU - 20.5, 219.5, s.tokenU + 20.5, 249, 53 + lift, 61 + lift, {
      r: 2.5,
      seg: 3,
      pal: { top: '#f5ecd5', left: '#ead9b4', right: '#d9c497', line: '#b49c66' },
      alpha: s.tokenA,
      shadow: [6, 2, 0.12],
    });
    iso.ctx.save();
    iso.ctx.globalAlpha *= s.tokenA;
    iso.line(iso.p(s.tokenU - 14, 234, 61 + lift), iso.p(s.tokenU + 14, 234, 61 + lift), 'rgba(170, 140, 84, 0.45)', 0.7);
    iso.ctx.restore();
  }

  // Ivory calibration washers settling down the brass pillars (2).
  drawRings(iso, s) {
    s.rings.forEach((ring, i) => {
      if (!ring || ring.a <= 0.002) return;
      const u = PILLAR_U[i];
      const rz = PILLAR_Z + 4.5 + ring.f * 46;
      iso.cyl(u, PILLAR_V, rz, rz + 5.5, 16.8, { body: BODY_IVORY, topColor: '#fcfcfb', line: '#aaaaa6', alpha: ring.a, shadow: [6, 2, 0.12] });
      // While a washer slides past the cap, the cap stays in front of it.
      if (ring.f > 0.75 && ring.f <= 1.04) this.pillarCap(iso, u, PILLAR_V, PILLAR_Z);
    });
  }

  drawNeedle(iso, s) {
    if (s.needleA <= 0.002) return;
    const { ctx } = iso;
    const a = s.needleDeg * DEG;
    ctx.save();
    ctx.globalAlpha *= s.needleA;
    iso.line(iso.p(DIAL.u - Math.cos(a) * 8, DIAL.v - Math.sin(a) * 8, 52), iso.p(DIAL.u + Math.cos(a) * 45, DIAL.v + Math.sin(a) * 45, 52), '#5d5d5a', 1.25);
    ctx.restore();
    this.dialHub(iso);
  }

  tag(iso, u, v, z, label) {
    iso.prism(u, v, u + 22, v + 17, z, z + 3, { r: 3, seg: 3, pal: { top: '#fdfdfc', left: '#ededea', right: '#dcdcd9', line: '#b1b1ae' }, lw: 0.8 });
    const [x, y] = iso.p(u + 11, v + 8.5, z + 3);
    this.text(iso.ctx, label, x, y + 4 * iso.k, '#161616', Math.max(8, 11.5 * iso.k), 700, 'center', SANS);
  }

  pillarBody(iso, u, v, z) {
    const gl = GOLD.line;
    const base = iso.cyl(u, v, z, z + 4.5, 16.6, { body: BASE_GOLD, topColor: null, line: gl, shadow: [7, 2, 0.14] });
    iso.cyl(u, v, z + 4.5, z + 53.5, 14.3, { body: BODY_GOLD, topColor: null, line: gl });
    // Flared foot bead.
    iso.ctx.beginPath();
    iso.ctx.ellipse(base.cx, base.yt, base.rx * 0.93, base.ry * 0.93, 0, 0, Math.PI);
    iso.stroke('rgba(171, 143, 87, 0.65)', 0.8);
    // Sheen line across the turned body.
    const [sx, sy] = iso.p(u, v, z + 28);
    iso.line([sx - 2 * iso.k, sy + 2.5 * iso.k], [sx + 9 * iso.k, sy - 2 * iso.k], 'rgba(255, 252, 240, 0.7)', 0.8);
  }

  pillarCap(iso, u, v, z) {
    const { ctx } = iso;
    const capZ = z + 53.5;
    iso.cyl(u, v, capZ, capZ + 3.2, 16, { body: BASE_GOLD, topColor: '#fbefd5', line: GOLD.line });
    // Turned onion-dome knob: rounded shoulders rising to a soft point (fitted to the reference silhouette).
    const [dx, dy] = iso.p(u, v, capZ + 3.2);
    const rx = 10.4 * iso.k;
    const ry = rx * FLAT;
    const H = 11.9 * iso.k;
    const g = ctx.createRadialGradient(dx - rx * 0.3, dy - H * 0.7, 0.5, dx, dy - H * 0.35, rx * 1.35);
    g.addColorStop(0, '#fcf5e3');
    g.addColorStop(0.6, '#f3e6c4');
    g.addColorStop(1, '#e0cb98');
    ctx.beginPath();
    ctx.moveTo(dx + rx, dy);
    ctx.ellipse(dx, dy, rx, ry, 0, 0, Math.PI, false);
    ctx.bezierCurveTo(dx - rx, dy - H * 0.7, dx - rx * 0.36, dy - H * 0.94, dx, dy - H);
    ctx.bezierCurveTo(dx + rx * 0.36, dy - H * 0.94, dx + rx, dy - H * 0.7, dx + rx, dy);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    iso.stroke('rgba(160, 134, 80, 0.8)', 0.8);
  }

  drawDial(iso) {
    const cu = DIAL.u;
    const cv = DIAL.v;
    iso.cyl(cu, cv, 45, 51, 62, {
      body: [[0, '#efeff0'], [0.3, '#fafafa'], [0.7, '#e2e1e4'], [1, '#d3d2d6']],
      topColor: '#fdfdfd',
      line: '#a3a3a0',
      shadow: [10, 3, 0.12],
    });
    iso.disc(cu, cv, 51, 57.5);
    iso.stroke('#d8d8d5', 0.8);
    for (let a = 140; a <= 300; a += 5) {
      const major = (a - 140) % 20 === 0;
      const c = Math.cos(a * DEG);
      const sn = Math.sin(a * DEG);
      iso.line(iso.p(cu + c * 33, cv + sn * 33, 51), iso.p(cu + c * (major ? 43.5 : 38.5), cv + sn * (major ? 43.5 : 38.5), 51), major ? '#9c9c99' : '#b9b9b6', major ? 0.8 : 0.6);
    }
    this.dialHub(iso);
    this.tag(iso, 773, 164.5, 51, '3');
  }

  dialHub(iso) {
    iso.cyl(DIAL.u, DIAL.v, 51, 55.5, 8.6, { body: BODY_GOLD, topColor: '#f5e6c0', line: GOLD.line });
  }

  drawGlow(iso, s) {
    const { ctx } = iso;
    const [cx, cy] = iso.p(s.tokenU, 234, 57);
    const k = iso.k;
    const a = s.glowA;
    ctx.save();
    const halo = ctx.createRadialGradient(cx, cy, 4 * k, cx, cy, 52 * k);
    halo.addColorStop(0, `rgba(${AMBER}, ${0.3 * a})`);
    halo.addColorStop(0.55, `rgba(${AMBER}, ${0.12 * a})`);
    halo.addColorStop(1, `rgba(${AMBER}, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 52 * k, 0, TAU);
    ctx.fill();
    const r = (25.5 + s.pulse * 1.6) * k;
    const core = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    core.addColorStop(0, `rgba(255, 214, 150, ${0.18 * a})`);
    core.addColorStop(1, `rgba(${AMBER}, ${0.2 * a})`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(${AMBER}, ${0.85 * a})`;
    ctx.lineWidth = Math.max(1, 1.5 * k);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${AMBER}, ${0.45 * a})`;
    ctx.lineWidth = Math.max(0.6, 0.9 * k);
    for (let i = 0; i < 8; i++) {
      const ang = s.rays + (i * TAU) / 8;
      const r0 = r + 5 * k;
      const r1 = r + (9 + s.pulse * 2) * k;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawInput(iso) {
    // Back-left conduit posts: white cap and gold pin.
    iso.cyl(12, 170, 0, 12, 6.5, { body: BODY_WHITE, topColor: '#fdfdfb', line: '#a3a3a0', shadow: [5, 2, 0.12] });
    iso.cyl(10, 151, 0, 15, 3.8, { body: BODY_GOLD, topColor: '#f1e0b5', line: GOLD.line });
    this.drawDrum(iso);
    this.pillowBlocks(iso, true);
    // Inclined champagne input tray with engraved lines.
    iso.prism(30, -12, 304, 53, 0, 4.5, { r: 7, pal: PALE, shadow: [10, 3, 0.12] });
    for (const [v, a, b] of [[33, 48, 222], [20, 40, 300], [7, 62, 178]]) iso.line(iso.p(a, v, 4.5), iso.p(b, v, 4.5), 'rgba(176, 150, 98, 0.55)', 0.75);
    // Ten-bead abacus token bar.
    iso.prism(91, 32, 188, 60, 4.5, 9, { r: 5, pal: PALE, line: '#b39a62' });
    for (let i = 0; i < 10; i++) this.bead(iso, i, 0);
  }

  pillowBlocks(iso, shadow) {
    const block = { top: '#f9f9fb', left: '#dedde2', right: '#cbcacf', line: '#9c9ca5' };
    const sh = shadow ? [8, 3, 0.14] : null;
    iso.prism(75, 98.5, 103, 126.5, 0, 31, { r: 3, pal: block, shadow: sh });
    iso.prism(157, 98.5, 185, 126.5, 0, 31, { r: 3, pal: block, shadow: sh });
  }

  bead(iso, i, lit) {
    const { ctx } = iso;
    const [x, y] = iso.p(103 + i * 8.45, 46, 11.2);
    ctx.beginPath();
    ctx.ellipse(x, y, 2.7 * iso.k, 3.7 * iso.k, 0, 0, TAU);
    ctx.fillStyle = lit > 0 ? `rgba(${AMBER}, ${0.25 + 0.6 * lit})` : '#eee8d8';
    ctx.fill();
    iso.stroke(lit > 0 ? `rgba(196, 128, 32, ${0.5 + 0.5 * lit})` : '#98948a', 0.75);
  }

  // Live parts of the input bay: turning drum staves (behind the rim and pillow blocks) and the lit bead.
  drawInputLive(iso, s) {
    const { ctx } = iso;
    const { back, front } = this.drumGeom(iso);
    const dx = front.x - back.x;
    const dy = front.y - back.y;
    let a0 = Math.atan2(-back.ry * dx, back.rx * dy);
    if (Math.cos(a0 + Math.PI / 2) > 0) a0 += Math.PI;
    for (let i = 0; i < 6; i++) {
      const phi = (((s.drum + (i * TAU) / 6) % TAU) + TAU) % TAU;
      if (phi >= Math.PI) continue;
      const a = a0 + phi;
      const vis = Math.sin(phi);
      const pb = [back.x + back.rx * Math.cos(a), back.y + back.ry * Math.sin(a)];
      const pf = [front.x + front.rx * Math.cos(a), front.y + front.ry * Math.sin(a)];
      iso.line([lerp(pb[0], pf[0], 0.06), lerp(pb[1], pf[1], 0.06)], [lerp(pb[0], pf[0], 0.94), lerp(pb[1], pf[1], 0.94)], `rgba(178, 150, 92, ${0.34 * vis})`, 0.75);
    }
    this.drumRim(iso, front);
    this.pillowBlocks(iso, false);
    if (s.bead >= 0) this.bead(iso, s.bead, s.beadGlow);
    ctx.globalAlpha = 1;
  }

  // The reference draws the drum rims as illustrator ellipses, so they are anchored to projected
  // world points but sized in view space.
  drumGeom(iso) {
    const { k } = iso;
    const [bx, by] = iso.p(76, 123, 36);
    const [fx, fy] = iso.p(170.6, 125, 38);
    return {
      back: { x: bx + 0.5 * k, y: by + 5 * k, rx: 20 * k, ry: 27.5 * k },
      front: { x: fx, y: fy + 0.8 * k, rx: 21.5 * k, ry: 26.3 * k },
      hoop: { x: bx - 2 * k, y: by + 1.5 * k, rx: 23.5 * k, ry: 32 * k },
    };
  }

  drumRim(iso, front) {
    const { ctx } = iso;
    ctx.beginPath();
    ctx.ellipse(front.x, front.y, front.rx, front.ry, 0, 0, TAU);
    iso.stroke('#bd9c5b', 3);
    ctx.beginPath();
    ctx.ellipse(front.x, front.y, front.rx, front.ry, 0, 0, TAU);
    iso.stroke('#f0e0b4', 1);
  }

  drawDrum(iso) {
    const { ctx } = iso;
    const { back, front, hoop } = this.drumGeom(iso);
    const ell = (e, n = 40) => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * TAU;
      return [e.x + e.rx * Math.cos(a), e.y + e.ry * Math.sin(a)];
    });
    if (iso.bounds) {
      iso.mark(hoop.x - hoop.rx, hoop.y - hoop.ry);
      iso.mark(front.x + front.rx, front.y + front.ry);
    }
    // Arched brass wire hoop behind the drum, tied back to the conduit post.
    ctx.beginPath();
    ctx.ellipse(hoop.x, hoop.y, hoop.rx, hoop.ry, 0, 0, TAU);
    iso.stroke('#c4a462', 2.6);
    ctx.beginPath();
    ctx.ellipse(hoop.x, hoop.y, hoop.rx, hoop.ry, 0, 0, TAU);
    iso.stroke('#efdeae', 0.9);
    iso.line([hoop.x - hoop.rx * 0.94, hoop.y - hoop.ry * 0.34], iso.p(12, 170, 12), '#b4b4b1', 0.8);
    // Translucent glass body with a settled gold band along the bottom.
    iso.path(hull([...ell(back), ...ell(front)]));
    const mx = (back.x + front.x) / 2;
    const my = (back.y + front.y) / 2;
    const glass = ctx.createLinearGradient(mx, my - back.ry, mx, my + back.ry);
    glass.addColorStop(0, '#f8f2df');
    glass.addColorStop(0.62, '#f9f1de');
    glass.addColorStop(0.74, '#efe2c0');
    glass.addColorStop(0.87, '#e5d3a8');
    glass.addColorStop(1, '#d4c08c');
    ctx.fillStyle = glass;
    ctx.fill();
    iso.stroke('#c3ab72', 0.9);
    // Front face glazing and thick brass rim.
    ctx.beginPath();
    ctx.ellipse(front.x, front.y, front.rx, front.ry, 0, 0, TAU);
    ctx.fillStyle = 'rgba(251, 245, 228, 0.5)';
    ctx.fill();
    this.drumRim(iso, front);
  }

  // Indicator panel with the three gate buttons: > 0.9 (round), 0.5–0.9 (square), < 0.5 (dial).
  drawPanel(iso) {
    iso.prism(913, 202, 1055, 300, 0, 6, {
      r: 8,
      pal: { top: '#fdfdfb', left: '#f1f1ee', right: '#e0e0dc', line: '#a5a5a2' },
      shadow: [10, 3, 0.12],
      inset: { d: 5, color: '#dfdfdc', w: 0.7 },
    });
    GATE_PADS.forEach(([u, v], i) => {
      iso.prism(u - 12, v - 12, u + 12, v + 12, 6, 9.5, { r: 2.5, seg: 3, pal: { top: '#fdfdfb', left: '#efefec', right: '#dededb', line: '#adadaa' }, lw: 0.8 });
      if (i === 1) {
        iso.prism(u - 8.5, v - 8.5, u + 8.5, v + 8.5, 9.5, 19, { r: 2, seg: 3, pal: GOLD });
      } else {
        this.gateButton(iso, u, v, 0);
        if (i === 2) {
          const [x, y] = iso.p(u, v, 19.5);
          iso.line([x, y], [x + 5 * iso.k, y - 3.5 * iso.k], '#a9884d', 0.9);
        }
      }
    });
  }

  gateButton(iso, u, v, lit) {
    const body = lit > 0.01 ? BODY_GOLD.map(([o, c], j) => [o, j < 3 ? '#f8dc9c' : c]) : BODY_GOLD;
    iso.cyl(u, v, 9.5, 19.5, 11, { body, topColor: lit > 0.01 ? '#fbe7b8' : '#f4e6c2', line: GOLD.line });
  }

  // The > 0.9 button lights once Jev's answer clears the gate.
  drawGate(iso, s) {
    if (s.gateA <= 0.01) return;
    const { ctx } = iso;
    const [u, v] = GATE_PADS[0];
    const [gx, gy] = iso.p(u, v, 16);
    const g = ctx.createRadialGradient(gx, gy, 1, gx, gy, 30 * iso.k);
    g.addColorStop(0, `rgba(${AMBER}, ${0.35 * s.gateA * (0.75 + 0.25 * s.pulse)})`);
    g.addColorStop(1, `rgba(${AMBER}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gx, gy, 30 * iso.k, 0, TAU);
    ctx.fill();
    this.gateButton(iso, u, v, s.gateA);
  }

  drawSwitches(iso) {
    const white = { top: '#fdfdfb', left: '#f3f3f0', right: '#dfdfdb', line: '#a2a29f' };
    // Main confidence-gate housing with three indicator studs.
    iso.prism(835, 49, 1026, 137.5, 0, 54, { r: 4, pal: { ...DUSK, right: '#cbcacd' }, shadow: [14, 4, 0.13, -2], inset: { d: 5, color: '#dededb', w: 0.75 } });
    for (const u of [873, 931, 991]) iso.cyl(u, 117.5, 54, 58, 6.6, { body: BODY_WHITE, topColor: '#fefefe', line: '#a7a7a4' });
    // Step block and three parallel gate arms protruding from the housing face (the 3-way gate).
    iso.prism(893, 28, 965, 49, 0, 24, { r: 2, seg: 3, pal: { ...white, right: '#d6d6d9' }, lw: 0.85 });
    for (const [u, v] of [[891, 10], [923, -3], [949, -9]]) {
      iso.prism(u, v, u + 11, 49, 38, 50, { r: 2.5, seg: 3, pal: { top: '#fdfdfd', left: '#f0f0f0', right: '#d3d2d6', line: '#a2a2a3' }, lw: 0.85 });
    }
    // Left plunger block.
    iso.prism(810, -3, 884, 48, 0, 10, { r: 4, pal: { ...white, right: '#dcdcdc' }, shadow: [8, 3, 0.12], inset: { d: 4, color: '#e2e2df', w: 0.7 } });
    this.lever(iso, 862, 28, 10, 0);
    // Front-right block with gold label plate (its routing lever is drawn live).
    iso.prism(973, 0, 1071, 55, 0, 43, { r: 5, pal: { ...white, left: '#e9e9e8', right: '#e2e2df' }, shadow: [12, 4, 0.13, -2], inset: { d: 4, color: '#e0e0dd', w: 0.7 } });
    iso.prism(986, 12, 1041, 36, 43, 45, { r: 2.5, seg: 3, pal: PALE, line: '#bda56d' });
    for (let i = 0; i < 2; i++) iso.line(iso.p(993, 21 + i * 6, 45), iso.p(1034, 21 + i * 6, 45), 'rgba(170, 140, 84, 0.55)', 0.7);
    // Canister on the front edge.
    iso.cyl(1018, -8, -6, 28, 19, { body: BODY_WHITE, topColor: '#fdfdfb', line: '#a2a29f', shadow: [10, 3, 0.12] });
    iso.disc(1018, -8, 28, 15.5);
    iso.stroke('#e1e1de', 0.7);
    // Cable from housing to the conduit post.
    iso.line(iso.p(1026, 112, 26), iso.p(1080.5, 102, 11), '#8f8f8c', 0.75);
  }

  lever(iso, u, v, z, press) {
    const top = z + 30 - press;
    iso.cyl(u, v, z, top, 4.1, { body: BODY_WHITE, topColor: null, line: '#a2a29f' });
    iso.cyl(u, v, top, top + 8, 11, { body: BODY_GOLD, topColor: '#f4e5bf', line: GOLD.line, shadow: [6, 2, 0.12] });
  }

  // ------------------------------------------------------------------ overlays
  drawHeader(ctx, s) {
    for (const { idx, a, dy } of s.text) {
      const st = STAGES[idx];
      ctx.save();
      ctx.globalAlpha = a;
      this.font(ctx, 15, 400, MONO);
      ctx.fillStyle = '#3f3f3d';
      this.spaced(ctx, st.fig, 36, 50 + dy, 0.6);
      this.font(ctx, 15, 400, SANS);
      ctx.fillStyle = '#9b9b98';
      this.spaced(ctx, st.label, WIDTH - 36, 50 + dy, 1.6, 'right');
      ctx.restore();
    }
    const legend = [
      ['#232322', 'the answer'],
      ['#d4a454', 'calibration'],
      ['#bdbdba', 'the old way'],
    ];
    legend.forEach(([col, label], i) => {
      const y = 86 + i * 26;
      ctx.fillStyle = col;
      for (let j = 0; j < 3; j++) ctx.fillRect(36, y - 9.5 + j * 3, 18, 1.6);
      this.text(ctx, label, 62, y, '#5a5a57', 15, 400, 'left', SANS);
    });
  }

  drawHud(ctx, s) {
    for (const { idx, a, dy } of s.text) {
      const hud = STAGES[idx].hud;
      if (!hud || a <= 0.002) continue;
      const x = 32;
      const y = 166 + dy;
      const w = 204;
      const rowH = 23;
      const h = 102 + hud.rows.length * rowH;
      const dpr = this.dprOf(ctx);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(120, 96, 50, 0.16)';
      ctx.shadowBlur = 18 * dpr;
      ctx.shadowOffsetY = 6 * dpr;
      this.roundRect(ctx, x, y, w, h, 5);
      ctx.fillStyle = 'rgba(253, 253, 251, 0.96)';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(224, 178, 104, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.save();
      this.roundRect(ctx, x, y, w, h, 5);
      ctx.clip();
      ctx.fillStyle = '#e2a94e';
      ctx.fillRect(x, y, 3.2, h);
      ctx.restore();
      this.font(ctx, 12, 400, SANS);
      ctx.fillStyle = '#9d9d99';
      this.spaced(ctx, hud.title, x + 18, y + 24, 0.8);
      this.text(ctx, hud.value, x + 17, y + 62, '#121211', 28, 700, 'left', MONO);
      ctx.fillStyle = '#ebebe8';
      ctx.fillRect(x + 17, y + 80, w - 34, 1.6);
      hud.rows.forEach(([k, v], i) => {
        const ry = y + 104 + i * rowH;
        const hot = idx === 2 || (idx === 1 && i === 0);
        this.text(ctx, k, x + 17, ry, '#7c7c78', 13, 400, 'left', /[\u4e00-\u9fff]/.test(k) ? SANS : MONO);
        this.text(ctx, v, x + w - 17, ry, hot ? '#1b1b1a' : '#4c4c49', 13, hot ? 700 : 400, 'right', /[\u4e00-\u9fff]/.test(v) ? SANS : MONO);
      });
      ctx.restore();
    }
  }

  // Pre-rendered UI chrome: soft shadows are too costly to rasterise every frame.
  sprite(ctx, name, x, y, w, h, pad, draw) {
    const dpr = this.dprOf(ctx);
    const key = `${name}|${dpr}`;
    if (!this.sprites.has(key)) {
      const canvas = makeCanvas(Math.ceil((w + pad * 2) * dpr), Math.ceil((h + pad * 2) * dpr));
      const c = canvas && canvas.getContext('2d');
      if (c) {
        c.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);
        draw(c, dpr);
      }
      this.sprites.set(key, c ? { canvas, w: canvas.width / dpr, h: canvas.height / dpr } : null);
    }
    const S = this.sprites.get(key);
    if (S) {
      ctx.drawImage(S.canvas, x - pad, y - pad, S.w, S.h);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    draw(ctx, dpr);
    ctx.restore();
  }

  // Canvas shadow blur/offset ignore the current transform, so scale them by the device ratio.
  dprOf(ctx) {
    const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
    return m && Number.isFinite(m.a) && m.a > 0 ? Math.hypot(m.a, m.b || 0) : 1;
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  wrap(ctx, str, maxW) {
    const tokens = String(str).match(/[A-Za-z0-9.–\-%·]+|\s+|[^\sA-Za-z0-9]/g) || [];
    const lines = [];
    let line = '';
    for (const tok of tokens) {
      const next = line + tok;
      if (line && ctx.measureText(next.trimEnd()).width > maxW && !/^[。，、？！：；）」』]/.test(tok)) {
        lines.push(line.trimEnd());
        line = tok.trimStart();
      } else {
        line = next;
      }
    }
    if (line.trim()) lines.push(line.trimEnd());
    return lines;
  }

  drawCaption(ctx, s) {
    const x = 40;
    const y = 792;
    const w = WIDTH - 80;
    const h = 122;
    this.sprite(ctx, 'caption', x, y, w, h, 40, (c, dpr) => {
      c.shadowColor = 'rgba(60, 56, 46, 0.07)';
      c.shadowBlur = 22 * dpr;
      c.shadowOffsetY = 6 * dpr;
      this.roundRect(c, 0, 0, w, h, 10);
      c.fillStyle = 'rgba(251, 251, 249, 0.92)';
      c.fill();
      c.shadowColor = 'transparent';
      c.strokeStyle = '#e3e3df';
      c.lineWidth = 1.2;
      c.stroke();
    });
    for (const { idx, a, dy } of s.text) {
      if (a <= 0.002) continue;
      ctx.save();
      ctx.globalAlpha = a;
      this.font(ctx, 26, 400, SANS);
      const lines = this.wrap(ctx, STAGES[idx].caption, w - 90);
      const lh = 40;
      const y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + 9 + dy;
      ctx.fillStyle = '#1f1f1e';
      ctx.textAlign = 'center';
      lines.forEach((ln, i) => ctx.fillText(ln, WIDTH / 2, y0 + i * lh));
      ctx.restore();
    }
  }

  drawTelemetry(ctx, s) {
    const x = 40;
    const y = 944;
    const w = WIDTH - 80;
    const h = 318;
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 12);
    ctx.fillStyle = 'rgba(252, 252, 250, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#e6e6e2';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    this.font(ctx, 11, 500, MONO);
    ctx.fillStyle = '#8f8f8b';
    this.spaced(ctx, 'DECISION TRACE · ONE TICKET', x + 24, y + 31, 1.8);
    for (const { idx, a } of s.text) {
      ctx.save();
      ctx.globalAlpha = a;
      this.font(ctx, 12, 400, MONO);
      ctx.fillStyle = '#5f5f5c';
      this.spaced(ctx, STAGES[idx].trace, x + w - 24, y + 31, 0.4, 'right');
      ctx.restore();
    }
    ctx.fillStyle = '#ececE9';
    ctx.fillRect(x + 24, y + 46, w - 48, 1);

    const tx0 = x + 262;
    const tx1 = x + w - 120;
    const msX = ms => tx0 + ((tx1 - tx0) * ms) / 500;
    const laneLabel = (ly, col, title, sub) => {
      for (let j = 0; j < 3; j++) {
        ctx.fillStyle = col;
        ctx.fillRect(x + 24, ly - 13 + j * 3, 18, 1.6);
      }
      this.text(ctx, title, x + 52, ly - 4, '#3d3d3b', 14, 400, 'left', SANS);
      this.text(ctx, sub, x + 52, ly + 14, '#9a9a96', 11, 400, 'left', MONO);
    };

    // Lane A — the old way: prose tokens streamed one at a time.
    const la = y + 88;
    laneLabel(la, '#bdbdba', 'the old way', 'LLM writes tokens');
    ctx.fillStyle = '#e7e7e3';
    ctx.fillRect(tx0, la + 2, tx1 - tx0, 1);
    const band0 = msX(70);
    const band1 = msX(500);
    ctx.fillStyle = 'rgba(189, 189, 186, 0.16)';
    ctx.fillRect(band0, la - 20, band1 - band0, 30);
    ctx.strokeStyle = '#cfcfcb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(band0 + 0.5, la - 24);
    ctx.lineTo(band0 + 0.5, la + 12);
    ctx.moveTo(band1 - 0.5, la - 24);
    ctx.lineTo(band1 - 0.5, la + 12);
    ctx.stroke();
    const nTok = 46;
    const shown = Math.floor(s.tokens * nTok);
    const pitch = (tx1 - tx0) / nTok;
    ctx.save();
    ctx.globalAlpha = s.tokensA;
    for (let i = 0; i < shown; i++) {
      const tx = tx0 + i * pitch + 1.5;
      const age = s.tokens * nTok - i;
      const hgt = 14 + ((i * 7) % 5) * 1.4;
      ctx.fillStyle = age < 1.5 ? '#9c9c98' : '#cdcdc9';
      this.roundRect(ctx, tx, la - hgt + 1, pitch - 3, hgt, 2);
      ctx.fill();
    }
    if (shown > 0 && shown < nTok) {
      const hx = tx0 + shown * pitch;
      ctx.fillStyle = '#6f6f6b';
      ctx.fillRect(hx, la - 22, 1.2, 30);
    }
    ctx.restore();
    this.text(ctx, '70–500 ms', x + w - 24, la - 2, '#7e7e7a', 12, 400, 'right', MONO);

    // Lane B — the answer: Jev reads the whole state once.
    const lb = y + 146;
    laneLabel(lb, '#232322', 'the answer', 'Jev reads once');
    ctx.fillStyle = '#e7e7e3';
    ctx.fillRect(tx0, lb + 2, tx1 - tx0, 1);
    const readA = Math.max(s.readA, 0.22);
    ctx.save();
    ctx.globalAlpha = readA;
    ctx.fillStyle = '#1f1f1e';
    this.roundRect(ctx, tx0, lb - 15, 9, 16, 2);
    ctx.fill();
    ctx.restore();
    if (s.scanA > 0.01) {
      ctx.save();
      ctx.globalAlpha = s.scanA;
      ctx.strokeStyle = `rgba(${AMBER}, 0.9)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(tx0 + 4.5, lb - 7, 9 + s.scan * 16, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    this.text(ctx, '1 pass', x + w - 24, lb - 2, '#3d3d3b', 12, 700, 'right', MONO);

    // Shared millisecond axis.
    const ax = y + 178;
    this.font(ctx, 10, 400, MONO);
    for (let ms = 0; ms <= 500; ms += 100) {
      const px = msX(ms);
      ctx.fillStyle = '#d3d3cf';
      ctx.fillRect(px, ax - 10, 1, 5);
      ctx.fillStyle = '#a5a5a1';
      ctx.textAlign = 'center';
      ctx.fillText(`${ms}`, px, ax + 6);
    }
    ctx.textAlign = 'left';
    this.text(ctx, 'ms', tx1 + 18, ax + 6, '#a5a5a1', 10, 400, 'left', MONO);
    ctx.fillStyle = '#ececE9';
    ctx.fillRect(x + 24, y + 198, w - 48, 1);

    // Calibration gate — 0..1 probability scale with the three routes.
    const lc = y + 246;
    laneLabel(lc, '#d4a454', 'calibration', 'confidence gate');
    const px0 = tx0;
    const px1 = tx1;
    const pX = p => px0 + (px1 - px0) * p;
    const barY = lc - 13;
    const zones = [
      [0, 0.5, '#efefec', '< 0.5 上人工桌'],
      [0.5, 0.9, '#efe9db', '0.5–0.9 大模型复核'],
      [0.9, 1, '#f1e2bb', '> 0.9 直接执行'],
    ];
    const hotZone = s.p >= 0.9 ? 2 : -1;
    zones.forEach(([a, b, col, label], i) => {
      ctx.fillStyle = col;
      ctx.fillRect(pX(a), barY, pX(b) - pX(a) - (i < 2 ? 2 : 0), 12);
      if (i === hotZone) {
        ctx.fillStyle = `rgba(${AMBER}, ${0.55 * clamp((s.p - 0.88) / 0.05, 0, 1)})`;
        ctx.fillRect(pX(a), barY, pX(b) - pX(a), 12);
      }
      this.text(ctx, label, i === 2 ? pX(b) : (pX(a) + pX(b)) / 2, barY + 34, i === hotZone ? '#8a6420' : '#8c8c88', 11.5, i === hotZone ? 600 : 400, i === 2 ? 'right' : 'center', SANS);
    });
    for (const g of [0.5, 0.9]) {
      const gx = pX(g);
      const emph = g === 0.9 ? 0.6 + 0.4 * s.gatePulse : 0.6;
      ctx.fillStyle = `rgba(40, 40, 38, ${emph})`;
      ctx.fillRect(gx - 0.6, barY - 7, 1.2, 26);
      this.text(ctx, g.toFixed(1), gx, barY - 11, '#6b6b67', 10.5, 600, 'center', MONO);
    }
    if (s.p > 0.002) {
      const mx = pX(s.p);
      ctx.fillStyle = '#1f1f1e';
      ctx.beginPath();
      ctx.moveTo(mx, barY - 2);
      ctx.lineTo(mx - 5, barY - 10);
      ctx.lineTo(mx + 5, barY - 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(mx - 0.75, barY - 2, 1.5, 16);
    }
    this.text(ctx, s.p > 0.002 ? `p ${s.p.toFixed(2)}` : 'p —', x + w - 24, lc - 2, s.p >= 0.9 ? '#8a6420' : '#7e7e7a', 12, 700, 'right', MONO);
    ctx.restore();
  }

  drawFooter(ctx, s) {
    for (const { idx, a } of s.text) {
      const st = STAGES[idx];
      ctx.save();
      ctx.globalAlpha = a;
      this.font(ctx, 14, 400, MONO);
      ctx.fillStyle = '#8d8d89';
      this.spaced(ctx, st.footL, 36, 1312, 2);
      ctx.fillStyle = '#4f4f4c';
      this.spaced(ctx, st.footR, WIDTH - 36, 1312, 0.6, 'right');
      ctx.restore();
    }
  }
}
