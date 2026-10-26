// EWM Challenge (adamleopold.github.io/ewm-challenge) — Canvas 2D ports of the
// site's four data backgrounds in assets/js/fx.js: the world-model globe, the
// HoloBit candles + liquidity surface (and its Track 2 health-factor variant),
// the HoloBit trading terminal and the Agentic City district.
//
// Geometry, palettes and motion constants are copied from the REA-captured
// source. The originals keep per-frame mutable state seeded by Math.random;
// here every random choice comes from a seeded PRNG or a hash of (item, cycle),
// and stateful integrators either have closed forms or are re-stepped from t=0
// with a fixed step, so any timestamp redraws identically after a reverse seek.

const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const fract = x => x - Math.floor(x);
export const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
export function rng(seed) {   // mulberry32
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r, a, b) => a + r() * (b - a);

export const FONT = {
  display: "'Space Grotesk', 'Inter', 'Helvetica Neue', system-ui, sans-serif",
  body: "Inter, 'Helvetica Neue', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
};
export function spacing(c, px) { if ('letterSpacing' in c) c.letterSpacing = `${px}px`; }

// The site smooths the pointer to [-1, 1]; the gallery passes it unsmoothed so a
// paused frame still answers the cursor. `act` is 1 while the pointer is over the canvas.
export function pointerOf(state) {
  const p = state.pointer;
  return p ? { x: p.nx * 2 - 1, y: p.ny * 2 - 1, cx: p.x, cy: p.y, act: 1 } : { x: 0, y: 0, cx: -9999, cy: -9999, act: 0 };
}

/* ---------- agent glyphs (drawIcon), drawn straight into the scene ---------- */
// The site renders these into cached 64px sprites with destination-out cut-outs.
// Cut-outs here use even-odd fills, so the scene never needs an offscreen canvas.
export function drawIcon(c, kind) {
  c.lineCap = c.lineJoin = 'round';
  const person = (x, y, k) => {
    c.beginPath(); c.arc(x, y - 30 * k, 14 * k, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x - 24 * k, y + 34 * k); c.quadraticCurveTo(x - 24 * k, y - 10 * k, x, y - 10 * k);
    c.quadraticCurveTo(x + 24 * k, y - 10 * k, x + 24 * k, y + 34 * k); c.closePath(); c.fill();
  };
  const poly = pts => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  if (kind === 0) person(64, 66, 1.25);
  else if (kind === 1) { person(44, 70, 1); person(86, 74, 0.82); person(66, 90, 0.55); }
  else if (kind === 2) {
    c.lineWidth = 5;
    for (const b of [[30, 40, 84, 52, 72], [56, 30, 70, 38, 62], [82, 48, 96, 56, 88], [104, 20, 60, 28, 50]]) {
      c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0], b[2] + 14); c.stroke();
      c.fillRect(b[0] - 9, Math.min(b[3], b[4]), 18, Math.abs(b[4] - b[3]) + 10);
    }
  } else if (kind === 3) {
    c.lineWidth = 9; c.beginPath(); c.moveTo(18, 100); c.lineTo(46, 70); c.lineTo(68, 84); c.lineTo(108, 34); c.stroke();
    c.beginPath(); c.moveTo(84, 30); c.lineTo(112, 28); c.lineTo(110, 56); c.stroke();
    c.lineWidth = 5; c.beginPath(); c.moveTo(14, 112); c.lineTo(116, 112); c.stroke();
  } else if (kind === 4) {
    poly([[14, 112], [14, 60], [44, 78], [44, 60], [74, 78], [74, 30], [94, 30], [94, 18], [108, 18], [108, 112]]); c.fill();
  } else if (kind === 5) {
    poly([[64, 14], [116, 44], [12, 44]]); c.fill(); c.fillRect(14, 104, 100, 10);
    for (const x of [24, 48, 72, 96]) c.fillRect(x, 52, 10, 46);
  } else if (kind === 6) {
    poly([[64, 16], [114, 60], [100, 60], [100, 112], [28, 112], [28, 60], [14, 60]]);
    c.moveTo(54, 80); c.lineTo(54, 112); c.lineTo(74, 112); c.lineTo(74, 80); c.closePath(); c.fill('evenodd');
  } else {
    c.beginPath(); c.arc(64, 64, 44, 0, TAU); c.moveTo(98, 64); c.arc(64, 64, 34, 0, TAU, true); c.fill('evenodd');
    c.font = `700 52px ${FONT.body}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 64, 67);
  }
}

/* ---------- worldFX: a dotted globe with agents arcing between places ---------- */
const ICE = '143,214,255', WHITE = '228,243,255', GREEN = '0,255,136', VIOLET = '176,107,255';
const ICON_KINDS = [[0, WHITE], [0, WHITE], [1, ICE], [2, GREEN], [3, GREEN], [4, '63,242,200'], [5, VIOLET], [6, ICE], [7, '255,200,87']];

export function makeWorld(seed = 11) {
  const r = rng(seed), n = 1100, golden = Math.PI * (3 - Math.sqrt(5)), dots = [];
  for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i; dots.push([Math.cos(th) * rad, y, Math.sin(th) * rad]); }
  const arcs = Array.from({ length: 30 }, (_, j) => {
    const roll = r();
    return { j, col: roll < 0.15 ? GREEN : roll < 0.3 ? VIOLET : roll < 0.6 ? WHITE : ICE, k0: r(), v: between(r, 0.12, 0.3) };
  });
  const icons = Array.from({ length: 12 }, (_, m) => ({ m, k0: r(), dur: between(r, 7, 11) }));
  return { dots, arcs, icons };
}

// w × h is the site's canvas box (the hero canvas is taller than the viewport).
export function drawWorld(c, world, w, h, t, P, { cxr = 0.68, cyr = 0.52 } = {}) {
  const { dots } = world, n = dots.length;
  const R = Math.min(w, h) * 0.36, cx = w * cxr, cy = h * cyr;
  const ry = t * 0.08 + P.x * 0.35, rx = -0.32 + P.y * 0.12;
  const cy1 = Math.cos(ry), sy1 = Math.sin(ry), cx1 = Math.cos(rx), sx1 = Math.sin(rx);
  const pr = v => {   // rotate (y then x), orthographic projection; z > 0 faces the viewer
    const x = v[0] * cy1 + v[2] * sy1, z = -v[0] * sy1 + v[2] * cy1, y = v[1];
    return [cx + x * R, cy - (y * cx1 - z * sx1) * R, y * sx1 + z * cx1];
  };
  const g = c.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5);
  g.addColorStop(0, `rgba(${ICE},.16)`); g.addColorStop(1, `rgba(${ICE},0)`);
  const core = c.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  core.addColorStop(0, `rgba(${ICE},.10)`); core.addColorStop(1, `rgba(${ICE},.015)`);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = core; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
  c.strokeStyle = `rgba(${ICE},.22)`; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
  [1.18, 1.32].forEach((k, i) => {
    c.strokeStyle = `rgba(${ICE},${0.16 - i * 0.06})`;
    c.beginPath(); c.ellipse(cx, cy, R * k, R * k * 0.28, -0.25 + i * 0.12, 0, TAU); c.stroke();
  });
  for (const d of dots) {
    const q = pr(d), a = q[2] > 0 ? 0.35 + 0.65 * q[2] : 0.08 + 0.08 * (1 + q[2]), sz = q[2] > 0 ? 1.4 + q[2] * 1.4 : 1.1;
    c.fillStyle = `rgba(${ICE},${a.toFixed(3)})`; c.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz);
  }
  // each arc retargets every 1.35 units of progress; endpoints come from hash(arc, leg)
  const at = (j, leg) => dots[Math.floor(hash(j * 977.13 + leg * 31.71) * n)];
  c.globalCompositeOperation = 'lighter';
  for (const a of world.arcs) {
    const pos = a.k0 + t * a.v, leg = Math.floor(pos / 1.35), k = pos - leg * 1.35;
    const A = at(a.j, leg - 1), B = at(a.j, leg);
    for (let i = 0; i < 14; i++) {
      const u = Math.min(1, Math.max(0, k - i * 0.018));
      if (u <= 0) break;
      const m = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u];
      const len = Math.hypot(m[0], m[1], m[2]) || 1, lift = 1 + Math.sin(Math.PI * u) * 0.22;
      const q = pr([m[0] / len * lift, m[1] / len * lift, m[2] / len * lift]);
      if (q[2] < -0.15) continue;
      c.fillStyle = `rgba(${a.col},${((1 - i / 14) * (q[2] > 0 ? 0.9 : 0.35)).toFixed(3)})`;
      c.beginPath(); c.arc(q[0], q[1], i === 0 ? 2.4 : 1.4, 0, TAU); c.fill();
    }
    if (k >= 1 && k < 1.06) {   // arrival: a small ring where two agents interact
      const e = pr(B);
      if (e[2] > 0) { c.strokeStyle = `rgba(${a.col},.7)`; c.beginPath(); c.arc(e[0], e[1], 4 + (k - 1) * 120, 0, TAU); c.stroke(); }
    }
  }
  c.globalCompositeOperation = 'source-over';
  // agents on the surface (people, markets, firms, banks…) breathing in and out
  for (const ic of world.icons) {
    const pos = ic.k0 + t / ic.dur, cyc = Math.floor(pos), k = pos - cyc;
    const q = pr(dots[Math.floor(hash(ic.m * 53.7 + cyc * 7.31) * n)]);
    if (q[2] < 0.15) continue;
    const br = Math.sin(Math.PI * k), a = Math.pow(br, 1.6) * Math.min(1, (q[2] - 0.15) * 3);
    if (a < 0.01) continue;
    const [kind, rgb] = ICON_KINDS[Math.floor(hash(ic.m * 11.9 + cyc * 3.77) * ICON_KINDS.length)];
    const sz = 30 * (0.85 + 0.15 * br) * (0.8 + 0.2 * q[2]);
    c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
    c.translate(q[0] - sz / 2, q[1] - sz); c.scale(sz / 128, sz / 128);
    c.fillStyle = c.strokeStyle = `rgb(${rgb})`; c.shadowColor = `rgba(${rgb},.9)`; c.shadowBlur = 14;
    drawIcon(c, kind);
    c.restore();
  }
}

/* ---------- holoFX: candles + a liquidity surface; Track 2 draws health factors instead ---------- */
const holoPrice = k => Math.sin(k * 0.11) * 0.55 + Math.sin(k * 0.037 + 1.3) * 0.9 + Math.sin(k * 0.29) * 0.18 + Math.sin(k * 0.71) * 0.07;
const holoCurve = (x, t, i) => Math.sin(x * 0.0042 + t * 0.32 + i * 0.32) * 0.62 + Math.sin(x * 0.011 - t * 0.21 + i * 0.17) * 0.3 + Math.sin(x * 0.023 + t * 0.6 + i) * 0.08;

export function makeHolo(w, h, { quiet = false, risk = false, lite = false, seed = 7 } = {}) {
  const r = rng(seed), TOP = quiet ? 0.24 : 0.54;
  const bokeh = Array.from({ length: 22 }, () => ({ x: between(r, 0, w), y: between(r, h * TOP, h), r: between(r, 2, 9), v: between(r, 0.05, 0.25), a: between(r, 0.04, 0.16), ph: between(r, 0, 6) }));
  const pos = risk ? Array.from({ length: 90 }, () => ({ x: between(r, 0, w), hf: between(r, 1.1, 2.4), vx: between(r, 0.05, 0.3), f: between(r, 0.4, 1.4), ph: between(r, 0, 6), beta: between(r, 0.6, 1.6), r: between(r, 1.4, 2.8) })) : [];
  return { w, h, quiet, risk, lite, TOP, SPAN: quiet ? 0.7 : 0.46, L: quiet ? 26 : lite ? 22 : 36, bokeh, pos, seed };
}

// Track 2's positions integrate a slow market-stress wave; the site steps them per
// frame. They are re-stepped here at 30 Hz from t = 0, which keeps liquidations
// (and their flash rings) identical for a given timestamp.
function riskState(H, t) {
  const { w } = H, dt = 1 / 30, steps = Math.floor(t / dt);
  const ps = H.pos.map(p => ({ ...p })), flashes = [];
  let respawn = 0;
  for (let s = 0; s < steps; s++) {
    const tt = (s + 1) * dt, shock = Math.max(0, Math.sin(tt * 0.35)) * 0.06;
    for (const p of ps) {
      p.hf += (Math.sin(tt * p.f + p.ph) * 0.004 - shock * p.beta) * dt * 60;
      p.x += p.vx * dt * 60; if (p.x > w + 10) p.x = -10;
      if (p.hf < 1) {
        flashes.push({ x: p.x, at: tt });
        respawn++; p.hf = 1.6 + 0.8 * hash(H.seed * 13 + respawn * 1.37); p.x = w * hash(H.seed * 29 + respawn * 2.11);
      }
    }
  }
  return { ps, flashes: flashes.filter(f => t - f.at < 1 / 1.2) };
}

function drawRisk(c, H, t) {
  const { w, h } = H, thr = h * 0.47, topY = h * 0.33;
  const hfY = hf => thr - (hf - 1) / 1.4 * (thr - topY);
  c.strokeStyle = 'rgba(255,92,120,.55)'; c.setLineDash([6, 6]); c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, thr); c.lineTo(w, thr); c.stroke(); c.setLineDash([]);
  c.font = `11px ${FONT.mono}`; c.fillStyle = 'rgba(255,140,160,.8)';
  c.fillText('LIQUIDATION · HEALTH FACTOR 1.00', w * 0.36, thr + 18);
  c.fillStyle = 'rgba(160,255,230,.55)'; c.fillText('HF 2.40', w * 0.36, topY - 8);
  c.globalCompositeOperation = 'lighter';
  const { ps, flashes } = riskState(H, t);
  for (const p of ps) {
    const k = Math.min(1, (p.hf - 1) / 0.8), col = k > 0.5 ? '63,242,200' : k > 0.22 ? '255,200,90' : '255,92,120';
    c.fillStyle = `rgba(${col},.9)`; c.beginPath(); c.arc(p.x, hfY(p.hf), p.r, 0, TAU); c.fill();
  }
  for (const f of flashes) {
    const a = 1 - (t - f.at) * 1.2;
    c.strokeStyle = `rgba(255,92,120,${a})`; c.lineWidth = 1.5;
    c.beginPath(); c.arc(f.x, thr, (1 - a) * 26 + 3, 0, TAU); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
}

export function drawHolo(c, H, t, P) {
  const { w, h, quiet, TOP, SPAN, L } = H;
  c.fillStyle = 'rgba(120,255,200,.06)';
  for (let gx = 24; gx < w; gx += 36) for (let gy = Math.round(h * TOP / 36) * 36 + 24; gy < h; gy += 36) c.fillRect(gx, gy, 1, 1);
  if (H.risk) drawRisk(c, H, t);
  else {
    // candles: thin, slow, fading at both ends, with a moving average drawn through them
    const cw = 7, step = cw + 6, speed = 16, mid = h * (TOP + SPAN * 0.3), amp = h * SPAN * 0.22;
    const shift = (t * speed) % step, k0 = Math.floor(t * speed / step), n = Math.ceil(w / step) + 3, ma = [];
    for (let q = 0; q < n; q++) {
      const k = k0 + q, cx = q * step - shift, o = mid - amp * holoPrice(k), cl = mid - amp * holoPrice(k + 1);
      const wick = amp * (0.08 + 0.1 * Math.abs(Math.sin(k * 2.7))), up = cl < o;
      const edge = Math.min(1, cx / (w * 0.18), (w - cx) / (w * 0.12));
      if (edge <= 0) continue;
      const al = (quiet ? 0.28 : 0.55) * edge;
      c.strokeStyle = up ? `rgba(0,255,150,${al})` : `rgba(255,92,120,${al * 0.85})`; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx + cw / 2 + 0.5, Math.min(o, cl) - wick); c.lineTo(cx + cw / 2 + 0.5, Math.max(o, cl) + wick * 0.8); c.stroke();
      c.fillStyle = up ? `rgba(0,255,150,${al * 0.5})` : `rgba(255,92,120,${al * 0.35})`;
      c.fillRect(cx, Math.min(o, cl), cw, Math.max(1.5, Math.abs(cl - o)));
      c.strokeRect(cx + 0.5, Math.min(o, cl) + 0.5, cw - 1, Math.max(1, Math.abs(cl - o)));
      ma.push([cx + cw / 2, mid - amp * (holoPrice(k - 2) + holoPrice(k - 1) + holoPrice(k) + holoPrice(k + 1) + holoPrice(k + 2)) / 5]);
    }
    c.globalCompositeOperation = 'lighter';
    c.beginPath(); ma.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
    c.strokeStyle = `rgba(120,255,200,${quiet ? 0.25 : 0.55})`; c.lineWidth = 1.4;
    c.shadowColor = 'rgba(0,255,150,.9)'; c.shadowBlur = quiet || H.lite ? 0 : 10; c.stroke(); c.shadowBlur = 0;
    if (!quiet && ma.length) {
      const last = ma[ma.length - 4] || ma[ma.length - 1];
      c.fillStyle = '#eafff4'; c.beginPath(); c.arc(last[0], last[1], 3, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(120,255,200,.25)'; c.setLineDash([3, 5]);
      c.beginPath(); c.moveTo(0, last[1]); c.lineTo(w, last[1]); c.stroke(); c.setLineDash([]);
      c.font = `11px ${FONT.mono}`; c.fillStyle = 'rgba(160,255,215,.85)';
      c.fillText(`ETH/USDC  ${(2400 + 60 * holoPrice(k0 + n - 4)).toFixed(2)}`, Math.min(last[0] + 10, w - 140), last[1] - 9);
    }
  }
  c.globalCompositeOperation = 'lighter';
  // the liquidity surface underneath; the pointer raises a soft bump in it
  const sig = Math.max(140, w * 0.12);
  const yAt = (x, i) => {
    const z = i / (L - 1), base = h * (TOP + SPAN * 0.42 + SPAN * 0.58 * Math.pow(z, 1.4)), am = h * SPAN * (0.06 + 0.1 * z);
    const d = x - P.cx, bump = P.act ? Math.exp(-(d * d) / (2 * sig * sig)) * Math.exp(-Math.pow((P.cy - base) / (h * 0.35), 2)) : 0;
    return base - am * holoCurve(x, t, i) - bump * h * 0.07 * (0.3 + z);
  };
  for (let i = 0; i < L; i++) {
    const z = i / (L - 1), a = (quiet ? 0.04 : 0.05) + (quiet ? 0.2 : 0.42) * Math.pow(z, 1.5), hi = i % 6 === 0;
    c.beginPath();
    for (let x = -10; x <= w + 10; x += 7) { const y = yAt(x, i); x === -10 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.strokeStyle = `rgba(${hi ? '120,255,190' : `0,${Math.round(170 + 85 * z)},${Math.round(150 - 30 * z)}`},${hi ? a * 1.4 : a})`;
    c.lineWidth = 0.5 + 1.1 * z; c.stroke();
  }
  if (!quiet) {   // a light pulse travelling along one curve
    const kk = Math.floor(L * 0.7), head = (t * 140) % (w + 400) - 200;
    for (let j = 0; j < 46; j++) {
      const x2 = head - j * 6, al2 = 1 - j / 46;
      c.fillStyle = `rgba(190,255,225,${al2 * al2 * 0.9})`;
      c.beginPath(); c.arc(x2, yAt(x2, kk), 2.2 * al2 + 0.4, 0, TAU); c.fill();
    }
  }
  // bokeh rise, wrap to the bottom with a new column, and drift sideways (integrated sway)
  const span = h + 20 - h * TOP;
  H.bokeh.forEach((b, i) => {
    const travel = (h + 20 - b.y) + b.v * 60 * t, lap = Math.floor(travel / span);
    const y = h + 20 - (travel - lap * span), x0 = lap === 0 ? b.x : w * hash(i * 17.3 + lap * 5.9);
    const x = x0 - 30 * Math.cos(t * 0.3 + b.ph) + 30 * Math.cos(b.ph);
    const g = c.createRadialGradient(x, y, 0, x, y, b.r);
    g.addColorStop(0, `rgba(0,255,150,${b.a})`); g.addColorStop(1, 'rgba(0,255,150,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, b.r, 0, TAU); c.fill();
  });
  c.globalCompositeOperation = 'source-over';
}

/* ---------- terminalFX: a code-drawn trading terminal (Track 1 panel, upper part) ---------- */
const termPx = k => 2400 + 42 * (Math.sin(k * 0.09) * 0.7 + Math.sin(k * 0.031 + 2) * 0.9 + Math.sin(k * 0.37) * 0.15);

export function drawTerminal(c, w, h, t, span = 1) {
  const G = '0,255,150', R = '255,92,120', W = w * span, H = h, pad = 18;
  c.font = `11px ${FONT.mono}`; c.lineWidth = 1;
  const box = (x, y, bw, bh, title) => {
    c.strokeStyle = `rgba(${G},.22)`; c.strokeRect(x + 0.5, y + 0.5, bw, bh);
    c.fillStyle = `rgba(${G},.55)`; c.fillText(title, x + 10, y + 16);
  };
  const narrow = W < 560;   // phones and the Track 1 panel: the price chart alone reads better than four cramped panels
  const top = H * 0.1, panelH = H * 0.78, colW = narrow ? (W - pad * 2) / 1.35 : (W - pad * 4) / 3, x0 = pad, y0 = top;
  // 1 · price chart with area
  box(x0, y0, colW * 1.35, panelH * 0.62, 'ETH/USDC · 1m · HoloBit sim');
  const cw2 = colW * 1.35 - 20, ch2 = panelH * 0.62 - 40, k0 = t * 1.6, pts = [];
  for (let i = 0; i <= 80; i++) pts.push([x0 + 10 + cw2 * i / 80, termPx(k0 + i)]);
  const ys = pts.map(p => p[1]), lo = Math.min(...ys), hi = Math.max(...ys);
  pts.forEach(p => { p[1] = y0 + 28 + ch2 * (1 - (p[1] - lo) / (hi - lo + 1e-6)); });
  const gr = c.createLinearGradient(0, y0 + 28, 0, y0 + 28 + ch2);
  gr.addColorStop(0, `rgba(${G},.28)`); gr.addColorStop(1, `rgba(${G},0)`);
  c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  c.lineTo(pts[80][0], y0 + 28 + ch2); c.lineTo(pts[0][0], y0 + 28 + ch2); c.closePath(); c.fillStyle = gr; c.fill();
  c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  c.strokeStyle = `rgba(${G},.9)`; c.lineWidth = 1.5; c.stroke(); c.lineWidth = 1;
  c.fillStyle = 'rgba(230,255,240,.9)'; c.fillText(termPx(k0 + 80).toFixed(2), x0 + colW * 1.35 - 70, y0 + 16);
  if (narrow) return;
  // 2 · depth chart
  const y1 = y0 + panelH * 0.62 + pad, dw = colW * 1.35, dh = panelH * 0.38 - pad;
  box(x0, y1, dw, dh, 'DEPTH · Uniswap V3 pool');
  const midX = x0 + dw / 2, baseY = y1 + dh - 8;
  for (const [dir, col] of [[-1, R], [1, G]]) {
    c.beginPath(); c.moveTo(midX, baseY);
    let acc = 0;
    for (let j = 0; j <= 30; j++) {
      acc += 0.6 + 0.5 * Math.abs(Math.sin(j * 1.7 + t * 0.8 * dir));
      c.lineTo(midX + dir * (dw / 2 - 10) * j / 30, baseY - Math.min(dh - 30, acc * (dh - 30) / 28));
    }
    c.lineTo(midX + dir * (dw / 2 - 10), baseY); c.closePath();
    c.fillStyle = `rgba(${col},.16)`; c.fill(); c.strokeStyle = `rgba(${col},.7)`; c.stroke();
  }
  // 3 · order book ladder
  const x2 = x0 + colW * 1.35 + pad, bw2 = colW * 0.95, bh2 = panelH;
  box(x2, y0, bw2, bh2, 'ORDER BOOK');
  const rows = Math.floor((bh2 - 40) / 17), midP = termPx(k0 + 80);
  for (let r2 = 0; r2 < rows; r2++) {
    const ask = r2 < rows / 2, off = ask ? rows / 2 - r2 : r2 - rows / 2 + 1;
    const p2 = midP + (ask ? 1 : -1) * off * 0.35, size = 0.3 + Math.abs(Math.sin(r2 * 3.1 + Math.floor(t * 3) * 0.7)) * 0.7;
    const yy2 = y0 + 34 + r2 * 17, col = ask ? R : G;
    c.fillStyle = `rgba(${col},.14)`; c.fillRect(x2 + bw2 - 10 - (bw2 - 20) * size, yy2 - 11, (bw2 - 20) * size, 14);
    c.fillStyle = `rgba(${col},.85)`; c.fillText(p2.toFixed(2), x2 + 10, yy2);
    c.fillStyle = 'rgba(220,255,235,.55)'; c.fillText((size * 12).toFixed(3), x2 + bw2 - 64, yy2);
  }
  // 4 · trade tape
  const x3 = x2 + bw2 + pad, bw3 = W - x3 - pad;
  if (bw3 > 120) {
    box(x3, y0, bw3, bh2, 'TRADES · agents');
    const n3 = Math.floor((bh2 - 40) / 17), scroll = (t * 9) % 17, base3 = Math.floor(t * 9 / 17);
    c.save(); c.beginPath(); c.rect(x3, y0 + 22, bw3, bh2 - 24); c.clip();
    for (let r3 = -1; r3 < n3 + 1; r3++) {
      const id = base3 - r3, buy = Math.sin(id * 12.9898) > 0, yy3 = y0 + 34 + r3 * 17 + scroll;
      c.fillStyle = `rgba(${buy ? G : R},.85)`; c.fillText((buy ? 'BUY  ' : 'SELL ') + termPx(id * 0.7).toFixed(2), x3 + 10, yy3);
      c.fillStyle = 'rgba(220,255,235,.5)'; c.fillText(`agent-${String(Math.abs(Math.floor(Math.sin(id) * 900))).padStart(3, '0')}`, x3 + bw3 - 82, yy3);
    }
    c.restore();
  }
}

/* ---------- cityFX: a slowly orbiting wireframe district; agents travel its streets ---------- */
export function makeCity({ quiet = false, seed = 5 } = {}) {
  const r = rng(seed), G = quiet ? 11 : 13, H = G / 2, blds = [];
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    if (r() < 0.2) continue;
    const x = i - H + 0.5, z = j - H + 0.5, dc = Math.sqrt(x * x + z * z) / H;
    const hgt = (0.4 + Math.pow(Math.max(0, 1 - dc), 1.6) * between(r, 2.2, 5)) * (r() < 0.08 ? 1.4 : 1);
    blds.push({ x, z, f: between(r, 0.5, 0.72), h: hgt, ph: between(r, 0, 6), lit: r() < 0.12 });
  }
  const agents = Array.from({ length: quiet ? 30 : 60 }, () => ({
    ax: r() < 0.5, line: Math.floor(between(r, 0, G + 1)) - H, p0: between(r, -H, H), v: between(r, 0.35, 0.9) * (r() < 0.5 ? -1 : 1),
  }));
  return { G, H, blds, agents, quiet, seed };
}

export function drawCity(c, city, w, h, t, P, { cxr = 0.5, cyr = 0.6, scale = 1 } = {}) {
  const { G, H, quiet } = city;
  const th = t * 0.045 + P.x * 0.22, ph = 0.52 + P.y * 0.05;
  const ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
  const D = G * 2.2, K = Math.min(w * 0.036, h * 0.064) * (13 / G) * scale, cx = w * cxr, cy = h * cyr;
  const pr = (x, y, z) => {
    const x1 = x * ct - z * st, z1 = x * st + z * ct, y2 = y * cp + z1 * sp, z2 = z1 * cp - y * sp, q = D / (D + z2);
    return [cx + x1 * K * q, cy - y2 * K * q, z2];
  };
  c.lineWidth = 1; c.strokeStyle = 'rgba(176,107,255,.13)';
  for (let i = 0; i <= G; i++) {
    const v = i - H, a1 = pr(v, 0, -H), a2 = pr(v, 0, H), b1 = pr(-H, 0, v), b2 = pr(H, 0, v);
    c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.moveTo(b1[0], b1[1]); c.lineTo(b2[0], b2[1]); c.stroke();
  }
  // pings: a scenario run radiates from a building every 1.6 s, each lives 3.2 s
  for (let n = Math.max(0, Math.floor(t / 1.6) - 2); n <= Math.floor(t / 1.6); n++) {
    const age = t - 1.6 * (n + 1);
    if (age < 0 || age >= 3.2) continue;
    const b = city.blds[Math.floor(hash(city.seed * 7 + n * 1.618) * city.blds.length)], rr = 0.3 + age * 1.1;
    c.strokeStyle = `rgba(255,95,210,${0.5 * (1 - age / 3.2)})`; c.lineWidth = 1.2; c.beginPath();
    for (let k = 0; k <= 36; k++) { const an = k / 36 * TAU, q = pr(b.x + Math.cos(an) * rr, 0, b.z + Math.sin(an) * rr); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }
    c.stroke();
  }
  // buildings, far to near
  const order = city.blds.map(b => ({ b, d: pr(b.x, b.h / 2, b.z)[2] })).sort((p, q) => q.d - p.d);
  for (const { b, d } of order) {
    const f = b.f / 2, hh = b.h * (0.97 + 0.03 * Math.sin(t * 0.7 + b.ph));
    const P0 = [pr(b.x - f, 0, b.z - f), pr(b.x + f, 0, b.z - f), pr(b.x + f, 0, b.z + f), pr(b.x - f, 0, b.z + f)];
    const P1 = [pr(b.x - f, hh, b.z - f), pr(b.x + f, hh, b.z - f), pr(b.x + f, hh, b.z + f), pr(b.x - f, hh, b.z + f)];
    const fog = Math.max(0.25, Math.min(1, 1 - d / (G * 0.9)));
    for (let k = 0; k < 4; k++) {
      const A = P0[k], B = P0[(k + 1) % 4], C = P1[(k + 1) % 4], Dd = P1[k];
      if ((B[0] - A[0]) * (Dd[1] - A[1]) - (B[1] - A[1]) * (Dd[0] - A[0]) > 0) continue;   // back face
      c.fillStyle = `rgba(16,6,32,${0.92 * fog})`;
      c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); c.lineTo(Dd[0], Dd[1]); c.closePath(); c.fill();
      c.strokeStyle = `rgba(176,107,255,${0.42 * fog})`; c.lineWidth = 0.8; c.stroke();
      if (!quiet) {   // floor lines
        c.strokeStyle = `rgba(176,107,255,${0.12 * fog})`; c.beginPath();
        for (let fl = 0.35; fl < hh; fl += 0.35) {
          const u = fl / hh;
          c.moveTo(A[0] + (Dd[0] - A[0]) * u, A[1] + (Dd[1] - A[1]) * u); c.lineTo(B[0] + (C[0] - B[0]) * u, B[1] + (C[1] - B[1]) * u);
        }
        c.stroke();
      }
    }
    c.fillStyle = `rgba(176,107,255,${0.16 * fog})`;
    c.beginPath(); P1.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill();
    c.strokeStyle = b.lit ? `rgba(255,140,230,${0.9 * fog})` : `rgba(200,150,255,${0.6 * fog})`; c.lineWidth = b.lit ? 1.3 : 0.9; c.stroke();
  }
  // agents on the streets; the site keeps the last 10 frame positions as a trail (60 fps)
  c.globalCompositeOperation = 'lighter';
  const wrap = p => ((p + H) % G + G) % G - H;
  for (const a of city.agents) {
    const at = s => { const p = wrap(a.p0 + a.v * s); return a.ax ? pr(p, 0.02, a.line) : pr(a.line, 0.02, p); };
    const trail = []; for (let k = 0; k < 10 && t - k / 60 >= 0; k++) trail.push(at(t - k / 60));
    for (let k = 1; k < trail.length; k++) {
      const A2 = trail[k - 1], B2 = trail[k];
      if (Math.abs(A2[0] - B2[0]) > 60) continue;   // wrapped
      c.strokeStyle = `rgba(255,95,210,${0.5 * (1 - k / trail.length)})`; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(A2[0], A2[1]); c.lineTo(B2[0], B2[1]); c.stroke();
    }
    const q = trail[0] || at(t), g = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 6);
    g.addColorStop(0, 'rgba(255,200,245,.95)'); g.addColorStop(1, 'rgba(255,95,210,0)');
    c.fillStyle = g; c.beginPath(); c.arc(q[0], q[1], 6, 0, TAU); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
}

/* ---------- shared page chrome (the HTML layered over each canvas) ---------- */
export function drawNav(c, w, links, { cta = 'Choose a track →', accent = '#8fd6ff' } = {}) {
  const lg = c.createLinearGradient(48, 24, 72, 48);
  lg.addColorStop(0, '#00ff88'); lg.addColorStop(1, '#b06bff');
  c.fillStyle = lg; roundRect(c, 48, 23, 26, 26, 7); c.fill();
  c.fillStyle = '#050608'; roundRect(c, 53, 28, 16, 16, 4); c.fill();
  c.textBaseline = 'middle'; c.textAlign = 'left';
  c.font = `700 18px ${FONT.display}`; c.fillStyle = '#eef2ee'; c.fillText('EWM', 84, 36);
  c.font = `500 18px ${FONT.display}`; c.fillStyle = 'rgba(238,242,238,.62)'; c.fillText('Challenge', 137, 36);
  c.font = `400 14px ${FONT.body}`;
  let x = cta ? 1004 : 1166;
  const widths = links.map(l => c.measureText(l).width + 22);
  x -= widths.reduce((s, v) => s + v, 0);
  c.strokeStyle = 'rgba(255,255,255,.10)'; c.beginPath(); c.moveTo(x + 4, 55.5); c.lineTo(cta ? 978 : 1140, 55.5); c.stroke();
  links.forEach((l, i) => { c.fillStyle = 'rgba(238,242,238,.62)'; c.fillText(l, x + 4, 36); x += widths[i]; });
  if (cta) {
    c.strokeStyle = 'rgba(255,255,255,.18)'; roundRect(c, 1004.5, 18.5, 145, 35, 17.5); c.stroke();
    c.font = `400 12px ${FONT.mono}`; c.fillStyle = 'rgba(238,242,238,.7)'; c.fillText(cta, 1019, 36);
  }
  c.strokeStyle = 'rgba(255,255,255,.18)'; roundRect(c, 1176.5, 19.5, 55, 32, 16); c.stroke();
  c.font = `500 13px ${FONT.body}`; c.fillStyle = '#eef2ee'; c.textAlign = 'center'; c.fillText('中文', 1204, 36);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
}

export function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

export function kicker(c, x, y, text, color) {
  c.strokeStyle = color; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 4.5); c.lineTo(x + 26, y - 4.5); c.stroke();
  c.font = `500 12px ${FONT.mono}`; spacing(c, 3.4); c.fillStyle = color; c.fillText(text, x + 36, y); spacing(c, 0);
}

export function pill(c, x, y, w, h, label, { fill = null, stroke = 'rgba(255,255,255,.2)', color = '#eef2ee', glow = null } = {}) {
  c.save();
  if (glow) { c.shadowColor = glow; c.shadowBlur = 28; }
  roundRect(c, x, y, w, h, h / 2);
  if (fill) { c.fillStyle = fill; c.fill(); } else { c.fillStyle = 'rgba(255,255,255,.03)'; c.fill(); c.strokeStyle = stroke; c.stroke(); }
  c.restore();
  c.font = `500 13px ${FONT.mono}`; spacing(c, 1.6); c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(label, x + w / 2, y + h / 2 + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; spacing(c, 0);
}

export function paragraph(c, lines, x, y, lh, color, font = `400 19px ${FONT.body}`) {
  c.font = font; c.fillStyle = color;
  lines.forEach((l, i) => c.fillText(l, x, y + i * lh));
}

function glowText(c, text, x, y, color, glow) {
  c.save(); c.shadowColor = glow; c.shadowBlur = 36; c.fillStyle = color; c.fillText(text, x, y); c.restore();
  c.fillStyle = color; c.fillText(text, x, y);
}

/* ---------- scenes ---------- */
const W = 1280, VIEW_H = 720;

function frameState(state, duration) {
  const elapsed = clamp(Number(state.elapsed) || 0, 0, duration);
  // Reduced motion: the site draws one still frame at t = 3 and stops its loop.
  return { t: state.reducedMotion ? 3 : elapsed, P: pointerOf(state) };
}

// Index hero: the globe canvas is 1280 × 989 behind a 720-tall viewport.
export class EwmWorldScene {
  constructor() { this.width = W; this.height = VIEW_H; this.duration = 12; this.world = makeWorld(); }
  render(ctx, state = {}) {
    const { t, P } = frameState(state, this.duration);
    ctx.save();
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, VIEW_H);
    const sky = ctx.createRadialGradient(980, 120, 40, 980, 160, 900);
    sky.addColorStop(0, 'rgba(18,34,44,.55)'); sky.addColorStop(1, 'rgba(5,6,8,0)');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VIEW_H);
    drawWorld(ctx, this.world, W, 989, t, P);
    // .hero::after darkens the canvas over the hero's full 989 px height
    const veil = ctx.createLinearGradient(0, 0, 0, 989);
    veil.addColorStop(0, 'rgba(5,6,8,.2)'); veil.addColorStop(0.6, 'rgba(5,6,8,.4)'); veil.addColorStop(1, '#050608');
    ctx.fillStyle = veil; ctx.fillRect(0, 0, W, VIEW_H);
    // the copy sits on a soft dark wash, as on the page
    const wash = ctx.createLinearGradient(0, 0, 760, 0);
    wash.addColorStop(0, 'rgba(5,6,8,.55)'); wash.addColorStop(1, 'rgba(5,6,8,0)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 760, VIEW_H);
    drawNav(ctx, W, ['Foundation', 'How it works', 'Tracks', 'Who we are']);
    kicker(ctx, 50, 139, 'ECONOMIC WORLD MODEL CHALLENGE 2026', '#8fd6ff');
    ctx.font = `700 82px ${FONT.display}`; spacing(ctx, -2.5);
    ctx.fillStyle = '#eef2ee'; ctx.fillText('Test your agent', 50, 238); ctx.fillText('in a world that', 50, 315);
    glowText(ctx, 'pushes back.', 50, 392, '#8fd6ff', 'rgba(143,214,255,.55)'); spacing(ctx, 0);
    paragraph(ctx, ['Economic World Model Challenge is an open competition built on an', 'economic world model. Multi-agent simulation brings households,',
      'firms, investors and protocols to life inside it — and your AI agent has to', 'act among them. Pick a world, enter a track, and see how your agent', 'holds up.'],
    50, 450, 31.7, 'rgba(238,242,238,.78)');
    ctx.font = `400 12px ${FONT.mono}`; spacing(ctx, 2.2); ctx.fillStyle = 'rgba(238,242,238,.5)';
    let hx = 50;
    for (const [text, col] of [['HOSTED BY ', 'rgba(238,242,238,.5)'], ['GIFTS', '#8fd6ff'], [' & NANYANG BUSINESS SCHOOL · NTU SINGAPORE', 'rgba(238,242,238,.5)']]) {
      ctx.fillStyle = col; ctx.fillText(text, hx, 621); hx += ctx.measureText(text).width;
    }
    spacing(ctx, 0);
    pill(ctx, 50, 664, 189, 49, 'CHOOSE A TRACK →', { fill: '#8fd6ff', color: '#04121c', glow: 'rgba(143,214,255,.6)' });
    pill(ctx, 251, 664, 171, 49, 'HOW IT WORKS ↓');
    ctx.strokeStyle = 'rgba(143,214,255,.5)'; ctx.beginPath(); ctx.arc(640, 676, 21.5, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(634, 673); ctx.lineTo(640, 679); ctx.lineTo(646, 673); ctx.stroke();
    ctx.restore();
  }
}

// HoloBit (Tracks 1–2) hero: a quiet holo surface under the headline, canvas 1280 × 890.
export class EwmHoloScene {
  constructor() { this.width = W; this.height = VIEW_H; this.duration = 12; this.holo = makeHolo(W, 890, { quiet: true }); }
  render(ctx, state = {}) {
    const { t, P } = frameState(state, this.duration);
    ctx.save();
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, VIEW_H);
    const deep = ctx.createRadialGradient(140, 40, 20, 140, 40, 760);
    deep.addColorStop(0, 'rgba(0,70,40,.35)'); deep.addColorStop(1, 'rgba(2,20,12,0)');
    ctx.fillStyle = deep; ctx.fillRect(0, 0, W, VIEW_H);
    drawHolo(ctx, this.holo, t, P);
    drawNav(ctx, W, ['Tracks', 'How it works', 'Scoring', 'Timeline', 'FAQ'], { cta: 'All tracks →' });
    kicker(ctx, 50, 139, 'ECONOMIC WORLD MODEL CHALLENGE · TRACKS 1 & 2 · WORLD BY HOLOBIT', '#00ff88');
    ctx.font = `700 100px ${FONT.display}`; spacing(ctx, -3);
    ctx.fillStyle = '#eef2ee'; ctx.fillText('Build agents for', 50, 258); ctx.fillText('markets that', 50, 358);
    glowText(ctx, 'move.', 50 + ctx.measureText('markets that ').width, 358, '#00ff88', 'rgba(0,255,136,.6)'); spacing(ctx, 0);
    paragraph(ctx, ['Write an AI agent, run it inside a full digital twin of Uniswap V3 and Aave v3, and', 'face market shocks you can\'t see in advance. No chain, no wallet, no real',
      'money — just your strategy against the rules.'], 50, 416, 32, 'rgba(238,242,238,.78)');
    pill(ctx, 50, 526, 258, 50, 'REGISTRATION OPENS 2 NOV', { fill: '#03c96c', color: '#02140c', glow: 'rgba(0,255,136,.45)' });
    pill(ctx, 320, 526, 171, 50, 'HOW IT WORKS ↓');
    ctx.font = `400 12px ${FONT.mono}`; spacing(ctx, 1.8); ctx.fillStyle = 'rgba(238,242,238,.55)';
    ctx.fillText('UNTIL ANNOUNCEMENT · REGISTRATION OPENS', 50, 653);
    const boxX = Math.max(394, 50 + ctx.measureText('UNTIL ANNOUNCEMENT · REGISTRATION OPENS').width + 16); spacing(ctx, 0);
    // the countdown keeps running with the timeline (the REA capture read 06 · 18 · 13 · 32)
    const left = 6 * 86400 + 18 * 3600 + 13 * 60 + 32 - Math.floor(clamp(Number(state.elapsed) || 0, 0, this.duration));
    const parts = [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60];
    ['DAYS', 'HRS', 'MIN', 'SEC'].forEach((lab, i) => {
      const x = boxX + i * 74;
      ctx.fillStyle = 'rgba(12,14,16,.78)'; roundRect(ctx, x + 0.5, 606.5, 63, 87, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
      ctx.font = `500 24px ${FONT.mono}`; ctx.fillStyle = '#00ff88'; ctx.textAlign = 'center';
      ctx.fillText(String(parts[i]).padStart(2, '0'), x + 32, 645);
      ctx.font = `400 10px ${FONT.mono}`; spacing(ctx, 1.5); ctx.fillStyle = 'rgba(238,242,238,.5)'; ctx.fillText(lab, x + 32, 674); spacing(ctx, 0);
      ctx.textAlign = 'left';
    });
    ctx.restore();
  }
}

// Agentic City (Track 3) hero: a quiet district at cy = .7 on a 1280 × 890 canvas.
// The page also overlays a product screenshot and a chat panel; those are photographs
// of another application and are not reconstructed.
export class EwmCityScene {
  constructor() { this.width = W; this.height = VIEW_H; this.duration = 12; this.city = makeCity({ quiet: true }); }
  render(ctx, state = {}) {
    const { t, P } = frameState(state, this.duration);
    ctx.save();
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, W, VIEW_H);
    const deep = ctx.createRadialGradient(640, 0, 40, 640, 0, 900);
    deep.addColorStop(0, 'rgba(32,12,58,.55)'); deep.addColorStop(1, 'rgba(13,5,25,0)');
    ctx.fillStyle = deep; ctx.fillRect(0, 0, W, VIEW_H);
    drawCity(ctx, this.city, W, 890, t, P, { cyr: 0.7 });
    const wash = ctx.createLinearGradient(0, 0, 820, 0);
    wash.addColorStop(0, 'rgba(5,6,8,.6)'); wash.addColorStop(1, 'rgba(5,6,8,0)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 820, VIEW_H);
    drawNav(ctx, W, ['How to play', 'Submit', 'Evaluation', 'Who can play', 'Engine', 'Timeline', 'FAQ'], { cta: 'All tracks →' });
    kicker(ctx, 50, 139, 'ECONOMIC WORLD MODEL CHALLENGE · TRACK 3 · WORLD BY AGENTIC CITY', '#b06bff');
    ctx.font = `700 98px ${FONT.display}`; spacing(ctx, -3);
    ctx.fillStyle = '#eef2ee'; ctx.fillText('Plan a city by', 50, 256);
    glowText(ctx, 'talking to it.', 50, 354, '#b06bff', 'rgba(176,107,255,.6)'); spacing(ctx, 0);
    paragraph(ctx, ['Become the chief planner of a 17.73 km² core district in Hong Kong\'s Northern', 'Metropolis — San Tin, the Loop\'s Hong Kong Park and Ngau Tam Mei — and',
      'design it for 2035. Tell the AI agent where to zone, what to build and which bus', 'routes to add, then write your policies. Within a fixed budget, you build the city;',
      'we then run it through scenario simulations and see how residents, firms and', 'investors respond.'], 50, 417, 31.7, 'rgba(238,242,238,.78)');
    pill(ctx, 50, 621, 206, 50, 'SEE HOW IT WORKS ↓', { fill: '#b06bff', color: '#0d0519', glow: 'rgba(176,107,255,.55)' });
    pill(ctx, 268, 621, 198, 50, 'WHAT YOU SUBMIT ↓');
    ctx.restore();
  }
}

// tracks.html: three slanted panels, each with its own world running behind it.
const SEAM = { c1: W / 3, c2: W * 2 / 3, lean: 0.1063 * VIEW_H };
export class EwmTracksScene {
  constructor() {
    this.width = W; this.height = VIEW_H; this.duration = 12;
    this.holo = makeHolo(614, VIEW_H, { lite: true, seed: 3 });
    this.risk = makeHolo(742, VIEW_H, { risk: true, lite: true, seed: 9 });
    this.city = makeCity({ seed: 21 });
  }
  panel(ctx, k, paint) {
    const { c1, c2, lean } = SEAM, H = VIEW_H;
    const polys = [[[0, 0], [c1 + lean, 0], [c1 - lean, H], [0, H]], [[c1 + lean, 0], [c2 + lean, 0], [c2 - lean, H], [c1 - lean, H]], [[c2 + lean, 0], [W, 0], [W, H], [c2 - lean, H]]];
    ctx.save(); ctx.beginPath(); polys[k].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
    paint();
    const vig = ctx.createLinearGradient(0, 0, 0, H);   // .side::before vignette
    vig.addColorStop(0, 'rgba(0,0,0,.55)'); vig.addColorStop(0.32, 'rgba(0,0,0,0)'); vig.addColorStop(0.52, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.88)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  render(ctx, state = {}) {
    const { t, P } = frameState(state, this.duration), H = VIEW_H;
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const bg = (x, y, rx, ry, stops) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(rx / ry, 1);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry); stops.forEach(([o, col]) => g.addColorStop(o, col));
      ctx.fillStyle = g; ctx.fillRect(-x * ry / rx, -y, W * ry / rx, H); ctx.restore();
    };
    this.panel(ctx, 0, () => {
      bg(W * 0.18, H * 0.3, W * 1.2, H * 0.9, [[0, '#063a22'], [0.45, '#02140c'], [1, '#000']]);
      // .fx-top: the terminal at 40% opacity, masked to fade out over its lower half
      const th = H * 0.58;
      for (let band = 0; band < 8; band++) {
        const y0 = band === 0 ? 0 : th * (0.5 + (band - 1) * 0.48 / 7), y1 = band === 0 ? th * 0.5 : th * (0.5 + band * 0.48 / 7);
        ctx.save(); ctx.beginPath(); ctx.rect(0, y0, 614, y1 - y0); ctx.clip();
        ctx.globalAlpha = 0.4 * (band === 0 ? 1 : 1 - (band - 0.5) / 7);
        drawTerminal(ctx, 614, th, t, 0.9); ctx.restore();
      }
      drawHolo(ctx, this.holo, t, { ...P, act: 0 });
    });
    this.panel(ctx, 1, () => {
      bg(W * 0.5, H * 0.4, W * 0.9, H * 0.8, [[0, '#04302c'], [0.45, '#021412'], [1, '#000']]);
      ctx.save(); ctx.translate(256, 0); drawHolo(ctx, this.risk, t, { ...P, act: 0 }); ctx.restore();
    });
    this.panel(ctx, 2, () => {
      bg(W * 0.82, H * 0.7, W * 1.2, H * 0.9, [[0, '#2a0e4a'], [0.45, '#0d0519'], [1, '#000']]);
      ctx.fillStyle = 'rgba(46,12,92,.55)'; ctx.fillRect(W - 793.6, H - 446.4, 793.6, 446.4);
      ctx.save(); ctx.translate(307, H); ctx.scale(1, -1);   // the district hangs from the top edge
      drawCity(ctx, this.city, 973, H, t, P, { cxr: 0.79, cyr: 0.72, scale: 0.66 }); ctx.restore();
    });
    // the seams between worlds
    const { c1, c2, lean } = SEAM;
    [[c1, '0,255,136'], [c2, '176,107,255']].forEach(([cx, col]) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgba(${col},.15)`); g.addColorStop(0.5, `rgba(${col},.75)`); g.addColorStop(1, `rgba(${col},.15)`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx + lean, 0); ctx.lineTo(cx - lean, H); ctx.stroke();
    });
    // page copy
    drawNav(ctx, W, ['About', 'Tracks 1–2', 'Track 3'], { cta: null });
    ctx.textAlign = 'center';
    ctx.font = `500 12px ${FONT.mono}`; spacing(ctx, 3.6); ctx.fillStyle = '#8fd6ff'; ctx.fillText('ECONOMIC WORLD MODEL CHALLENGE', 640, 135);
    ctx.font = `700 62px ${FONT.display}`; spacing(ctx, -1.5); ctx.fillStyle = '#f4f7f4'; ctx.fillText('Choose your track', 640, 206);
    ctx.font = `400 12px ${FONT.mono}`; spacing(ctx, 3); ctx.fillStyle = 'rgba(238,242,238,.62)'; ctx.fillText('MANY WORLDS · ONE ECONOMIC WORLD MODEL', 640, 241);
    ctx.fillStyle = 'rgba(238,242,238,.45)'; ctx.fillText('HOVER TO EXPLORE · CLICK TO ENTER', 640, 701); spacing(ctx, 0);
    ctx.textAlign = 'left';
    const tracks = [
      [38, 365, 'TRACK 1', ['Strategy', 'Agent'], 'WORLD · HOLOBIT', ['Manage simulated capital across Uniswap', 'V3 and Aave v3 and earn the best risk-', 'adjusted return.'], '#00ff88', 'ENTER TRACK 1 →', 187],
      [455, 365, 'TRACK 2', ['Protocol', 'Risk Agent'], 'WORLD · HOLOBIT', ['Act as Aave\'s risk steward: tune risk', 'parameters so the protocol stays solvent', 'through stress.'], '#3ff2c8', 'ENTER TRACK 2 →', 187],
      [881, 387, 'TRACK 3', ['Agentic City'], 'WORLD · AGENTIC CITY', ['Plan a core district of Hong Kong\'s Northern', 'Metropolis for 2035 by talking to an AI agent,', 'then see how simulated residents, firms and', 'investors respond.'], '#b06bff', 'ENTER TRACK 3 →', 187],
    ];
    for (const [x, y, tag, title, world, lede, col, cta, bw] of tracks) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 4, y - 4, 4, 0, TAU); ctx.fill();
      ctx.font = `500 12px ${FONT.mono}`; spacing(ctx, 2.6); ctx.fillText(tag, x + 16, y); spacing(ctx, 0);
      ctx.font = `700 44px ${FONT.display}`; spacing(ctx, -1); ctx.fillStyle = '#f4f7f4';
      title.forEach((l, i) => ctx.fillText(l, x, y + 62 + i * 46)); spacing(ctx, 0);
      const wy = y + 62 + (title.length - 1) * 46 + 38;
      ctx.font = `400 12px ${FONT.mono}`; spacing(ctx, 2); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(world, x, wy); spacing(ctx, 0);
      paragraph(ctx, lede, x, wy + 42, 23, 'rgba(255,255,255,.8)', `400 15px ${FONT.body}`);
      pill(ctx, x, 615, bw, 47, cta, { fill: col, color: '#04121c', glow: col });
    }
    ctx.restore();
  }
}
