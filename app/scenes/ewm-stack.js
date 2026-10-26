// EWM Challenge home · "The model" — a Canvas 2D port of assets/js/stack3d.js.
//
// The site pins a WebGL scene (three.js r160, bloom, Kenney GLB characters and
// buildings) and scrolls a camera through four layers of an economic world model:
// L1 a transformer + RL circuits inside one agent's chest, L2 agents walking a town,
// L3 market-clearing modules wired by data pipes, L4 an armillary converging on the
// data-driven equilibrium beside real data — then pulls out to the whole model with
// ECONOMIC WORLD MODEL CHALLENGE lettered around it.
//
// Here the timeline stands in for scroll progress: p = elapsed / duration drives the
// original camera keyframes (Catmull-Rom, log-space radius) and the original reveal
// and dimming curves; elapsed is also the animation clock. Depth is approximated with
// a painter's sort; the GLB models are replaced by shaded low-poly boxes; bloom is
// replaced by additive strokes and a few shadow glows.

import { clamp, hash, rng, FONT, spacing, pointerOf, roundRect } from './ewm-fx.js';

const TAU = Math.PI * 2;
const ICE = [143, 214, 255], WHITE = [228, 243, 255], SKY = [169, 207, 255], GREEN = [0, 255, 136], TEAL = [63, 242, 200];
const VIOLET = [176, 107, 255], PINK = [255, 95, 210], GOLD = [255, 200, 87], LILAC = [201, 182, 255];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = v => 1 - Math.pow(1 - v, 3);
const sstep = v => { v = clamp(v); return v * v * (3 - 2 * v); };

const PY = 0, Y3 = 3.8, Y4 = 7.6, HALF = 6, HALF2 = 8.5, RING_Y = 3.6, CHAR_H = 0.78, CHEST = 0.26, S1 = 0.05;
const HC = [0, CHEST, 2.6];
const W = 1280, H = 720, FOCAL = (H / 2) / Math.tan(17 * Math.PI / 180), OFFSET_X = W * 0.2;

/* ---------- camera path, copied from stack3d.js ---------- */
const KEYS = [
  [0.00, HC[0], HC[1] + 0.12, HC[2], 1.25, 0.25, 0.12, 0], [0.07, HC[0], HC[1] + 0.12, HC[2], 1.35, 0.05, 0.16, 0],
  [0.13, HC[0], HC[1] + 0.12, HC[2], 1.9, -0.15, 0.2, 0], [0.19, HC[0], 0.42, HC[2], 3.2, -0.3, 0.22, 0],
  [0.27, 0, 0.6, 1.2, 13, 0.05, 0.42, 0], [0.35, 0, 0.5, 0, 22, 0.4, 0.6, 0], [0.39, 0, 5.0, 0, 15, -0.35, -0.27, 0],
  [0.45, 0, 6.2, 0, 16, 0.1, -0.17, 0], [0.50, 0, Y3, 0, 18, 1.0, 0.62, 3], [0.58, 0.8, Y4 + 1.2, 0, 20, 0.55, 0.42, 4],
  [0.68, 0.4, Y4 + 1.4, 0, 16.5, 0.1, 0.34, 4], [0.80, 0, 3.8, 0, 80, 0.35, 0.2, 0], [0.92, 0, 3.6, 0, 74, 0.7, 0.17, 0],
  [1.00, 0, 3.6, 0, 74, 0.85, 0.17, 0],
].map(k => { const c = k.slice(); c[4] = Math.log(c[4]); return c; });
const cr = (p0, p1, p2, p3, s) => 0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s * s * s);
function camAt(p, E3, E4) {
  p = clamp(p); let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
  const a = KEYS[Math.max(0, i - 1)], b = KEYS[i], c = KEYS[i + 1], d = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const s = (p - b[0]) / (c[0] - b[0]), e = s * s * (3 - 2 * s) * 0.35 + s * 0.65;
  const val = (key, k) => k === 2 ? key[2] + (key[7] === 3 ? E3 : key[7] === 4 ? E4 : 0) : key[k];
  const out = []; for (let k = 1; k < 7; k++) out.push(cr(val(a, k), val(b, k), val(c, k), val(d, k), e)); out[3] = Math.exp(out[3]); return out;
}
// how far the upper layers float above their resting height while the camera visits them
function gaps(p) {
  const out = 1 - sstep((p - 0.72) / 0.1), e3 = 5 * sstep((p - 0.3) / 0.08) * out;
  return [e3, e3 + 5 * sstep((p - 0.5) / 0.08) * out];
}

/* ---------- small 3D helpers ---------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rotY = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
const rotX = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
const rotZ = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; };
const bez = (a, m, b, u) => add(add(mul(a, (1 - u) * (1 - u)), mul(m, 2 * u * (1 - u))), mul(b, u * u));

class Camera {
  constructor(pos, target) {
    this.pos = pos; this.f = norm(sub(target, pos)); this.r = norm(cross(this.f, [0, 1, 0])); this.u = cross(this.r, this.f);
  }
  project(p) {
    const d = sub(p, this.pos), z = dot(d, this.f);
    if (z < 0.02) return null;
    const s = FOCAL / z;
    return { x: W / 2 + OFFSET_X + dot(d, this.r) * s, y: H / 2 - dot(d, this.u) * s, z, s };
  }
}

/* ---------- the town (L2) and its people ---------- */
const BLD = {
  bank: { c: VIOLET, name: 'BANK', act: 'BORROW', r: 1.6 }, court: { c: SKY, name: 'COURT', act: 'RULES · DISPUTES', r: 1.8 },
  market: { c: GREEN, name: 'STOCK MARKET', act: 'TRADE', r: 1.45 }, firm: { c: TEAL, name: 'FIRM', act: 'WORK', r: 1.25 },
  home: { c: SKY, name: 'HOME', act: 'SPEND · SAVE', r: 1.35 }, home2: { c: SKY, name: 'HOME', act: 'SPEND · SAVE', r: 1.35 },
};
const TOWN = [['court', 0, -6.2], ['bank', -5.3, -4.3], ['market', 5.3, -4.3], ['firm', 6.3, 1.6], ['home', -6.3, 1.6], ['home2', -3.9, 6.1], ['home', 3.9, 6.1]];
const STONE = [217, 222, 232];
// Low-poly stand-ins for the GLB models: [cx, cy, cz, sx, sy, sz, colour] in the building's own frame (front = +z).
function buildingParts(kind) {
  if (kind === 'bank' || kind === 'court') {
    const Wd = kind === 'court' ? 3.0 : 2.6, D = 1.9, roof = kind === 'court' ? [91, 100, 118] : [107, 90, 168], n = kind === 'court' ? 6 : 5;
    const parts = [[0, 0.07, 0.05, Wd + 0.4, 0.14, D + 0.5, STONE], [0, 0.2, 0.05, Wd + 0.2, 0.12, D + 0.3, STONE], [0, 0.88, -0.2, Wd - 0.3, 1.25, D - 0.5, STONE]];
    for (let k = 0; k < n; k++) parts.push([-Wd / 2 + 0.25 + k * (Wd - 0.5) / (n - 1), 0.88, D / 2 - 0.05, 0.18, 1.25, 0.18, STONE]);
    parts.push([0, 1.6, 0, Wd + 0.1, 0.18, D + 0.1, STONE], { prism: [0, 1.69, 0, Wd + 0.1, 0.36, D + 0.1, roof] });
    if (kind === 'court') parts.push([0, 2.3, -0.2, 0.84, 0.35, 0.84, STONE], [0, 2.6, -0.2, 0.7, 0.3, 0.7, roof]);
    else parts.push([0, 1.6, D / 2 + 0.07, 0.9, 0.22, 0.04, GOLD]);
    return { parts, top: kind === 'court' ? 2.9 : 2.3 };
  }
  if (kind === 'market') return { parts: [[0, 0.75, 0, 2.3, 1.5, 1.7, [232, 226, 214]], [0, 1.56, 0, 2.5, 0.12, 1.9, [40, 170, 110]], [0, 0.55, 0.9, 2.1, 0.08, 0.5, [24, 214, 122]]], top: 1.62, candles: true };
  if (kind === 'firm') return { parts: [[0, 1.2, 0, 1.6, 2.4, 1.5, [196, 205, 214]], [0, 2.47, 0, 1.7, 0.14, 1.6, [70, 92, 112]], [0, 0.45, 0.76, 0.5, 0.9, 0.04, [63, 242, 200]]], top: 2.54 };
  return { parts: [[0, 0.55, 0, 1.7, 1.1, 1.5, [230, 224, 210]], { prism: [0, 1.1, 0, 1.9, 0.75, 1.7, kind === 'home2' ? [52, 120, 170] : [52, 150, 104]] }, [0, 0.35, 0.76, 0.32, 0.7, 0.04, [120, 82, 60]]], top: 1.85 };
}
const SKIN = [[247, 205, 170], [214, 160, 118], [168, 112, 78], [240, 190, 150], [120, 80, 56], [232, 182, 140]];
const SHIRT = [[236, 240, 248], [70, 140, 220], [230, 90, 90], [80, 190, 140], [244, 190, 70], [150, 110, 220], [60, 70, 90]];
const HAIR = [[60, 40, 30], [30, 26, 24], [160, 90, 40], [220, 180, 90], [90, 60, 40]];

function makeFigures(seed) {
  const r = rng(seed), figs = [];
  for (let i = 0; i < 14; i++) {
    figs.push({ i, x: i === 0 ? 0 : (r() - 0.5) * 7, z: i === 0 ? 2.6 : (r() - 0.5) * 7, yaw: 0, state: 'wander', tx: 0, tz: 0, timer: r() * 2,
      partner: null, target: null, side: null, tetherA: 0, walk: 0, moving: false,
      c: i === 0 ? WHITE : [WHITE, ICE, WHITE, LILAC, ICE, WHITE, SKY][i % 7], skin: SKIN[i % SKIN.length], shirt: SHIRT[(i * 3) % SHIRT.length], hair: HAIR[(i * 2) % HAIR.length], word: 'TALK', wordC: WHITE });
  }
  return figs;
}

// The site's agent behaviour (wander → errand at a building or a chat with another
// agent → dock → let go), re-stepped at 30 Hz from t = 0 with one seeded stream.
// Every 30th step is snapshotted (people, docks and the PRNG state), so a frame only
// re-steps from the nearest earlier second; the result is identical either way.
const TOWN_DT = 1 / 30, townCache = new Map();
function snapshotTown(figs, blds, rs) {
  return { rs, docks: blds.map(b => b.docks), figs: figs.map(f => ({ ...f, partner: f.partner ? f.partner.i : null, target: f.target ? blds.indexOf(f.target) : null })) };
}
function simulateTown(seed, T, pAt, cacheKey = null) {
  const blds = TOWN.map(([kind, x, z]) => ({ kind: kind === 'home2' ? 'home' : kind, d: BLD[kind], x, z, docks: 0 }));
  const steps = Math.floor(T / TOWN_DT), cache = cacheKey && (townCache.get(cacheKey) || townCache.set(cacheKey, []).get(cacheKey));
  let figs, rs, from = 0;
  const snap = cache && cache[Math.min(Math.floor(steps / 30), cache.length - 1)];
  if (snap) {
    figs = snap.figs.map(f => ({ ...f })); rs = snap.rs; from = snap.step;
    blds.forEach((b, i) => { b.docks = snap.docks[i]; });
    figs.forEach(f => { f.partner = f.partner == null ? null : figs[f.partner]; f.target = f.target == null ? null : blds[f.target]; });
  } else { figs = makeFigures(seed); rs = (seed * 7 + 1) >>> 0; }
  const r = () => {   // mulberry32 with its state exposed for snapshots
    rs = (rs + 0x6D2B79F5) >>> 0;
    let t = rs;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hero = figs[0];
  const turnTo = (f, want, rate, dt) => { let dy = want - f.yaw; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; f.yaw += dy * (1 - Math.pow(rate, dt)); };
  const choose = f => {
    if (r() < 0.3) {
      const free = figs.filter(g => g !== f && g !== hero && g.state === 'wander'), o = free[Math.floor(r() * free.length)];
      if (o) { f.state = 'go'; f.target = null; f.partner = o; o.state = 'wait'; o.partner = f; return; }
    }
    if (r() < 0.8) { f.state = 'go'; f.target = blds[Math.floor(r() * blds.length)]; f.partner = null; return; }
    f.state = 'wander'; f.tx = (r() - 0.5) * 9; f.tz = (r() - 0.5) * 9; f.timer = 2 + r() * 3;
  };
  const release = f => {
    if (f.target) f.target.docks--;
    if (f.partner && f.partner.partner === f) { const o = f.partner; o.state = 'wander'; o.timer = 0.5; o.partner = null; o.tx = o.x; o.tz = o.z; }
    f.target = null; f.partner = null; f.side = null; f.state = 'wander'; f.tx = f.x + (r() - 0.5) * 4; f.tz = f.z + (r() - 0.5) * 4; f.timer = 1.5 + r() * 2;
  };
  const dt = TOWN_DT;
  for (let s = from; s < steps; s++) {
    if (cache && s % 30 === 0 && !cache[s / 30]) cache[s / 30] = { ...snapshotTown(figs, blds, rs), step: s };
    const pS = pAt((s + 1) * dt), heroHold = pS < 0.24;
    if (heroHold) { const k = 1 - Math.pow(0.05, dt); hero.x += -hero.x * k; hero.z += (2.6 - hero.z) * k; }
    for (const f of figs) {
      let gx = f.tx, gz = f.tz; f.moving = false;
      if (f === hero && heroHold) { if (f.state !== 'hold') { if (f.state === 'dock' || f.state === 'go') release(f); f.state = 'hold'; } }
      else if (f.state === 'hold') { f.state = 'wander'; f.timer = 0; }
      if (f.state === 'wander') { f.timer -= dt; if (f.timer <= 0) choose(f); }
      if (f.state === 'go') {
        if (f.target) {
          const b = f.target, fd = Math.hypot(b.x, b.z) || 1, rr = b.d.r + 0.35, side = (f.side = f.side == null ? (r() - 0.5) * 1.2 : f.side);
          gx = b.x - b.x / fd * rr - b.z / fd * side; gz = b.z - b.z / fd * rr + b.x / fd * side;
          if (Math.hypot(f.x - gx, f.z - gz) < 0.08) { f.state = 'dock'; f.timer = 2 + r() * 2; b.docks++; }
        } else if (f.partner) {
          const o = f.partner;
          if (o.partner !== f) { release(f); continue; }
          const dx = f.x - o.x, dz = f.z - o.z, d = Math.hypot(dx, dz) || 1; gx = o.x + dx / d * 0.7; gz = o.z + dz / d * 0.7;
          if (Math.hypot(f.x - gx, f.z - gz) < 0.08) { f.state = 'dock'; f.timer = 2.5 + r() * 1.5; o.state = 'dock'; o.timer = f.timer + 0.2; }
        } else f.state = 'wander';
      }
      if (f.state === 'dock') { f.timer -= dt; if (f.timer <= 0) release(f); }
      if (f.state === 'wander' || f.state === 'go') {
        const dx = gx - f.x, dz = gz - f.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { const sp = Math.min(d, 0.75 * dt); f.x += dx / d * sp; f.z += dz / d * sp; f.walk += sp; f.moving = true; turnTo(f, Math.atan2(dx, dz), 0.002, dt); }
        f.x = clamp(f.x, -HALF2 + 0.6, HALF2 - 0.6); f.z = clamp(f.z, -HALF2 + 0.6, HALF2 - 0.6);
      }
      if (f.state === 'dock') { const o = f.target || f.partner; if (o) turnTo(f, Math.atan2(o.x - f.x, o.z - f.z), 0.01, dt); }
      if (f.state === 'hold') turnTo(f, 0, 0.01, dt);
      f.tetherA += ((f.state === 'dock' ? 1 : 0) - f.tetherA) * (1 - Math.pow(0.02, dt));
      if (f.state === 'dock') { f.word = f.target ? f.target.d.act : 'TALK'; f.wordC = f.target ? f.target.d.c : WHITE; }
    }
    if (pS < 0.3) for (const f of figs) {   // while the camera pulls out of the hero, others keep their distance
      if (f === hero) continue;
      const dx = f.x - hero.x, dz = f.z - hero.z, d = Math.hypot(dx, dz) || 1;
      if (d < 3.2) { f.x = hero.x + dx / d * 3.2; f.z = hero.z + dz / d * 3.2; if (f.state === 'go' && f.partner === hero) f.state = 'wander'; }
    }
  }
  return { figs, blds };
}

/* ---------- L1 · intelligence foundation (built at its own scale, carried in the hero's chest) ---------- */
const BLK = [0.3, 1.2, 2.1, 3.0], RX = 4.4, SOMA = [RX, 1.8, 0];
const WORDS = ['BELIEF', 'PRICE', 'PLAN', 'RISK', 'WHY', 'IF', 'WAGE', 'RATE', 'TRUST', 'DEBT', 'SAVE', 'BUY', 'EXPECT', 'SIGNAL'];
function makeL1(seed) {
  const r = rng(seed), segs = [], nodes = [], paths = [];
  const grow = (from, dir, len, depth, path, col) => {
    const to = add(from, mul(dir, len)), c = mul(col, 0.55 + 0.45 * depth / 4);
    segs.push([from, to, c]); nodes.push(to);
    const p = path.concat([to]);
    if (depth <= 1) { paths.push({ pts: p, c: col }); return; }
    const n = depth > 2 ? 2 : 2 + (r() < 0.4 ? 1 : 0);
    for (let k = 0; k < n; k++) grow(to, norm(add(dir, [(r() - 0.5) * 1.3, (r() - 0.35) * 1.0, (r() - 0.5) * 1.3])), len * (0.62 + r() * 0.15), depth - 1, p, col);
  };
  for (let k = 0; k < 9; k++) {   // dendrites spread out from the reward core
    const yy = 1 - 2 * (k + 0.5) / 9, rr = Math.sqrt(1 - yy * yy), a = k * 2.4, dir = norm([Math.cos(a) * rr, yy * 0.8, Math.sin(a) * rr]);
    const root = add(SOMA, mul(dir, 0.35));
    grow(root, dir, 0.85, 4, [SOMA, root], k % 3 === 0 ? TEAL : GREEN);
  }
  const heads = []; BLK.forEach((y, bi) => { for (let h = 0; h < 6; h++) heads.push({ p: [-0.8 + (h % 3) * 0.8, y + 0.32, -0.4 + Math.floor(h / 3) * 0.8], sp: 0.8 + r() * 1.6, ax: r() < 0.5, c: h % 3 === 0 ? WHITE : bi % 2 ? VIOLET : ICE }); });
  const bridges = BLK.map((y, k) => ({ a: [1.3, y, 0], m: [2.6, (y + 1.8) / 2 + 0.3, 0.5], b: SOMA, c: k % 2 ? TEAL : ICE }));
  const tokens = Array.from({ length: 10 }, (_, i) => ({ i, k0: i / 10, sp: 1 / (7 + r() * 3) }));
  return { segs, nodes, paths, heads, bridges, tokens };
}
function tokenPath(i, cyc) {
  const h = k => hash(i * 71.3 + cyc * 13.7 + k * 3.1) - 0.5, path = [[h(0) * 2, -0.9, 1.4]];
  BLK.forEach((y, k) => path.push([h(k + 1) * 1.8, y + 0.55, 1.15]));
  path.push([h(9) * 1.2, 4.4, 0.6]);
  return path;
}

/* ---------- L3 / L4 data, copied from stack3d.js ---------- */
const MODS = [{ n: 'AUCTIONS', c: GREEN }, { n: 'MATCHING', c: TEAL }, { n: 'PRICES', c: GREEN }, { n: 'ACCOUNTING', c: SKY }, { n: 'BUDGETS', c: SKY }, { n: 'POLICY RULES', c: VIOLET }, { n: 'INSTITUTIONS', c: VIOLET }];
const L3MODS = [{ n: 'MARKET CLEARING', c: ICE, x: 0, z: 0, r: 1.55, h: 0.55 }].concat(MODS.map((d, i) => {
  const a = i / MODS.length * TAU + 0.35; return { ...d, x: Math.cos(a) * 4.3, z: Math.sin(a) * 4.3, r: 0.98, h: 0.36 };
}));
const L3PIPES = (() => {
  const out = [], mods = L3MODS.slice(1);
  mods.forEach((m, i) => { out.push([0, i + 1, ICE, true]); out.push([i + 1, (i + 1) % mods.length + 1, m.c, i % 2 === 0]); });
  [[0, 5, VIOLET], [1, 3, TEAL], [2, 4, SKY], [6, 0, VIOLET]].forEach(([a, b, c]) => out.push([a + 1, b + 1, c, false]));
  return out;
})();
const ARM = [{ n: 'BEHAVIOUR', c: WHITE, tilt: [1.05, 0, 0.45], spin: 0.55 }, { n: 'DATA', c: TEAL, tilt: [-0.7, 0, 1.0], spin: -0.4 }, { n: 'LEARNED ENV', c: VIOLET, tilt: [0.25, 0, -1.15], spin: 0.32 }];
const AR_R = 1.9, RDX = 2.6, RDN = 12, RDW = 3.4;
const SERIES = Array.from({ length: RDN }, (_, i) => 0.7 + 0.35 * Math.sin(i * 0.7) + i * 0.09 + (i % 3 === 0 ? 0.18 : 0));
const RING_TEXT = 'ECONOMIC WORLD MODEL CHALLENGE';
const LAYERS = [
  ['L1', 'Intelligence Foundation', ['Inside every agent. LLMs carry beliefs, reasoning', 'and language; RL drives goal optimisation', 'and adaptation.']],
  ['L2', 'Economic Agents', ['How a single person or firm acts: roles, goals,', 'private states, belief updates, decision policies and', 'constraints, calibrated to real behaviour, bounded', 'rationality included.']],
  ['L3', 'Economic Environment\n& Institutions', ['How individual actions add up: market mechanisms', '(clearing, auctions, matching), accounting and', 'budget constraints, policy rules, and institutions that', 'can evolve.']],
  ['L4', 'Equilibrium & Reality Discipline', ['Why the results can be trusted: internally, a data-', 'driven generative equilibrium, a fixed point where', 'behaviour, data and the learned environment agree;', 'externally, continuous calibration to real data.']],
];

export class EwmStackScene {
  constructor() {
    this.width = W; this.height = H; this.duration = 24;
    this.l1 = makeL1(17);
  }

  render(ctx, state = {}) {
    const elapsed = clamp(Number(state.elapsed) || 0, 0, this.duration), p = elapsed / this.duration;
    // Reduced motion: scroll progress still follows the timeline, but the clocks hold still.
    const t = state.reducedMotion ? 3 : elapsed, P = pointerOf(state);
    const town = state.reducedMotion ? simulateTown(29, t, () => p) : simulateTown(29, t, s => s / this.duration, `scroll-${this.duration}`);
    const [E3, E4] = gaps(p);

    // camera
    let [tx, ty, tz, rad, th, ph] = camAt(p, E3, E4);
    const far = clamp((p - 0.2) / 0.1), hero = town.figs[0];
    th += (t * 0.02 + P.x * 0.1) * far; ph = Math.max(-0.9, Math.min(1.25, ph - P.y * 0.04 * far));
    if (p < 0.3) { const k = 1 - clamp((p - 0.22) / 0.08); tx += (hero.x - HC[0]) * k; tz += (hero.z - HC[2]) * k; }
    const cam = new Camera([tx + Math.cos(ph) * Math.sin(th) * rad, ty + Math.sin(ph) * rad, tz + Math.cos(ph) * Math.cos(th) * rad], [tx, ty, tz]);

    // reveal and dimming curves (pose() in stack3d.js)
    const L = 1 - clamp((p - 0.2) / 0.1) * 0.75, r2 = ease(clamp((p - 0.1) / 0.12)), r3 = clamp((p - 0.38) / 0.13), g3 = clamp((p - 0.33) / 0.07);
    const r4 = ease(clamp((p - 0.53) / 0.1)), r5 = clamp((p - 0.71) / 0.12), all = clamp((p - 0.76) / 0.1);
    const dimAfter = next => 1 - 0.8 * clamp((p - next) / 0.06) * (1 - all);
    const f2 = dimAfter(0.45), f3 = dimAfter(0.55), f4 = dimAfter(0.73), lab = (r, f) => r * (0.15 + 0.85 * f);
    const cyc = (t % 12) / 12, conv = cyc < 0.42 ? sstep(cyc / 0.42) : cyc < 0.7 ? 1 : 1 - sstep((cyc - 0.7) / 0.3);
    const tight = 1 - clamp(Math.max(E3, E4 - E3) / 1.2);
    const V = { ctx, cam, t, p, E3, E4 };

    ctx.save();
    ctx.fillStyle = '#030405'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round';

    // L2 ground: grid, frame and flat label
    if (r2 > 0.01) {
      const step = HALF2 * 2 / 16;
      for (let i = 0; i <= 16; i++) {
        const v = -HALF2 + i * step;
        this.line(V, [v, PY, -HALF2], [v, PY, HALF2], ICE, r2 * 0.12 * f2, 1);
        this.line(V, [-HALF2, PY, v], [HALF2, PY, v], ICE, r2 * 0.12 * f2, 1);
      }
      this.square(V, PY, HALF2, WHITE, r2 * 0.4 * f2, false);
      this.flatLabel(V, 'L2', 'ECONOMIC AGENTS', WHITE, 3.8, [-HALF2 + 1.9, PY + 0.02, HALF2 + 0.75], lab(r2, f2));
    }
    if (r3 > 0) {
      this.square(V, Y3 + E3, HALF, ICE, r3 * 0.4 * f3, false);
      this.flatLabel(V, 'L3', 'ENVIRONMENT & INSTITUTIONS', ICE, 3.8, [-HALF + 1.9, Y3 + E3 + 0.02, HALF + 0.75], lab(r3, f3));
    }
    if (r4 > 0) {
      this.square(V, Y4 + E4, HALF, ICE, r4 * 0.45 * f4, true);
      this.flatLabel(V, 'L4', 'EQUILIBRIUM & REALITY', ICE, 3.8, [-HALF + 1.9, Y4 + E4 + 0.02, HALF + 0.75], lab(r4, f4));
    }

    // L2 solids: buildings and people, painter-sorted
    const faces = [];
    const hk = 1 + 7 * Math.pow(1 - sstep((p - 0.09) / 0.14), 2);   // the hero starts huge and shrinks to real size around the orb
    const bA = clamp((p - 0.11) / 0.035);
    if (r2 > 0.01 && bA > 0) town.blds.forEach((b, bi) => this.building(V, faces, b, TOWN[bi][0], bA));
    const heroA = clamp((p - 0.115) / 0.025), othersA = clamp((p - 0.115) / 0.035);
    const chest = [hero.x, CHEST, hero.z];
    for (const f of town.figs) {
      let a = f === hero ? heroA : othersA;
      if (f === hero) { const size = hk * CHAR_H, d = Math.hypot(...sub(cam.pos, chest)); a *= clamp((d - 0.6 * size) / (0.12 * size)); }
      if (a > 0.01) this.figure(V, faces, f, f === hero ? hk : 1, a, f === hero && f.state === 'hold');
    }
    faces.sort((a, b) => b.z - a.z);
    for (const fc of faces) {
      ctx.globalAlpha = fc.a; ctx.fillStyle = fc.fill; ctx.strokeStyle = fc.fill; ctx.lineWidth = 0.6;
      ctx.beginPath(); fc.pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    // docking tethers, building tags, market tickers
    for (const f of town.figs) {
      if (f.tetherA < 0.02 || othersA < 0.01) continue;
      const o = f.target || f.partner;
      if (o) this.line(V, [f.x, 0.4, f.z], [o.x, f.target ? 0.8 : 0.4, o.z], f.c, f.tetherA * 0.7 * r2 * f2, 1.4);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (r2 > 0.01) {
      town.blds.forEach((b, bi) => {
        const top = buildingParts(TOWN[bi][0]).top + (b.kind === 'market' ? 0.6 : 0);
        this.tag(V, b.d.name, b.d.c, 0.3, [b.x, PY + top + 0.35, b.z], lab(r2, f2) * 0.8);
      });
      for (const f of town.figs) if (f.tetherA > 0.05 && othersA > 0.01) this.tag(V, f.word, f.wordC, 0.24, [f.x, PY + CHAR_H + 0.3, f.z], f.tetherA * r2 * (0.15 + 0.85 * f2));
    }

    // neural lines: each person's head and building roof grows a trunk into L3
    if (g3 > 0) this.neural(V, town, g3, 0.35 + 0.65 * f3);

    // L3 · economic environment & institutions
    if (r3 > 0) this.layer3(V, r3, f3);
    // L4 · equilibrium & reality discipline
    if (r4 > 0) this.layer4(V, r4, f4, conv, tight);

    // spine and the turning name rings
    ctx.globalCompositeOperation = 'lighter';
    const spineA = clamp(r3 * 0.6 + r4 * 0.4) * tight;
    if (spineA > 0) {
      this.riser(V, [0, PY + 1.4, 0], [0, Y4 + 2.4, 0], ICE, 9, 0.12, 0, spineA);
      this.riser(V, [0.06, Y4 + 2.4, 0.06], [0.06, PY + 1.4, 0.06], VIOLET, 9, 0.12, 1, spineA);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (all > 0) {
      const topY = PY + 2.6 + (Y3 - PY) * r3 + (Y4 - Y3) * r4 + E4;
      this.nameRing(V, topY + 0.6 * r4 + 0.4, t * 0.012 * TAU / 3, all * 0.8);
      this.nameRing(V, -0.9, -t * 0.012 * TAU / 3, all * 0.8);
    }

    // L1 in the hero's chest: shown in full, then folded into an orb as the camera pulls out
    const mg = sstep((p - 0.08) / 0.09), Lc = L * (1 - mg);
    if (Lc > 0.005 || mg > 0) this.layer1(V, chest, hero.yaw, 1 - 0.97 * mg, Lc, mg, p);

    // the outer lettering, and an agent flying in from it now and then
    const nA5 = clamp((r5 - 0.1) / 0.5);
    if (nA5 > 0) this.lettering(V, nA5, 0.85 + 0.15 * ease(r5));
    if (r5 > 0.5) this.comet(V, clamp((r5 - 0.5) / 0.4), 0.85 + 0.15 * ease(r5));

    this.panel(ctx, p);
    ctx.restore();
  }

  /* ---------- primitives ---------- */
  line(V, a, b, c, alpha, width) {
    if (alpha <= 0.003) return;
    const A = V.cam.project(a), B = V.cam.project(b);
    if (!A || !B) return;
    V.ctx.strokeStyle = rgba(c, alpha); V.ctx.lineWidth = width;
    V.ctx.beginPath(); V.ctx.moveTo(A.x, A.y); V.ctx.lineTo(B.x, B.y); V.ctx.stroke();
  }
  poly(V, pts, c, alpha, width, dash) {
    if (alpha <= 0.003) return;
    const { ctx, cam } = V;
    ctx.strokeStyle = rgba(c, alpha); ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); let pen = false;
    for (const p of pts) { const q = cam.project(p); if (!q) { pen = false; continue; } pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; }
    ctx.stroke(); if (dash) ctx.setLineDash([]);
  }
  // three.js PointsMaterial with size attenuation: diameter = size · (viewport height / 2) / depth
  dot(V, p, c, alpha, size, halo = 1.5) {
    if (alpha <= 0.003) return;
    const q = V.cam.project(p);
    if (!q) return;
    const r = Math.max(0.6, size * (H / 2) / q.z / 2), g = V.ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * halo);
    g.addColorStop(0, rgba(c, alpha)); g.addColorStop(0.35, rgba(c, alpha * 0.6)); g.addColorStop(1, rgba(c, 0));
    V.ctx.fillStyle = g; V.ctx.beginPath(); V.ctx.arc(q.x, q.y, r * halo, 0, TAU); V.ctx.fill();
  }
  // a pill-shaped upright tag that always faces the camera
  tag(V, text, c, worldH, p, alpha) {
    if (alpha <= 0.01) return;
    const q = V.cam.project(p);
    if (!q) return;
    const hpx = worldH * q.s;
    if (hpx < 4 || hpx > 220) return;
    const { ctx } = V, fs = hpx * 34 / 64;
    ctx.font = `600 ${fs.toFixed(1)}px ${FONT.mono}`; spacing(ctx, fs * 0.09);
    const w = ctx.measureText(text).width + fs * 1.3, h = hpx * 52 / 64;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(4,14,22,.42)'; ctx.strokeStyle = rgba(c, 1); ctx.lineWidth = Math.max(0.6, hpx / 32);
    roundRect(ctx, q.x - w / 2, q.y - h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2fbff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, q.x, q.y + 0.5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1; spacing(ctx, 0);
  }
  // a glowing floating word (module names on L3)
  word(V, text, c, worldH, p, alpha) {
    if (alpha <= 0.01) return;
    const q = V.cam.project(p);
    if (!q || worldH * q.s < 4) return;
    const { ctx } = V, fs = Math.min(64, worldH * q.s * 0.5);
    ctx.font = `700 ${fs.toFixed(1)}px ${FONT.mono}`; spacing(ctx, fs * 0.06);
    ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = rgba(c, 1); ctx.shadowBlur = 10; ctx.fillStyle = '#f2fbff'; ctx.fillText(text, q.x, q.y);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; spacing(ctx, 0);
  }
  // a label lying flat on a layer's floor, drawn through the affine map of three projected corners
  flatLabel(V, title, sub, c, w, at, alpha) {
    if (alpha <= 0.01) return;
    const h = w * 260 / 1024, o = V.cam.project([at[0] - w / 2, at[1], at[2] - h / 2]);
    const ex = V.cam.project([at[0] + w / 2, at[1], at[2] - h / 2]), ey = V.cam.project([at[0] - w / 2, at[1], at[2] + h / 2]);
    if (!o || !ex || !ey) return;
    const { ctx } = V;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.transform((ex.x - o.x) / 1024, (ex.y - o.y) / 1024, (ey.x - o.x) / 260, (ey.y - o.y) / 260, o.x, o.y);
    ctx.shadowColor = rgba(c, 1); ctx.shadowBlur = 16;
    ctx.fillStyle = '#f2fbff'; ctx.font = `700 112px ${FONT.display}`; ctx.fillText(title, 12, 120);
    ctx.fillStyle = rgba(c, 1); ctx.font = `600 46px ${FONT.mono}`; spacing(ctx, 6); ctx.fillText(sub, 14, 210); spacing(ctx, 0);
    ctx.restore();
  }
  square(V, y, half, c, alpha, dashed) {
    this.poly(V, [[-half, y, -half], [half, y, -half], [half, y, half], [-half, y, half], [-half, y, -half]], c, alpha, 1, dashed ? [7, 6] : null);
  }
  // a vertical light pipe with beads rising (or falling) along it
  riser(V, a, b, c, per, speed, i, alpha) {
    this.line(V, a, b, mul(c, 0.6), alpha * 0.4, 1);
    for (let q = 0; q < per; q++) {
      const u = (V.t * speed + q / per + i * 0.137) % 1;
      this.dot(V, lerp3(a, b, u), c, alpha * Math.sin(u * Math.PI), 0.22);
    }
  }
  // dark tinted faces with lambert + rim shading, queued for the painter's sort
  pushFace(V, faces, corners, base, alpha, rimK = 0.18) {
    const n = norm(cross(sub(corners[1], corners[0]), sub(corners[3], corners[0])));
    const centre = mul(corners.reduce((s, q) => add(s, q), [0, 0, 0]), 1 / corners.length), toCam = norm(sub(V.cam.pos, centre));
    if (dot(n, toCam) <= 0) return;
    const pts = corners.map(q => V.cam.project(q));
    if (pts.some(q => !q)) return;
    const sun = 0.45 * Math.max(0, dot(n, [0.371, 0.743, 0.557])), hemi = 0.5 + 0.18 * n[1];
    const rim = rimK * Math.pow(clamp(1 - Math.abs(dot(n, toCam))), 2.4);
    const col = [0, 1, 2].map(k => Math.min(255, base[k] * (hemi + sun) + ICE[k] * rim));
    faces.push({ pts, z: dot(sub(centre, V.cam.pos), V.cam.f), fill: rgba(col, 1), a: alpha });
  }
  box(V, faces, M, [cx, cy, cz, sx, sy, sz, col], alpha) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    const P = (x, y, z) => M([cx + x, cy + y, cz + z]);
    const c = [P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(-hx, hy, -hz), P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)];
    for (const f of [[4, 5, 6, 7], [1, 0, 3, 2], [5, 1, 2, 6], [0, 4, 7, 3], [7, 6, 2, 3], [0, 1, 5, 4]]) this.pushFace(V, faces, f.map(i => c[i]), col, alpha);
  }
  prism(V, faces, M, [cx, cy, cz, sx, sy, sz, col], alpha) {   // a gable roof running along z
    const hx = sx / 2, hz = sz / 2, P = (x, y, z) => M([cx + x, cy + y, cz + z]);
    const L0 = P(-hx, 0, -hz), R0 = P(hx, 0, -hz), T0 = P(0, sy, -hz), L1 = P(-hx, 0, hz), R1 = P(hx, 0, hz), T1 = P(0, sy, hz);
    this.pushFace(V, faces, [L1, T1, T0, L0], col, alpha); this.pushFace(V, faces, [R0, T0, T1, R1], col, alpha);
    this.pushFace(V, faces, [L1, R1, T1, T1], col, alpha); this.pushFace(V, faces, [R0, L0, T0, T0], col, alpha);
  }
  building(V, faces, b, kind, alpha) {
    const yaw = Math.atan2(-b.x, -b.z), M = q => add(rotY(q, yaw), [b.x, PY, b.z]), def = buildingParts(kind);
    for (const part of def.parts) part.prism ? this.prism(V, faces, M, part.prism, alpha) : this.box(V, faces, M, part, alpha);
    if (def.candles) for (let i = 0; i < 5; i++) {   // a live ticker on the roof; it runs faster while someone trades
      const h = (0.18 + 0.32 * (0.5 + 0.5 * Math.sin(V.t * (1.4 + i * 0.3) * (b.docks > 0 ? 2.5 : 1) + i * 1.3))) * 1.3;
      const up = i % 3 !== 1, col = up ? [24, 214, 122] : [255, 77, 141];
      this.box(V, faces, M, [-0.5 + i * 0.25, def.top + 0.16 + h / 2, 0, 0.16, h, 0.16, col], alpha);
    }
  }
  figure(V, faces, f, scale, alpha, waving) {
    const lift = CHEST * (1 - scale), M = q => add(rotY(mul(q, scale), f.yaw), [f.x, PY + lift, f.z]);
    const sw = f.moving ? Math.sin(f.walk * 9) * 0.07 : 0, nod = f.state === 'dock' && !f.target ? Math.sin(V.t * 6) * 0.015 : 0;
    this.box(V, faces, M, [-0.07, 0.11, sw, 0.1, 0.22, 0.11, [52, 58, 78]], alpha);
    this.box(V, faces, M, [0.07, 0.11, -sw, 0.1, 0.22, 0.11, [52, 58, 78]], alpha);
    this.box(V, faces, M, [0, 0.31, 0, 0.27, 0.2, 0.17, f.shirt], alpha);
    this.box(V, faces, M, [-0.17, 0.3, -sw, 0.07, 0.18, 0.08, f.skin], alpha);
    if (waving) {   // the hero lifts the right arm out to the side and swings it
      const a = 1.35 + Math.sin(V.t * 7) * 0.25;
      this.box(V, faces, q => M(add(rotZ(sub(q, [0.15, 0.38, 0]), -a), [0.15, 0.38, 0])), [0.15, 0.29, 0, 0.07, 0.18, 0.08, f.skin], alpha);
    } else this.box(V, faces, M, [0.17, 0.3, sw, 0.07, 0.18, 0.08, f.skin], alpha);
    this.box(V, faces, M, [0, 0.58 + nod, 0, 0.34, 0.33, 0.3, f.skin], alpha);
    this.box(V, faces, M, [0, 0.765 + nod, -0.02, 0.36, 0.06, 0.32, f.hair], alpha);
  }

  /* ---------- layers ---------- */
  neural(V, town, g, alpha) {
    const { ctx, t, E3 } = V, g1 = clamp(g * 2), g2 = clamp(g * 2 - 1), ga = clamp(g2 * 2), gb = clamp(g2 * 2 - 1);
    const ents = town.figs.map(f => ({ c: f.c, head: [f.x, PY + CHAR_H + 0.08, f.z] }))
      .concat(town.blds.map((b, bi) => ({ c: b.d.c, head: [b.x, PY + buildingParts(TOWN[bi][0]).top + 0.1, b.z] })));
    ctx.globalCompositeOperation = 'lighter';
    ents.forEach((e, i) => {
      const head = e.head, node = [head[0] * 0.85, head[1] + (Y3 + E3 - head[1]) * 0.4, head[2] * 0.85];
      this.line(V, head, lerp3(head, node, g1), e.c, 0.8 * alpha, 1);
      this.dot(V, node, e.c, g1 * alpha, 0.24);
      [0, 1].forEach(k => {
        const m = L3MODS[(i * 3 + k * 4 + 1) % L3MODS.length], end = [m.x, Y3 + 0.1 + E3 - m.h / 2, m.z];
        const mid = [(node[0] + end[0]) / 2 + (k - 0.5) * 0.6, node[1] + (end[1] - node[1]) * 0.55, (node[2] + end[2]) / 2];
        this.line(V, node, lerp3(node, mid, ga), m.c, 0.65 * alpha, 1);
        this.line(V, mid, lerp3(mid, end, gb), m.c, 0.5 * alpha, 1);
        this.dot(V, mid, m.c, ga * alpha, 0.24);
        if (g >= 1) {   // a pulse travelling up this branch
          const u = (t * 0.45 + hash(i * 3.7) + k * 0.5) % 1;
          const pos = u < 0.4 ? lerp3(head, node, u / 0.4) : u < 0.7 ? lerp3(node, mid, (u - 0.4) / 0.3) : lerp3(mid, end, (u - 0.7) / 0.3);
          this.dot(V, pos, m.c, (0.5 + 0.5 * Math.sin(t * 2 + i)) * alpha, 0.3);
        }
      });
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  layer3(V, r3, f3) {
    const { ctx, t, E3 } = V, Yb = Y3 + 0.1 + E3;
    const evo = (t % 7) / 7, bump = evo < 0.16 ? Math.sin(Math.PI * evo / 0.16) : 0;   // the institutions module evolves every 7 s
    ctx.globalCompositeOperation = 'lighter';
    [2.0, 2.32].forEach((rr, k) => {
      const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU; pts.push([Math.cos(a) * rr, Yb, Math.sin(a) * rr]); }
      this.poly(V, pts, k ? TEAL : ICE, clamp(r3 / 0.3) * 0.55 * f3, 1);
    });
    ctx.globalCompositeOperation = 'source-over';
    // modules, far to near
    const mods = L3MODS.map((m, mi) => ({ m, mi, k: clamp((r3 - mi * 0.045) / 0.4) })).filter(o => o.k > 0)
      .map(o => ({ ...o, d: dot(sub([o.m.x, Yb, o.m.z], V.cam.pos), V.cam.f) })).sort((a, b) => b.d - a.d);
    for (const { m, mi, k } of mods) {
      const e = ease(k), y = Yb - (1 - e) * 1.1, inst = mi === 7, sc = inst ? 1 + bump * 0.28 : 1, r = m.r * sc, h = m.h * sc;
      const col = inst ? mix(VIOLET, PINK, bump) : m.c, flash = inst && bump > 0.9 ? 1 : 0;
      const ring = yy => Array.from({ length: 7 }, (_, i) => { const a = i / 6 * TAU + Math.PI / 6; return [m.x + Math.cos(a) * r, yy, m.z + Math.sin(a) * r]; });
      const top = ring(y + h / 2), bot = ring(y - h / 2), tp = top.map(q => V.cam.project(q)), bp = bot.map(q => V.cam.project(q));
      if (tp.some(q => !q) || bp.some(q => !q)) continue;
      // body: tinted fill of the side faces and the lid, then the edges
      ctx.fillStyle = rgba(mul(col, 0.16), 0.92 * k * (0.12 + 0.88 * f3));
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(bp[i].x, bp[i].y); ctx.lineTo(bp[i + 1].x, bp[i + 1].y); ctx.lineTo(tp[i + 1].x, tp[i + 1].y); ctx.lineTo(tp[i].x, tp[i].y); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); tp.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(col, (0.05 + flash * 0.3) * k * f3); ctx.fill();
      const ea = Math.min(1, 0.55 + flash * 0.6) * k * f3;
      this.poly(V, top, col, ea, 1.2); this.poly(V, bot, col, ea * 0.7, 1);
      for (let i = 0; i < 6; i++) this.line(V, top[i], bot[i], col, ea * 0.8, 1);
      // a live ring of bars around each module
      for (let q = 0; q < 8; q++) {
        const a = q / 8 * TAU + 0.2, rr = r + 0.2, base = [m.x + Math.cos(a) * rr, y - h / 2, m.z + Math.sin(a) * rr];
        const hb = (0.08 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * (1.1 + q * 0.37) + mi * 2.1 + q), 2) * (1 + flash)) * (mi === 0 ? 1.4 : 1) * e;
        const B0 = V.cam.project(base);
        this.line(V, base, add(base, [0, Math.max(0.001, hb + h * 0.8), 0]), col, clamp((r3 - 0.1) / 0.3) * 0.8 * f3, Math.max(1, 0.07 * (B0 ? B0.s : 0)));
      }
      ctx.globalCompositeOperation = 'source-over';
      this.word(V, m.n, col, r * 0.475, [m.x, y + h / 2 + 0.55, m.z], k * (0.15 + 0.85 * f3));
    }
    // data pipes between modules, drawn out in order, with packets once complete
    ctx.globalCompositeOperation = 'lighter';
    L3PIPES.forEach(([ia, ib, c, bidir], j) => {
      const A = L3MODS[ia], B = L3MODS[ib], a = [A.x, Yb + A.h / 2, A.z], b = [B.x, Yb + B.h / 2, B.z];
      const dir = norm([b[0] - a[0], 0, b[2] - a[2]]), a2 = add(a, mul(dir, A.r * 0.8)), b2 = add(b, mul(dir, -B.r * 0.8));
      const mid = mul(add(a2, b2), 0.5); mid[1] += 0.45 + Math.hypot(...sub(b2, a2)) * 0.14;
      const k = clamp((r3 - 0.35 - j * 0.01) / 0.3);
      if (k <= 0) return;
      const pts = []; for (let i = 0; i <= Math.ceil(k * 40); i++) pts.push(bez(a2, mid, b2, Math.min(1, i / 40)));
      this.poly(V, pts, c, 0.6 * k * f3, 1);
      const pa = clamp((r3 - 0.65) / 0.25) * f3;
      if (pa > 0) for (let q = 0; q < 14; q++) {
        const sp = 0.14 + hash(j * 41 + q) * 0.2, dirq = bidir && q % 2 ? -1 : 1, u = fract(hash(j * 17 + q * 3) + sp * V.t * dirq);
        for (let tail = 0; tail < 3; tail++) this.dot(V, bez(a2, mid, b2, clamp(u - tail * 0.025 * dirq)), mul(c, tail ? (tail === 1 ? 0.45 : 0.18) : 1), pa, 0.4, 1.6);
      }
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  layer4(V, r4, f4, conv, tight) {
    const { ctx, t, cam, E4 } = V, AC = [-0.6, Y4 + 1.7 + E4, 0];
    // the armillary and the real-data chart turn to face the camera
    const faceYaw = c => Math.atan2(cam.pos[0] - c[0], cam.pos[2] - c[2]);
    const yawA = faceYaw(AC), k1 = 1 - conv;
    ctx.globalCompositeOperation = 'lighter';
    ARM.forEach((r, ri) => {
      const k = clamp((r4 - ri * 0.12) / 0.5), sc = 0.6 + 0.4 * ease(k);
      // Euler YXZ on a torus in the xy-plane, then the billboard turn about y
      const rx = Math.PI / 2 + r.tilt[0] * k1, ry = t * r.spin * k1 + t * 0.5 * conv, rz = r.tilt[2] * k1;
      const M = v => add(rotY(rotY(rotX(rotZ(mul(v, sc), rz), rx), ry), yawA), AC);
      const pts = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU; pts.push(M([Math.cos(a) * AR_R, Math.sin(a) * AR_R, 0])); }
      ctx.shadowColor = rgba(r.c, 0.9); ctx.shadowBlur = 8;
      this.poly(V, pts, r.c, k * (0.55 + 0.45 * conv) * f4, 2.2);
      ctx.shadowBlur = 0;
      const ang = hash(ri * 9.1) * TAU + t * (0.9 + ri * 0.35 * k1);
      for (let b = 0; b < 3; b++) { const a = ang + b / 3 * TAU; this.dot(V, M([Math.cos(a) * AR_R, Math.sin(a) * AR_R, 0]), r.c, r4 * f4, 0.42); }
      ctx.globalCompositeOperation = 'source-over';
      const la = 0.8 + ri * 2.1;
      this.tag(V, r.n, r.c, 0.27, M([Math.cos(la) * (AR_R + 0.35), Math.sin(la) * (AR_R + 0.35), 0]), k * (0.15 + 0.85 * f4));
      ctx.globalCompositeOperation = 'lighter';
    });
    this.dot(V, AC, WHITE, r4 * f4 * (0.25 + 0.75 * conv) * (0.85 + 0.15 * Math.sin(t * 3)), 0.6 + 1.1 * conv, 2);
    // real data, and the simulated curve that learns to fit it
    const CC = [RDX + RDW / 2, Y4 + E4, -0.4], yawC = faceYaw(CC), C = v => add(rotY(sub(v, CC), yawC), CC);
    const ba = clamp((r4 - 0.3) / 0.5) * 0.35 * f4, la = clamp((r4 - 0.4) / 0.5) * 0.9 * f4;
    SERIES.forEach((hgt, i) => {
      const x = RDX + i / (RDN - 1) * RDW, bw = RDW / RDN * 0.62, A = C([x - bw / 2, Y4 + E4, -0.4]), B = C([x + bw / 2, Y4 + E4, -0.4]);
      const quad = [A, B, add(B, [0, hgt, 0]), add(A, [0, hgt, 0])].map(q => cam.project(q));
      if (quad.some(q => !q)) return;
      ctx.fillStyle = rgba(GOLD, ba * 1.6); ctx.beginPath(); quad.forEach((q, j) => j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.fill();
    });
    const curve = fn => Array.from({ length: 48 }, (_, i) => {
      const u = i / 47 * (RDN - 1), i0 = Math.min(RDN - 2, Math.floor(u)), w = u - i0;
      return C([RDX + u / (RDN - 1) * RDW, Y4 + E4 + 0.12 + fn(SERIES[i0] + (SERIES[i0 + 1] - SERIES[i0]) * w, u), -0.4]);
    });
    this.poly(V, curve(h => h), GOLD, la, 1.6);
    this.poly(V, curve((h, u) => h + (1 - conv) * (0.45 * Math.sin(u * 1.3 + t * 0.6) - 0.15)), ICE, la, 1.6);
    // calibration pipe from the data into the armillary
    const ca = [RDX + 0.2, Y4 + E4 + 1.5, -0.4], cb = add(AC, [AR_R * 0.7, 0, 0]), cm = mul(add(ca, cb), 0.5); cm[1] += 0.6;
    const cpts = []; for (let i = 0; i <= 40; i++) cpts.push(bez(ca, cm, cb, i / 40));
    this.poly(V, cpts, GOLD, r4 * 0.35 * f4, 1);
    const fa = clamp((r4 - 0.5) / 0.4) * f4;
    for (let q = 0; q < 7; q++) { const u = fract(hash(q * 5.3) + (0.14 + hash(q * 2.9) * 0.2) * t); this.dot(V, bez(ca, cm, cb, u), GOLD, fa, 0.34); }
    // risers from L3 up into L4, shown once the layer gaps close
    this.riser(V, [0, Y3 + 0.4 + V.E3, 0], [0, Y4 + E4, 0], ICE, 5, 0.26, 0, r4 * 0.9 * f4 * tight);
    const inst = L3MODS[7];
    this.riser(V, [inst.x, Y3 + 0.3 + V.E3, inst.z], [inst.x, Y4 + E4, inst.z], VIOLET, 5, 0.26, 1, r4 * 0.9 * f4 * tight);
    ctx.globalCompositeOperation = 'source-over';
    const ta = lab4(clamp((r4 - 0.4) / 0.5), f4);
    this.tag(V, 'DATA-DRIVEN GENERATIVE EQUILIBRIUM', WHITE, 0.27, [AC[0], AC[1] - AR_R - 0.45, AC[2]], ta * (0.5 + 0.5 * conv));
    this.tag(V, 'FIXED POINT', ICE, 0.22, [AC[0], AC[1] - AR_R - 0.78, AC[2]], ta * (0.5 + 0.5 * conv) * 0.85);
    this.tag(V, 'REAL DATA · CALIBRATION', GOLD, 0.28, C([RDX + RDW / 2, Y4 + E4 + 2.7, -0.4]), ta);
  }

  // L1 in l1C coordinates → world: chest + S1·Rʏ(yaw)·(sIn·((-2.2, -1.8, 0) + Rʏ(sway)·v))
  layer1(V, chest, yaw, sIn, Lc, mg, p) {
    const { ctx, t } = V, sway = Math.sin(t * 0.25) * 0.08, l1 = this.l1;
    const M = v => add(chest, mul(rotY(mul(add([-2.2, -1.8, 0], rotY(v, sway)), sIn), yaw), S1));
    const S = S1 * sIn;
    if (Lc > 0.005) {
      // transformer blocks: dark machined slabs with ice edges
      for (const y of BLK) {
        const c = [[-1.3, -0.15, -0.9], [1.3, -0.15, -0.9], [1.3, 0.15, -0.9], [-1.3, 0.15, -0.9], [-1.3, -0.15, 0.9], [1.3, -0.15, 0.9], [1.3, 0.15, 0.9], [-1.3, 0.15, 0.9]].map(q => M(add(q, [0, y, 0])));
        const pr = c.map(q => V.cam.project(q));
        if (pr.every(q => q)) {
          ctx.fillStyle = rgba([34, 48, 68], Lc * 0.85);
          for (const f of [[4, 5, 6, 7], [3, 2, 6, 7], [1, 2, 6, 5], [0, 3, 7, 4]]) { ctx.beginPath(); f.forEach((i, j) => j ? ctx.lineTo(pr[i].x, pr[i].y) : ctx.moveTo(pr[i].x, pr[i].y)); ctx.closePath(); ctx.fill(); }
        }
        ctx.globalCompositeOperation = 'lighter';
        for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) this.line(V, c[a], c[b], ICE, 0.85 * Lc, 1);
        this.line(V, M([-1.1, y, 0.905]), M([1.1, y, 0.905]), BLK.indexOf(y) % 2 ? VIOLET : ICE, 0.9 * Lc, 2);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, z] of [[-1.2, -0.82], [1.2, -0.82], [-1.2, 0.82], [1.2, 0.82]]) this.line(V, M([x, -0.05, z]), M([x, 3.35, z]), [80, 100, 130], Lc, 1);
      // attention heads: small spinning rings on top of each block
      l1.heads.forEach((h, i) => {
        const a1 = t * h.sp, a2 = Math.sin(t * 0.7 + i) * 0.4, pts = [];
        for (let q = 0; q <= 20; q++) { const a = q / 20 * TAU; let v = [Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0]; v = rotZ(v, a2); v = h.ax ? rotX(v, a1) : rotY(v, a1); pts.push(M(add(h.p, v))); }
        this.poly(V, pts, h.c, 0.9 * Lc, 1.2);
      });
      // the residual stream, with tokens riding up through the blocks
      this.line(V, M([0, -0.8, 0]), M([0, 4.3, 0]), ICE, 0.55 * Lc, 1);
      for (let q = 0; q < 10; q++) { const u = fract(q / 10 + t * 0.9 * 0.24); this.dot(V, M([0, -0.8 + 5.1 * u, 0]), ICE, Lc, 0.3 * S, 2); }
      // RL circuits beside it, wired to every block
      for (const [a, b, c] of l1.segs) this.line(V, M(a), M(b), c, 0.95 * Lc, 1);
      for (const n of l1.nodes) this.dot(V, M(n), GREEN, Lc, 0.26 * S, 1.6);
      l1.bridges.forEach((b, k) => {
        const pts = []; for (let i = 0; i <= 20; i++) pts.push(M(bez(b.a, b.m, b.b, i / 20)));
        this.poly(V, pts, b.c, 0.45 * Lc, 1);
        for (let q = 0; q < 2; q++) { const u = fract(hash(k * 7 + q) + (q % 2 ? -1 : 1) * 0.3 * t); this.dot(V, M(bez(b.a, b.m, b.b, u)), b.c, Lc, 0.34 * S); }
      });
      l1.paths.forEach((pp, k) => {
        const u = fract(hash(k * 3.3) + 0.3 * 0.55 * t), n = pp.pts.length - 1, f = u * n, i0 = Math.min(n - 1, Math.floor(f));
        this.dot(V, M(lerp3(pp.pts[i0], pp.pts[i0 + 1], f - i0)), pp.c, Lc, 0.34 * S);
      });
      this.dot(V, M(SOMA), [157, 255, 208], Lc * (0.75 + 0.25 * Math.sin(t * 3)), 1.1 * S, 1.8);
      // attention arcs between tokens
      const tokPos = l1.tokens.map(tk => {
        const pos = tk.k0 + tk.sp * t, cyc = Math.floor(pos), k = pos - cyc, path = tokenPath(tk.i, cyc);
        const seg = k * (path.length - 1), i0 = Math.min(path.length - 2, Math.floor(seg));
        return { p: lerp3(path[i0], path[i0 + 1], sstep(seg - i0)), fade: Math.min(1, k * 8, (1 - k) * 6), w: WORDS[tk.i % WORDS.length], c: tk.i % 4 === 0 ? WHITE : ICE };
      });
      for (let i = 0; i < 8; i++) {
        const dur = 1.2 + hash(i * 1.9), pos = hash(i * 4.4) + t / dur, cyc = Math.floor(pos), life = pos - cyc;
        const a = Math.floor(hash(i * 5 + cyc * 1.7) * 10); let b = Math.floor(hash(i * 9 + cyc * 2.3) * 10); if (b === a) b = (a + 1) % 10;
        const A = tokPos[a], B = tokPos[b], f = Math.sin(Math.PI * life) * Math.min(A.fade, B.fade), lift = 0.35 + Math.hypot(...sub(A.p, B.p)) * 0.2;
        const pts = []; for (let q = 0; q <= 14; q++) { const u = q / 14; pts.push(M(add(lerp3(A.p, B.p, u), [0, 0, Math.sin(Math.PI * u) * lift]))); }
        this.poly(V, pts, i % 3 === 0 ? WHITE : ICE, f * Lc, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      tokPos.forEach(tk => this.tag(V, tk.w, tk.c, 0.26 * S, M(tk.p), Lc * tk.fade));
      [['LLM · TRANSFORMER', ICE, [0, 4.6, 0]], ['RL · REWARD CIRCUITS', GREEN, [RX, 4.6, 0]], ['ACTION', GREEN, [RX + 2.5, 2.9, 0.6]], ['REWARD', GREEN, [RX + 2.2, 0.4, -0.6]]]
        .forEach(([w, c, q]) => this.tag(V, w, c, 0.3 * S, M(q), Lc));
      this.tag(V, 'L1 · INTELLIGENCE FOUNDATION · INSIDE EVERY AGENT', ICE, 0.36 * S, M([RX / 2, 5.5, 0]), clamp((0.12 - p) / 0.05) * clamp(p / 0.02 + 0.3));
    }
    // the orb everything folds into; it keeps glowing faintly in the agent's chest
    const orbA = mg * (1 - 0.55 * clamp((p - 0.2) / 0.08));
    if (orbA > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      this.dot(V, chest, [207, 238, 255], orbA, (1.2 + 1.6 * Math.sin(Math.PI * clamp(mg)) + 0.15 * Math.sin(t * 4)) * S1, 1.6);
      const rs = (0.9 + 0.25 * Math.sin(t * 2)) * S1, pts = [];
      for (let q = 0; q <= 32; q++) { const a = q / 32 * TAU; pts.push(add(chest, rotY(rotX([Math.cos(a) * rs, Math.sin(a) * rs, 0], t * 1.3), t * 0.9))); }
      this.poly(V, pts, GREEN, orbA * 0.8, 1.5);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // "ECONOMIC WORLD MODEL ·" turning around the top and bottom of the model (r = 9.24)
  nameRing(V, y, offset, alpha) {
    const { ctx } = V, text = 'ECONOMIC WORLD MODEL  ·  ', n = text.length * 6, R = 9.24;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(190,230,255,.95)'; ctx.shadowColor = 'rgba(143,214,255,.9)'; ctx.shadowBlur = 6;
    for (let i = 0; i < n; i++) {
      const ch = text[i % text.length];
      if (ch === ' ') continue;
      const a = i / n * TAU + offset, pos = [Math.sin(a) * R, y, Math.cos(a) * R], nrm = [Math.sin(a), 0, Math.cos(a)];
      if (dot(nrm, sub(V.cam.pos, pos)) <= 0) continue;
      this.glyph(V, ch, pos, [Math.cos(a), 0, -Math.sin(a)], 0.5, `700 100px ${FONT.display}`);
    }
    ctx.restore();
  }
  // one upright letter on a cylinder: its x axis follows the tangent, its y axis is world up
  glyph(V, ch, pos, tangent, height, font, sx = 1) {
    const q = V.cam.project(pos), qx = V.cam.project(add(pos, tangent)), qy = V.cam.project(add(pos, [0, 1, 0]));
    if (!q || !qx || !qy) return;
    const k = height / 100, { ctx } = V;
    ctx.save();
    ctx.transform((qx.x - q.x) * k * sx, (qx.y - q.y) * k * sx, -(qy.x - q.x) * k, -(qy.y - q.y) * k, q.x, q.y);
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
  // the outer layer: tall narrow letters on a gently tilted ring well clear of the model
  lettering(V, alpha, scale) {
    const { ctx, t } = V, RR = 18.5, N = RING_TEXT.length + 2, spin = -t * 0.05;
    const M = v => add(mul(rotZ(rotX(v, 0.1), -0.05), scale), [0, RING_Y, 0]);
    const letters = [];
    for (let i = 0; i < RING_TEXT.length; i++) {
      if (RING_TEXT[i] === ' ') continue;
      const a = (0.5 - 0.465 + (i + 0.5) / N * 0.93) * TAU + spin;
      const pos = M([Math.sin(a) * RR, 0, Math.cos(a) * RR]), nrm = norm(sub(M([Math.sin(a), 0, Math.cos(a)]), M([0, 0, 0])));
      if (dot(nrm, sub(V.cam.pos, pos)) <= 0) continue;   // front faces only, as on the site
      letters.push({ ch: RING_TEXT[i], a, pos, tan: sub(M([Math.cos(a), 0, -Math.sin(a)]), M([0, 0, 0])), d: dot(sub(pos, V.cam.pos), V.cam.f) });
    }
    letters.sort((p, q) => q.d - p.d);
    ctx.save();
    for (const L of letters) {
      // stacked copies set slightly inward and darker give the letters depth
      for (let k = 3; k >= 0; k--) {
        const inward = mul(norm([L.pos[0], 0, L.pos[2]]), -k * 0.18);
        ctx.globalAlpha = alpha * (k === 0 ? 1 : 0.9);
        ctx.fillStyle = k === 0 ? '#e9f6ff' : `rgb(${[40, 60, 82].map(v => v - k * 6).join(',')})`;
        ctx.shadowColor = k === 0 ? 'rgba(143,214,255,.9)' : 'rgba(0,0,0,0)'; ctx.shadowBlur = k === 0 ? 14 : 0;
        this.glyph(V, L.ch, add(L.pos, inward), L.tan, 4.8 * 0.95, `600 100px ${FONT.display}`, 0.62);
      }
    }
    ctx.restore();
  }
  // now and then your agent flies in from the lettering and splashes onto the town
  comet(V, alpha, scale) {
    const { ctx, t } = V, period = 5.7, n = Math.floor((t - 1.5) / period);
    if (n < 0) return;
    const k = (t - 1.5 - n * period) / 2.2, col = [GREEN, TEAL, VIOLET, ICE, GOLD][Math.floor(hash(n * 3.1) * 5)];
    const ang = hash(n * 7.7) * TAU, a = add(mul(rotZ(rotX([Math.cos(ang) * 18.5, (hash(n * 1.3) - 0.5) * 4.8 * 0.6, Math.sin(ang) * 18.5], 0.1), -0.05), scale), [0, RING_Y, 0]);
    const b = [(hash(n * 2.9) - 0.5) * 5, PY + 0.4, (hash(n * 4.1) - 0.5) * 5], m = mul(add(a, b), 0.5); m[1] += 4.5;
    ctx.globalCompositeOperation = 'lighter';
    if (k < 1) for (let q = 0; q < 12; q++) {
      const u = k - q * 0.022;
      if (u <= 0) break;
      this.dot(V, bez(a, m, b, Math.min(1, u)), q === 0 ? WHITE : col, alpha * Math.pow(1 - q / 12, 1.5), 0.5);
    } else {
      const sp = Math.max(0, 1 - (k - 1) * 2.2 * 0.9), pts = [];
      for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU, r = 0.2 + (1 - sp) * 1.6; pts.push([b[0] + Math.cos(an) * r, b[1], b[2] + Math.sin(an) * r]); }
      this.poly(V, pts, GOLD, sp * 0.8 * alpha, 1.5);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- the page's left column: the model's layers, highlighted as the camera visits them ---------- */
  panel(ctx, p) {
    const active = p < 0.19 ? 0 : p < 0.45 ? 1 : p < 0.55 ? 2 : p < 0.76 ? 3 : 4;
    const shade = ctx.createLinearGradient(0, 0, 520, 0);
    shade.addColorStop(0, 'rgba(5,6,8,.85)'); shade.addColorStop(1, 'rgba(5,6,8,0)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, 520, H);
    ctx.font = `500 11px ${FONT.mono}`; spacing(ctx, 2.6); ctx.fillStyle = 'rgba(238,242,238,.6)'; ctx.fillText('THE MODEL', 32, 60); spacing(ctx, 0);
    ctx.font = `700 40px ${FONT.display}`; spacing(ctx, -1); ctx.fillStyle = '#eef2ee'; ctx.fillText('Economic', 32, 106);
    ctx.fillText('World', 32, 147); const ww = ctx.measureText('World ').width; ctx.fillStyle = '#8fd6ff'; ctx.fillText('Model', 32 + ww, 147); spacing(ctx, 0);
    let y = 176;
    const top = y;
    LAYERS.forEach(([code, title, desc], i) => {
      const on = i === active, done = i < active || active === 4;
      ctx.font = `500 10px ${FONT.mono}`; spacing(ctx, 1.5); ctx.fillStyle = on ? 'rgba(238,242,238,.75)' : 'rgba(238,242,238,.32)'; ctx.fillText(code, 68, y + 14); spacing(ctx, 0);
      ctx.font = `600 ${on ? 19 : 18}px ${FONT.display}`; ctx.fillStyle = on ? '#f2f6f2' : done ? 'rgba(238,242,238,.82)' : 'rgba(238,242,238,.36)';
      title.split('\n').forEach((l, j) => ctx.fillText(l, 68, y + 40 + j * 23));
      y += 40 + (title.split('\n').length - 1) * 23;
      if (on) { paragraph13(ctx, desc, 68, y + 25); y += 25 + desc.length * 17; }
      y += 30;
    });
    // the progress rail
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(34, top, 2, y - top - 26);
    const g = ctx.createLinearGradient(0, top, 0, y); g.addColorStop(0, '#8fd6ff'); g.addColorStop(1, '#b06bff');
    ctx.fillStyle = g; ctx.fillRect(34, top, 2, (y - top - 26) * clamp(p / 0.76));
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(32, y - 8, 290, 1);
    ctx.font = `500 10px ${FONT.mono}`; spacing(ctx, 2.2); ctx.fillStyle = 'rgba(238,242,238,.4)'; ctx.fillText('OUTER LAYER · AROUND THE MODEL', 32, y + 22);
    const on = active === 4;
    if (on) { ctx.fillStyle = '#b06bff'; ctx.fillRect(32, y + 40, 2, 108); }
    ctx.fillStyle = on ? '#8fd6ff' : 'rgba(143,214,255,.3)'; ctx.fillText('ECONOMIC WORLD MODEL', 45, y + 56); spacing(ctx, 0);
    ctx.font = `600 17px ${FONT.display}`; ctx.fillStyle = on ? '#f2f6f2' : 'rgba(238,242,238,.36)'; ctx.fillText('Economic World Model Challenge', 45, y + 80);
    if (on) paragraph13(ctx, ['Your agent steps into this world from outside. Each', 'track is a door into a different world, and more are on', 'the way.'], 45, y + 104);
  }
}

const lab4 = (r, f) => r * (0.15 + 0.85 * f);
const fract = x => x - Math.floor(x);
function paragraph13(ctx, lines, x, y) {
  ctx.font = `400 12.5px ${FONT.body}`; ctx.fillStyle = 'rgba(238,242,238,.62)';
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * 17));
}
