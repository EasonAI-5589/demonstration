// Scene 05: SUBS → LOCAL // $300/mo in subscriptions → $0/mo is the target
// Four acts on a 20 s loop: 01 sonnet researches → 02 jev filters → 03 rea maps → 04 opus builds.
// Geometry and palette are measured from the 1080×1350 reference keyframes (t≈6.0 s ≙ "02 JEV FILTERS",
// t≈15.5 s ≙ "04 OPUS BUILDS"). Every frame is a pure function of t, so timeline scrubbing is exact.
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = 'Menlo, "DejaVu Sans Mono", "SF Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';
const DEG = Math.PI / 180;

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - (1 - k) ** 3;
const easeInOut = k => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
const span = (t, t0, dur) => clamp((t - t0) / dur);
const settle = k => (k >= 1 ? 1 : 1 - (1 + 7 * k) * Math.exp(-7 * k));
const group = n => String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixRgb = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const ch = v => Math.round(clamp(v, 0, 255));
const rgba = (c, a = 1) => `rgba(${ch(c[0])},${ch(c[1])},${ch(c[2])},${clamp(a).toFixed(3)})`;

function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

function invTrack(keys, v) {
  if (v <= keys[0][1]) return keys[0][0];
  for (let i = 1; i < keys.length; i++) {
    if (v <= keys[i][1]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v1 === v0 ? t0 : t0 + ((t1 - t0) * (v - v0)) / (v1 - v0);
    }
  }
  return keys[keys.length - 1][0];
}

// ── Timeline ────────────────────────────────────────────────────────────────
const P2 = 4.0;
const P3 = 9.0;
const P4 = 12.5;
const PHASE_LABELS = ['01 SONNET RESEARCHES', '02 JEV FILTERS', '03 REA MAPS', '04 OPUS BUILDS'];
const PHASE_STATES = ['researching', 'filtering', 'mapping', 'building'];
const PHASE_STARTS = [0, P2, P3, P4];

const TRACKS = {
  signals: [[0, 0], [0.5, 30], [4, 2600], [6, 5316], [7.9, 8940]],
  jev: [[4.15, 0], [6, 3346], [8.75, 8940]],
  kept: [[4.15, 0], [6, 602], [8.75, 2768]],
  local: [[4.15, 0], [6, 20], [8.75, 79]],
  person: [[4.15, 0], [6, 16], [8.75, 64]],
  rea: [[9.25, 0], [12.2, 1284]],
  modules: [[9.3, 0], [11.6, 41]],
  functions: [[9.35, 0], [11.9, 312]],
  uiEvents: [[9.45, 0], [12, 88]],
  dataFlows: [[9.55, 0], [12.1, 27]],
  api: [[0, 0], [4, 0.02], [6, 0.05], [9, 0.09], [12.5, 1.12], [15.5, 5.49], [18.9, 10.42]],
  tests: [[12.6, 0], [15.5, 109], [19, 190]],
};

// ── Geometry (reference-frame pixels) ───────────────────────────────────────
const DOME = { cx: -120.5, cy: 649.4, r: 620 };
const STAGE_TOP = 148;
const STAGE_BOTTOM = 1037.5;
const ARC_TOP = Math.asin((150 - DOME.cy) / DOME.r);
const ARC_BOTTOM = Math.asin((STAGE_BOTTOM + 3 - DOME.cy) / DOME.r);
const arcX = y => DOME.cx + Math.sqrt(Math.max(0, DOME.r * DOME.r - (y - DOME.cy) ** 2));
const polar = (th, r) => [DOME.cx + Math.cos(th) * r, DOME.cy + Math.sin(th) * r];
const featureTheta = i => (-41.2 + i * 3.72) * DEG;
const LABEL_R = 597;
const VERDICT_R = 630;
const featureY = i => DOME.cy + Math.sin(featureTheta(i)) * DOME.r;
const rowY = i => 233 + 54 * i;
const LABEL_RIGHT = 1062;
const RING = { x: 759.5, y: 899 };
const PANEL_Y = 1069.5;
const PANEL_H = 264;
const PANEL_W = 170;
const panelX = i => 15 + 175.8 * i;

// ── Data ────────────────────────────────────────────────────────────────────
const CALL_CHAIN = [
  ['ui.click("export")', 33.5, 249.5],
  ['ExportDialog.open', 38, 305.5],
  ['export_pdf()', 42, 360.5],
  ['layout.paginate', 44, 415.5],
  ['render_page()', 46, 471.5],
  ['font.embed()', 45, 527.5],
  ['image.compress', 43, 582.5],
  ['pdf.write()', 39, 638.5],
  ['fs.save()', 35, 694],
  ['toast("done")', 30, 749],
];

const FEATURES = [
  ['vector export', '9x/wk', 'local'],
  ['site audit', '4x/wk', 'local'],
  ['auto captions', '12x/wk', 'local'],
  ['post queue', '21x/wk', 'local'],
  ['drip emails', '3x/wk', 'local'],
  ['pdf merge', '6x/wk', 'local'],
  ['team seats', '0x/wk', 'unused'],
  ['invoice pdf', '2x/wk', 'local'],
  ['screen capture', '8x/wk', 'local'],
  ['vpn tunnel', 'daily', 'infra'],
  ['batch upscale', '5x/wk', 'local'],
  ['keyword gaps', '3x/wk', 'local'],
  ['cloud backup', 'daily', 'infra'],
  ['speaker labels', '7x/wk', 'local'],
  ['autofill vault', 'daily', 'keep'],
  ['layer masks', '11x/wk', 'local'],
  ['ai credits', '0x/wk', 'unused'],
  ['link page', '1x/wk', 'local'],
  ['note sync', '14x/wk', 'local'],
  ['brand kit', '4x/wk', 'local'],
];
const VERDICT_COLOR = { local: '#bf5c8f', unused: '#716380', infra: '#716380', keep: '#84759c' };
const USAGE = [9, 4, 12, 21, 3, 6, 0, 2, 8, 7, 5, 3, 7, 7, 7, 11, 0, 1, 14, 4];
const VERDICT_STREAK = { local: hex('#f06ab8'), unused: hex('#8a7aa6'), infra: hex('#7d8bb0'), keep: hex('#a685f0') };
const CYAN_FEATURES = new Set([10]);
const DECIDE_ORDER = [5, 6, 7, 8, 10, 16, 14, 13, 12, 11, 9, 4, 3, 2, 1, 0, 15, 17, 18, 19];
const DECIDE_T0 = 4.274;
const DECIDE_DT = 0.22;

const SUBS = [
  { name: 'design suite', price: 55, beam: '#e57edb', box: '#f264eb' },
  { name: 'seo crawler', price: 49, beam: '#86cbec', box: '#f05dd9' },
  { name: 'transcription', price: 30, beam: '#e584cc', box: '#f25dca' },
  { name: 'social scheduler', price: 29, beam: '#a172e0', box: '#9457e9' },
  { name: 'email scheduler', price: 25, beam: '#90cbec', box: '#f0509e' },
  { name: 'pdf editor', price: 20, beam: '#e08de0', box: '#ee4fe2' },
  { name: 'invoice app', price: 19, beam: '#da5cd3', box: '#f150da' },
  { name: 'screen recorder', price: 15, beam: '#84c9e4', box: '#40c2f0' },
  { name: 'image upscaler', price: 12, beam: '#e282c6', box: '#ec4fab' },
  { name: 'vpn', price: 12, keep: 9, box: '#f25b99' },
  { name: 'note sync', price: 10, beam: '#9d6cd4', box: '#9150e8' },
  { name: 'cloud storage', price: 10, keep: 12, box: '#f260d1' },
  { name: 'link-in-bio', price: 9, beam: '#d65ebd', box: '#ea50c0' },
  { name: 'password manager', price: 5, keep: 14, box: '#f360ae' },
];
const GOLD = hex('#f6dd8e');
const KEEP_GRAY = hex('#5e4c6b');
const NEUTRAL = hex('#b6a1d6');
const BUILD_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12];
const GROW = { 5: 2.17, 10: 1.87, 12: 1.35 };
const BUILDS = BUILD_ROWS.map((row, k) => ({ row, start: 12.75 + k * 0.16, done: 13.6 + k * 0.5, grow: GROW[row] || 1.4 }));
const BUILD_BY_ROW = Object.fromEntries(BUILDS.map(b => [b.row, b]));
// Diamond anchor x at t = 15.5 s and pitch, per building row (measured on the reference frame).
const DIAMONDS = { 0: [604, 86.5], 1: [582.5, 114], 2: [635, 135], 3: [696, 252], 4: [648, 112], 5: [653, 116], 6: [674, 121.5], 7: [562.5, 135], 8: [674, 117], 10: [626, 93], 12: [609, 103] };
// Two white leader lines hop between active builds; each slot = grow → connected (packets) → retract.
const LEADER_SLOT = 1.6;
const LEADERS = [
  { offset: 0, rows: [0, 6, 7, 10, 12], dx: -39, dy: -20, bend: 2 },
  { offset: 0.816, rows: [1, 8, 10, 12, 12], dx: 2.5, dy: 8, bend: 9 },
];
const SIDE_OFFSETS = [-14.5, -7, 6.5, 13.5, 21];

const SONNET_SOURCES = [['pricing pages', 62], ['reviews', 52], ['complaints', 43], ['changelogs', 31], ['docs', 24], ['your billing', 15]];
const JEV_BARS = [54, 42, 47.6, 51, 38, 56, 26.6, 55.6, 38.3, 51, 48.3, 42.6, 54.3, 31, 56.6];
const JEV_CYAN = new Set([2, 6, 10, 14]);
const DAG_NODES = [[84.7, 1113.7], [46.1, 1142], [85.4, 1142], [124.7, 1142], [32.1, 1170], [63.1, 1170], [85.4, 1170], [108.1, 1170], [138.7, 1170], [57.4, 1198], [113.7, 1198]];
const DAG_EDGES = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [3, 7], [3, 8], [5, 9], [6, 9], [6, 10], [7, 10]];
const DAG_REVEAL = [9.2, 9.6, 9.7, 9.8, 10.2, 10.3, 10.4, 10.5, 10.6, 11.0, 11.1];
const OPUS_TESTS = ['vector export', 'site audit', 'auto captions', 'post queue', 'drip emails', 'pdf merge', 'invoice pdf', 'screen capture', 'batch upscale', 'keyword gaps', 'speaker labels'];

// Console typography, calibrated against the reference's blur-invariant ink energy.
const UI = {
  title: '#cfc8d5',
  sub: '#857892',
  label: '#83768f',
  value: '#b4abbb',
  dim: '#7c6f8a',
  pending: '#4b3f58',
  labelSize: 8.8,
  valueSize: 9,
  bigSize: 22,
};
const C_DIM = '#796c88';
const C_KEY = '#b4528d';
const C_OBJ = '#4fa9bb';
const C_STR = '#c3a457';
const CODE = [
  [0, [['subs = ', C_DIM], ['sonnet', C_OBJ], ['.research(bill)', C_DIM]]],
  [0, [['for', C_KEY], [' f ', C_DIM], ['in', C_KEY], [' subs.used():', C_DIM]]],
  [1, [['v = ', C_DIM], ['jev', C_OBJ], ['.decide(f)', C_DIM]]],
  [1, [['if', C_KEY], [' v == ', C_DIM], ['"rebuild"', C_STR], [':', C_DIM]]],
  [2, [['queue.append(f)', C_DIM]]],
  [0, []],
  [0, [['for', C_KEY], [' f ', C_DIM], ['in', C_KEY], [' queue:', C_DIM]]],
  [1, [['ev = rea.trace(f.app)', C_DIM]]],
  [1, [['f.spec = ev.chain()', C_DIM]]],
  [0, []],
  [0, [['for', C_KEY], [' f ', C_DIM], ['in', C_KEY], [' queue:', C_DIM]]],
  [1, [['code = ', C_DIM], ['opus', C_OBJ], ['.build(f.spec)', C_DIM]]],
  [1, [['t = tests.observed(ev)', C_DIM]]],
  [1, [['assert', C_KEY], [' t.run(code).ok', C_DIM]]],
  [0, [['bill = ', C_DIM], ['300', C_STR], [' - saved()', C_DIM]]],
];
const CODE_CYCLES = [[[0], 0], [[1, 2, 3, 4], 3], [[6, 7, 8], 0], [[10, 11, 12, 13], 3]];

export class SubsTeardownScene {
  constructor() {
    this.duration = 20;
    this.decideAt = [];
    DECIDE_ORDER.forEach((f, k) => {
      this.decideAt[f] = DECIDE_T0 + k * DECIDE_DT;
    });
    this.revealAt = SUBS.map((_, i) => 4.56 + i * 0.4);
    this.keepAt = SUBS.map((s, i) => (s.keep === undefined ? Infinity : Math.max(this.decideAt[s.keep], this.revealAt[i] + 0.3)));
    this.rays = this.makeRays();
    this.particles = this.makeParticles();
    // Ambient starfield: uniform inside the dome, crowding toward the filter rim.
    this.stars = Array.from({ length: 300 }, (_, i) => {
      const rim = i < 120;
      const r = rim ? DOME.r - 6 - rand(i * 3.9) ** 1.6 * 60 : Math.sqrt(lerp(0.04, 0.86, rand(i * 2.3))) * DOME.r;
      const th = lerp(-60, 52, rand(i * 7.7)) * DEG;
      const [x, y] = polar(th, r);
      return { x, y, s: 1 + rand(i * 5.3) ** 3 * 1.6, a: 0.25 + rand(i * 1.9) * 0.45, tw: rand(i * 8.1) * 30, on: 0.3 + rand(i * 6.2) * 3.2 };
    }).filter(st => st.y > 160 && st.y < 1030 && st.x > -10);
    this.rails = this.makeRails();
    this.streaks = this.makeStreaks();
    this.sideLines = SUBS.map((_, i) => SIDE_OFFSETS.map((off, k) => ({
      off,
      reach: k === 4 ? 0.35 + rand(i * 13 + k) * 0.35 : 0.5 + rand(i * 7.3 + k * 3.1) * 0.62,
      cap: 14 + rand(i * 5.1 + k) * 18,
      phase: rand(i * 2.7 + k * 9.3) * Math.PI * 2,
    })));
    this.sphere = this.makeSphere(176);
    this.cloud = Array.from({ length: 46 }, (_, i) => {
      const u = rand(i * 3.3 + 1) * 2 - 1;
      const a = rand(i * 5.9 + 2) * Math.PI * 2;
      const r = 0.25 + Math.cbrt(rand(i * 8.1 + 3)) * 0.75;
      const s = Math.sqrt(1 - u * u);
      return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r, rand(i * 4.4)];
    });
  }

  // ── Precomputed motion data ───────────────────────────────────────────────
  // Fan rays: a sparse set during research/filtering (a few hero beams), densifying as REA maps the app.
  makeRays() {
    const rays = [];
    for (let i = 0; i < 150; i++) {
      const th = lerp(-55, 40, rand(i * 3.1 + 1)) * DEG;
      const early = i < 26;
      rays.push({
        th,
        r0: 100 + rand(i * 5.7) * 60,
        r1: DOME.r - 10 - rand(i * 2.3) * 40,
        a: early ? 0.02 + rand(i * 9.1) ** 2 * 0.06 : 0.035 + rand(i * 9.1) ** 2 * 0.13,
        late: !early,
        delay: rand(i * 6.6) * 1.6,
      });
    }
    // Hero beams: brighter, slowly sweeping searchlights from Sonnet's corner.
    rays.push({ th: -28 * DEG, r0: 60, r1: DOME.r - 30, a: 0.13, late: false, delay: 0.3, sweep: 0.5 });
    rays.push({ th: 8 * DEG, r0: 80, r1: DOME.r - 60, a: 0.07, late: false, delay: 1.1, sweep: -0.35 });
    return rays;
  }

  makeParticles() {
    const out = [];
    const N = 1100;
    for (let j = 0; j < N; j++) {
      const s = invTrack(TRACKS.signals, ((j + rand(j * 1.7)) / N) * 8940);
      const f = Math.floor(rand(j * 7.3) ** 1.25 * 20);
      const th = featureTheta(f) + (rand(j * 2.9) - 0.5) * 3.8 * DEG;
      const [ex, ey] = polar(th, DOME.r - 3 - rand(j * 6.1) ** 1.5 * 26);
      const y0 = lerp(165, 1030, rand(j * 4.7));
      const x0 = -14 + rand(j * 8.3) ** 1.35 * Math.max(30, arcX(y0) - 165);
      out.push({
        s,
        d: 1.4 + rand(j * 3.3) * 1.4,
        linger: 0.4 + rand(j * 5.9) * 1.8,
        x0,
        y0,
        ex,
        ey,
        size: 1.1 + rand(j * 9.7) ** 2 * 1.5,
        a: 0.5 + rand(j * 2.2) * 0.45,
        seed: rand(j * 6.6) * 40,
      });
    }
    return out;
  }

  makeRails() {
    const out = [];
    const N = 250;
    const lav = hex('#8a6db4');
    const pink = hex('#b264a8');
    const blue = hex('#6f7fc2');
    for (let i = 0; i < N; i++) {
      const y = lerp(158, 992, (i + rand(i * 1.3)) / N);
      const hue = rand(i * 6.1);
      out.push({
        y,
        len: 130 + rand(i * 2.1) ** 1.1 * 560,
        a: 0.08 + rand(i * 3.7) ** 1.4 * 0.3,
        w: rand(i * 4.9) < 0.35 ? 1.7 : 1.15,
        grow: lerp(1.2, 7.2, rand(i * 5.3)),
        col: hue < 0.6 ? lav : hue < 0.88 ? pink : blue,
        packet: rand(i * 8.8) < 0.3 ? { v: 0.12 + rand(i * 9.9) * 0.25, len: 18 + rand(i * 7.7) * 46, ph: rand(i * 2.6) } : null,
      });
    }
    return out;
  }

  // Filter comb: short bright stubs fray the arc edge, fewer long bars shoot out; density follows weekly usage.
  makeStreaks() {
    const out = [];
    for (let f = 0; f < 20; f++) {
      const weight = f < 8 ? 1 : f < 14 ? 0.7 : 0.45;
      const stubs = 2 + Math.round((5 + USAGE[f] * 0.35) * weight);
      const bars = Math.round((1 + USAGE[f] * 0.22) * weight);
      for (let k = 0; k < stubs + bars; k++) {
        const s = f * 97 + k * 13;
        const bar = k >= stubs;
        out.push({
          f,
          bar,
          dy: (rand(s + 1) - 0.5) * 38,
          L: bar ? (55 + rand(s + 2) ** 1.4 * 120) * (rand(s + 9) < 0.12 ? 1.6 : 1) : 4 + rand(s + 2) ** 1.2 * 24,
          w: bar || rand(s + 3) < 0.4 ? 2.3 : 1.5,
          bright: bar || rand(s + 4) < 0.7,
          violet: rand(s + 5) < 0.1,
          om: (bar ? 1.0 : 2.5) + rand(s + 6) * 2.6,
          ph: rand(s + 7) * Math.PI * 2,
          on: 1.6 + rand(s + 8) * 2.2 + (f > 13 ? 0.8 : 0),
        });
      }
    }
    // Fringe: tiny ticks where arriving signals touch the filter, spread along the whole rim.
    for (let k = 0; k < 130; k++) {
      const y = lerp(168, 1000, rand(k * 5.31 + 0.7));
      const f = clamp(Math.round((Math.asin((y - DOME.cy) / DOME.r) / DEG + 41.2) / 3.72), 0, 19);
      out.push({
        f,
        bar: false,
        dy: y - featureY(f),
        L: 2 + rand(k * 3.7 + 1) ** 1.5 * 10,
        w: 1.5,
        bright: true,
        violet: false,
        om: 3 + rand(k * 1.9) * 3,
        ph: rand(k * 2.2) * Math.PI * 2,
        on: 1.3 + rand(k * 4.4) * 2.6,
      });
    }
    return out;
  }

  makeSphere(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * 2.399963;
      pts.push([Math.cos(phi) * r, y, Math.sin(phi) * r]);
    }
    return pts;
  }

  // ── Text helpers ──────────────────────────────────────────────────────────
  font(ctx, size = 11, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#ece6f2', size = 11, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  // Letter-spaced text; runs = [[string, color], ...]. Returns the drawn width.
  spaced(ctx, runs, x, y, size, weight, spacing, align = 'left') {
    this.font(ctx, size, weight);
    ctx.textAlign = 'left';
    const glyphs = [];
    for (const [str, color] of runs) for (const ch of String(str)) glyphs.push([ch, color, ctx.measureText(ch).width]);
    const total = glyphs.reduce((sum, g) => sum + g[2], 0) + spacing * Math.max(0, glyphs.length - 1);
    let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
    for (const [ch, color, w] of glyphs) {
      ctx.fillStyle = color;
      ctx.fillText(ch, cx, y);
      cx += w + spacing;
    }
    return total;
  }

  runs(ctx, parts, x, y, size, weight = 400) {
    this.font(ctx, size, weight);
    ctx.textAlign = 'left';
    let cx = x;
    for (const [str, color] of parts) {
      ctx.fillStyle = color;
      ctx.fillText(str, cx, y);
      cx += ctx.measureText(str).width;
    }
    return cx - x;
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

  line(ctx, x0, y0, x1, y1, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  billAt(t) {
    let bill = 300;
    for (const b of BUILDS) bill -= SUBS[b.row].price * easeOut(span(t, b.done, 0.3));
    return bill;
  }

  rowColor(i, t) {
    const sub = SUBS[i];
    if (sub.keep !== undefined) return t >= this.keepAt[i] ? KEEP_GRAY : NEUTRAL;
    const b = BUILD_BY_ROW[i];
    let c = mixRgb(NEUTRAL, hex(sub.beam), span(t, b.start, 0.35));
    c = mixRgb(c, GOLD, span(t, b.done, 0.4));
    return c;
  }

  stateAt(t) {
    const phase = t < P2 ? 0 : t < P3 ? 1 : t < P4 ? 2 : 3;
    const done = BUILDS.filter(b => t >= b.done).length;
    const started = BUILDS.filter(b => t >= b.start).length;
    const lastDone = BUILDS[BUILDS.length - 1].done;
    let keepUsd = 0;
    SUBS.forEach((s, i) => {
      if (s.keep !== undefined) keepUsd += s.price * easeOut(span(t, this.keepAt[i], 0.3));
    });
    const bill = this.billAt(t);
    const doneFrac = BUILDS.reduce((sum, b) => sum + easeOut(span(t, b.done, 0.25)), 0) / BUILDS.length;
    return {
      t,
      phase,
      stateName: phase < 3 ? PHASE_STATES[phase] : t >= lastDone + 0.3 ? 'done' : 'building',
      signals: track(TRACKS.signals, t),
      jev: track(TRACKS.jev, t),
      kept: track(TRACKS.kept, t),
      local: track(TRACKS.local, t),
      person: track(TRACKS.person, t),
      rea: track(TRACKS.rea, t),
      api: track(TRACKS.api, t),
      tests: track(TRACKS.tests, t),
      done,
      started,
      doneFrac,
      bill,
      rebuiltUsd: 300 - bill,
      keepUsd,
    };
  }

  focusAt(t) {
    // JEV starburst: dwells on the feature being decided, then hops to the next one.
    const k = clamp(Math.floor((t - DECIDE_T0) / DECIDE_DT), 0, DECIDE_ORDER.length - 1);
    const local = clamp((t - DECIDE_T0 - k * DECIDE_DT) / DECIDE_DT);
    const from = featureTheta(DECIDE_ORDER[k]);
    const to = featureTheta(DECIDE_ORDER[Math.min(k + 1, DECIDE_ORDER.length - 1)]);
    const hop = t < DECIDE_T0 ? 0 : easeInOut(clamp((local - 0.76) / 0.24));
    return lerp(from, to, hop);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  render(ctx, state) {
    const t = clamp(Number(state.elapsed) || 0, 0, this.duration);
    const mo = state.reducedMotion ? 0.2 : 1;
    const S = this.stateAt(t);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.textBaseline = 'alphabetic';
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';

    this.drawBackground(ctx);
    this.drawHeader(ctx, S, t);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, STAGE_TOP, WIDTH, STAGE_BOTTOM - STAGE_TOP);
    ctx.clip();
    this.drawDome(ctx, t, mo);
    this.drawRails(ctx, t, mo);
    this.drawStreaks(ctx, t, mo);
    this.drawBundles(ctx, t, mo);
    this.drawArc(ctx, t, mo);
    this.drawFeatureLabels(ctx, t);
    this.drawJevFilter(ctx, t, mo);
    this.drawCallChain(ctx, t, mo);
    this.drawSubLabels(ctx, t);
    this.drawOpus(ctx, S, t, mo);
    this.drawSonnetBadge(ctx, t);
    ctx.restore();

    this.drawConsole(ctx, S, t, mo);
    ctx.restore();
  }

  // The backdrop is static: rasterize it once per device scale and blit it every frame.
  drawBackground(ctx) {
    const m = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
    const scale = m && Number.isFinite(m.a) && m.a > 0 ? m.a : 1;
    if (!this.bgCache || this.bgCache.scale !== scale) {
      let canvas = null;
      if (typeof OffscreenCanvas !== 'undefined') canvas = new OffscreenCanvas(Math.round(WIDTH * scale), Math.round(HEIGHT * scale));
      else if (typeof document !== 'undefined') {
        canvas = document.createElement('canvas');
        canvas.width = Math.round(WIDTH * scale);
        canvas.height = Math.round(HEIGHT * scale);
      }
      const c = canvas && canvas.getContext('2d');
      if (!c) {
        this.paintBackground(ctx);
        return;
      }
      c.setTransform(scale, 0, 0, scale, 0, 0);
      this.paintBackground(c);
      this.bgCache = { canvas, scale };
    }
    ctx.drawImage(this.bgCache.canvas, 0, 0, WIDTH, HEIGHT);
  }

  paintBackground(ctx) {
    ctx.fillStyle = '#1e1127';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const g = ctx.createLinearGradient(0, 45, 0, STAGE_BOTTOM);
    g.addColorStop(0, '#170c1e');
    g.addColorStop(0.16, '#190d21');
    g.addColorStop(0.5, '#21132c');
    g.addColorStop(1, '#1f1129');
    ctx.fillStyle = g;
    ctx.fillRect(0, 45, WIDTH, STAGE_BOTTOM - 45);

    const glow = ctx.createRadialGradient(430, 640, 20, 430, 640, 600);
    glow.addColorStop(0, 'rgba(66, 38, 92, 0.55)');
    glow.addColorStop(0.5, 'rgba(52, 30, 74, 0.3)');
    glow.addColorStop(1, 'rgba(40, 22, 58, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 140, WIDTH, STAGE_BOTTOM - 140);

    const edge = ctx.createLinearGradient(820, 0, WIDTH, 0);
    edge.addColorStop(0, 'rgba(10, 4, 16, 0)');
    edge.addColorStop(1, 'rgba(10, 4, 16, 0.28)');
    ctx.fillStyle = edge;
    ctx.fillRect(820, 45, WIDTH - 820, STAGE_BOTTOM - 45);

    ctx.fillStyle = '#0a0411';
    ctx.fillRect(0, 0, WIDTH, 44.5);
    ctx.fillStyle = '#271e2e';
    ctx.fillRect(0, 44.5, WIDTH, 1.6);
  }

  drawHeader(ctx, S, t) {
    this.spaced(ctx, [['SUBS ', '#ece6ee'], ['→', '#f06ab4'], [' LOCAL', '#ece6ee']], 17, 26.5, 16.5, 700, 1.9);

    for (const x of [247.2, 344.6, 422.2, 501.7, 588.2, 679.7, 750.3, 830.8]) {
      ctx.fillStyle = '#1d1523';
      ctx.fillRect(x, 7, 1, 33);
    }
    const metrics = [
      ['RUN', 'teardown-01', '#a39ca8', 256.6, 400],
      ['SIGNALS', group(S.signals), '#c97fa8', 354.1, 400],
      ['JEV CALLS', group(S.jev), '#c97fa8', 432.6, 400],
      ['REA TRACES', group(S.rea), '#a69cc4', 512.2, 400],
      ['OPUS BUILDS', String(S.started), '#74b8aa', 598.6, 400],
      ['API $', `$${S.api.toFixed(2)}`, '#76aec4', 690.1, 400],
      ['BILL /MO', `$${Math.round(S.bill)}`, '#c4ad84', 759.8, 700],
      ['STATE', S.stateName, '#cbbd93', 841.3, 700],
    ];
    for (const [label, value, color, x, weight] of metrics) {
      this.spaced(ctx, [[label, '#69606e']], x, 16.9, 9.2, 400, 0.1);
      this.text(ctx, value, x, 33.7, color, 12.55, weight);
    }

    this.roundRect(ctx, 970, 10.6, 96.5, 24, 2.5);
    ctx.fillStyle = '#f07ac8';
    ctx.fill();
    this.spaced(ctx, [['DEMO DATA', '#5a0f3f']], 1018.25, 26.7, 11, 700, 0.6, 'center');

    // Phase label types in at every act boundary.
    const label = PHASE_LABELS[S.phase];
    const typed = Math.max(1, Math.ceil(label.length * span(t, PHASE_STARTS[S.phase], 0.32)));
    const fullW = this.spaced(ctx, [[label.slice(0, typed), '#f38fca']], 17.5, 69.3, 15, 700, 1.55);
    if (typed < label.length) {
      ctx.fillStyle = 'rgba(243, 143, 202, 0.7)';
      ctx.fillRect(17.5 + fullW + 3, 58.5, 8, 12);
    }
    ctx.fillStyle = '#3b2b40';
    ctx.fillRect(16, 76.4, Math.max(150, fullW + 4), 1);

    this.text(ctx, '$300/mo in subscriptions → $0/mo is the target', 17, 102, '#ddd4e2', 20, 700);
    this.text(ctx, 'sonnet researches · jev filters · rea maps · opus 5.5 builds', 17.5, 122, '#807289', 12);
    this.spaced(ctx, [['DEMO DATA · SIMULATED NUMBERS · AUTHORIZED SOFTWARE ONLY', '#9c5888']], 17, 141, 11, 600, 0.3);
  }

  // ── Stage: dome, particles, arc ───────────────────────────────────────────
  drawDome(ctx, t, mo) {
    const boost = 0.8 + 0.25 * span(t, P3, 2.4);
    ctx.lineWidth = 1;
    for (const ray of this.rays) {
      let a = ray.a * (ray.sweep ? 1 : boost);
      a *= ray.late ? span(t, P3 + ray.delay, 1.1) : span(t, 0.2 + ray.delay, 1.2);
      if (ray.sweep) a *= 1 - 0.6 * span(t, P3, 1.5);
      if (a < 0.004) continue;
      const th = ray.sweep ? ray.th + Math.sin(t * 0.25 + ray.delay) * ray.sweep * 6 * DEG * mo : ray.th;
      const [x0, y0] = polar(th, ray.r0);
      const [x1, y1] = polar(th, ray.r1);
      ctx.strokeStyle = `rgba(206, 150, 232, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    const cool = [214, 202, 238];
    const hot = [255, 168, 224];
    const starDim = 1 - 0.55 * span(t, P3, 2);
    for (const st of this.stars) {
      const a = st.a * span(t, st.on, 0.8) * starDim * (0.75 + 0.25 * Math.sin(t * 2.3 + st.tw) * mo);
      if (a < 0.02) continue;
      ctx.fillStyle = rgba(cool, a);
      ctx.fillRect(st.x - st.s / 2, st.y - st.s / 2, st.s, st.s);
    }
    for (const p of this.particles) {
      const age = t - p.s;
      if (age < 0) continue;
      const life = p.d + p.linger;
      if (age > life + 0.25) continue;
      const u = clamp(age / p.d);
      const k = 1 - (1 - u) ** 2;
      let x = lerp(p.x0, p.ex, k);
      let y = lerp(p.y0, p.ey, k);
      let alpha = p.a * span(age, 0, 0.16);
      if (age > life) alpha *= 1 - (age - life) / 0.25;
      if (u >= 1) {
        x += Math.sin(t * 6 + p.seed) * 0.9 * mo;
        y += Math.cos(t * 5 + p.seed) * 0.9 * mo;
      } else if (mo > 0.5 && p.seed < 3) {
        const kp = 1 - (1 - clamp((age - 0.03) / p.d)) ** 2;
        ctx.strokeStyle = rgba(cool, alpha * 0.16);
        ctx.lineWidth = Math.max(0.8, p.size * 0.6);
        ctx.beginPath();
        ctx.moveTo(lerp(p.x0, p.ex, kp), lerp(p.y0, p.ey, kp));
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      const near = clamp((u - 0.72) / 0.28);
      const size = p.size * (1 + near * 0.35);
      ctx.fillStyle = rgba(mixRgb(cool, hot, near), alpha);
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }

  drawArc(ctx, t, mo) {
    const draw = easeOut(span(t, 0, 0.9));
    const th1 = lerp(ARC_TOP, ARC_BOTTOM, draw);
    const jevHot = span(t, P2, 0.5) * (1 - span(t, P3 - 0.3, 0.8));
    const pulse = 1 + 0.08 * Math.sin(t * 3.1) * mo;
    const path = r => {
      ctx.beginPath();
      ctx.arc(DOME.cx, DOME.cy, r, ARC_TOP, th1);
    };
    ctx.lineCap = 'round';
    const haze = (0.3 + 0.7 * jevHot) * (1 - span(t, P3, 1.5)) + 0.25;
    for (const [inset, width, alpha] of [[24, 30, 0.03], [14, 18, 0.04], [7, 8, 0.05]]) {
      path(DOME.r - inset);
      ctx.strokeStyle = `rgba(196, 92, 204, ${(alpha * haze).toFixed(3)})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    path(DOME.r - 6.5);
    ctx.strokeStyle = 'rgba(176, 128, 214, 0.26)';
    ctx.lineWidth = 1;
    ctx.stroke();
    path(DOME.r);
    ctx.strokeStyle = `rgba(232, 70, 178, ${(0.07 + 0.11 * jevHot) * pulse})`;
    ctx.lineWidth = 16 + 6 * jevHot;
    ctx.stroke();
    path(DOME.r);
    ctx.strokeStyle = `rgba(236, 86, 186, ${(0.2 + 0.2 * jevHot) * pulse})`;
    ctx.lineWidth = 6.5 + 2 * jevHot;
    ctx.stroke();
    path(DOME.r);
    ctx.strokeStyle = '#e66fca';
    ctx.lineWidth = 2.8 + 0.8 * jevHot;
    ctx.stroke();
    path(DOME.r);
    ctx.strokeStyle = `rgba(255, 206, 240, ${0.4 + 0.25 * jevHot})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  drawFeatureLabels(ctx, t) {
    this.font(ctx, 11);
    ctx.textBaseline = 'middle';
    for (let i = 0; i < FEATURES.length; i++) {
      const [name, freq, verdict] = FEATURES[i];
      const th = featureTheta(i);
      const a = easeOut(span(t, 0.35 + i * 0.1, 0.45));
      if (a > 0) {
        const [px, py] = polar(th, LABEL_R + (1 - a) * 12);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-th);
        ctx.globalAlpha = a;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#766a85';
        ctx.fillText(freq, 0, 0);
        ctx.fillStyle = '#b4a9bf';
        ctx.fillText(name, -ctx.measureText(`${freq} `).width, 0);
        ctx.restore();
      }
      const va = easeOut(span(t, this.decideAt[i], 0.3));
      if (va > 0) {
        const [vx, vy] = polar(th, VERDICT_R + (1 - va) * 8);
        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(-th);
        ctx.globalAlpha = va;
        ctx.textAlign = 'left';
        ctx.fillStyle = VERDICT_COLOR[verdict];
        ctx.fillText(verdict, 0, 0);
        ctx.restore();
      }
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;
  }

  // ── Stage: right half ─────────────────────────────────────────────────────
  drawRails(ctx, t, mo) {
    const dim = 1 - 0.6 * span(t, P3, 2.5);
    for (const r of this.rails) {
      const g = easeOut(span(t, r.grow, 1.6));
      if (g <= 0) continue;
      const x0 = arcX(r.y) + 2;
      const len = r.len * g;
      const x1 = Math.min(WIDTH + 4, x0 + len);
      const a = r.a * dim;
      const grad = ctx.createLinearGradient(x0, 0, x1, 0);
      grad.addColorStop(0, rgba(r.col, a));
      grad.addColorStop(0.6, rgba(r.col, a * 0.85));
      grad.addColorStop(1, rgba(r.col, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = r.w;
      ctx.beginPath();
      ctx.moveTo(x0, r.y);
      ctx.lineTo(x1, r.y);
      ctx.stroke();
      if (r.packet && t < P3 + 1.5) {
        const p = r.packet;
        const head = x0 + fract(t * p.v * Math.max(mo, 0.3) + p.ph) * len;
        const pa = Math.min(0.55, a * 2.2) * (1 - span(t, P3, 1.5)) * clamp((x1 - head) / 80);
        if (pa > 0.01) this.line(ctx, Math.max(x0, head - p.len), r.y, head, r.y, rgba(mixRgb(r.col, [255, 220, 245], 0.4), pa), r.w);
      }
    }
  }

  drawStreaks(ctx, t, mo) {
    if (t < 1.5 || t > P3 + 1.6) return;
    const fade = 1 - span(t, P3 - 0.1, 1.5);
    for (const s of this.streaks) {
      const on = span(t, s.on, 0.8);
      if (on <= 0) continue;
      const decided = t >= this.decideAt[s.f];
      const focus = decided ? 1 + 0.6 * (1 - span(t, this.decideAt[s.f], 0.9)) : 1;
      const breathe = 0.5 + 0.5 * Math.sin(t * s.om * Math.max(mo, 0.25) + s.ph);
      const len = s.L * on * (s.bar ? 0.35 + 0.65 * breathe ** 1.5 : 0.55 + 0.45 * breathe) * Math.min(focus, 1.25);
      const y = featureY(s.f) + s.dy;
      const x0 = arcX(y) + 1;
      const verdict = FEATURES[s.f][2];
      let col = hex('#ee74d0');
      if (s.violet) col = hex('#9a7ae6');
      if (decided && verdict !== 'local') col = VERDICT_STREAK[verdict];
      if (decided && verdict === 'local' && CYAN_FEATURES.has(s.f) && (s.bar || !s.bright) && Math.abs(s.dy) < 12) col = hex('#4fd2ee');
      const a = (s.bright ? 0.85 : 0.5) * fade * Math.min(1.2, focus);
      if (a < 0.01 || len < 2) continue;
      this.line(ctx, x0, y, x0 + len, y, rgba(col, a * 0.62), s.w);
      this.line(ctx, x0 + len * 0.72, y, x0 + len, y, rgba(mixRgb(col, [255, 236, 252], 0.4), a), s.w);
    }
  }

  diamondXs(row, t, xMin, xMax) {
    const [anchor, pitch] = DIAMONDS[row];
    const v = 30 + rand(row * 4.1 + 2) * 24;
    const base = anchor + (t - 15.5) * v;
    const out = [];
    for (let k = Math.ceil((xMin - base) / pitch); base + k * pitch <= xMax; k++) out.push(base + k * pitch);
    return out;
  }

  drawBundles(ctx, t, mo) {
    if (t < P3 + 0.2) return;
    for (let i = 0; i < SUBS.length; i++) {
      const sub = SUBS[i];
      const y = rowY(i);
      const form = easeOut(span(t, P3 + 0.35 + i * 0.11, 1.3));
      if (form <= 0) continue;
      const col = this.rowColor(i, t);
      const keep = sub.keep !== undefined;
      const b = BUILD_BY_ROW[i];
      const boxLeft = this.boxLeft(i, false);
      const xs = arcX(y) + 3;

      // Soft bloom so each bundle tints the gaps around it.
      const xr = Math.min(1072, boxLeft + 40);
      const bloomA = (keep ? 0.03 : b && t >= b.done ? 0.1 : 0.065) * form;
      this.line(ctx, xs, y, xr, y, rgba(b && t >= b.done ? [226, 160, 110] : col, bloomA), 34);

      // Side rails with bright travelling caps.
      const done = b && t >= b.done;
      for (const sl of this.sideLines[i]) {
        const yy = y + sl.off;
        const x0 = arcX(yy) + 3;
        const breathe = Math.sin(t * 0.9 + sl.phase) * 26 * mo;
        let end = x0 + (Math.min(1072, x0 + (1080 - x0) * sl.reach + breathe) - x0) * form;
        const sideCol = done ? (sl.off > 10 ? [240, 168, 190] : [220, 196, 150]) : col;
        if (sl.off === -14.5 && done) {
          // Completion sweep: the top rail races to the label's right edge and stays lit.
          const sweep = easeOut(span(t, b.done, 0.5));
          end = lerp(end, LABEL_RIGHT + 2, sweep);
          this.line(ctx, x0, yy, end, yy, rgba(sideCol, 0.55), 2);
          this.line(ctx, Math.max(x0, end - 18), yy, end, yy, rgba([226, 230, 186], 0.92), 2);
          continue;
        }
        // The -7 rail shares its lane with the diamond garland once a build starts, so it recedes.
        const underGarland = sl.off === -7 && b && t >= b.start;
        const sa = sl.off === 21 ? 0.18 : underGarland ? 0.26 : keep ? 0.4 : 0.55;
        this.line(ctx, x0, yy, end, yy, rgba(sideCol, sa * form), sl.off === 21 ? 1.2 : 2.2);
        if (sl.off !== 21 && !underGarland) this.line(ctx, Math.max(x0, end - sl.cap), yy, end, yy, rgba(mixRgb(sideCol, [255, 245, 255], 0.3), 0.85 * form), 2.2);
      }

      // Neutral mapped spine (act 3), then the build progress beam (act 4).
      const spineEnd = lerp(xs, keep ? boxLeft - 40 : boxLeft - 1, 0.62 * form);
      const keepEnd = lerp(xs, boxLeft - 40, form);
      if (keep) {
        this.line(ctx, xs, y, keepEnd, y, rgba(col, 0.62), 2.2);
        continue;
      }
      this.line(ctx, xs, y, spineEnd, y, rgba(NEUTRAL, 0.45 * (1 - span(t, b.start, 0.6))), 2);
      if (t < b.start) continue;
      const grow = clamp((t - b.start) / b.grow);
      const mainEnd = lerp(xs + 12, boxLeft - 1, grow);
      const flash = 1 - span(t, b.done, 0.45);
      const justDone = t >= b.done ? flash : 0;
      const isDone = t >= b.done;
      this.line(ctx, xs, y, mainEnd, y, rgba(col, 0.26 + 0.18 * justDone), 5.5);
      this.line(ctx, xs, y, mainEnd, y, rgba(mixRgb(col, [255, 255, 255], (isDone ? 0 : -0.12) + 0.5 * justDone), 0.92), 3);
      this.line(ctx, xs, y, mainEnd, y, rgba(mixRgb(col, [255, 255, 255], isDone ? 0.2 : 0.1), 0.5), 1);

      // Garland and diamonds riding the build beam.
      const xMin = xs + 58;
      const xMax = mainEnd - 8;
      const ds = this.diamondXs(i, t, xMin - 200, xMax);
      const pitch = DIAMONDS[i][1];
      const appear = span(t, b.start, 0.5);
      ctx.strokeStyle = rgba(isDone ? [228, 212, 190] : [214, 198, 238], 0.5 * appear);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const g0 = arcX(y - 7) + 3;
      const anchor = ds.length ? ds[ds.length - 1] : xMin;
      for (let x = g0, first = true; x <= Math.min(1072, mainEnd + 60); x += 5) {
        const ph = fract((x - anchor) / pitch);
        const inRange = x >= xMin - pitch * 0.5 && x <= xMax + pitch * 0.5;
        const dip = inRange ? Math.sin(Math.PI * ph) ** 0.7 : 1;
        const gy = y - 5.4 - 2.2 * dip;
        if (first) {
          ctx.moveTo(x, gy);
          first = false;
        } else {
          ctx.lineTo(x, gy);
        }
      }
      ctx.stroke();
      for (const dx of ds) {
        if (dx < xMin) continue;
        const da = appear * clamp((dx - xMin) / 30) * clamp((xMax - dx) / 20 + 0.2);
        if (da <= 0.02) continue;
        ctx.beginPath();
        ctx.moveTo(dx, y - 5.4);
        ctx.lineTo(dx + 5.4, y);
        ctx.lineTo(dx, y + 5.4);
        ctx.lineTo(dx - 5.4, y);
        ctx.closePath();
        ctx.fillStyle = `rgba(26, 17, 56, ${da.toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(226, 212, 250, ${(0.95 * da).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }

  subLabel(i, t) {
    const sub = SUBS[i];
    const b = BUILD_BY_ROW[i];
    if (b && t >= b.done) return { done: true, name: sub.name, price: `$${sub.price} → $0` };
    if (sub.keep !== undefined && t >= this.keepAt[i]) return { keep: true, name: sub.name, price: `$${sub.price} · keep` };
    return { name: sub.name, price: `$${sub.price}` };
  }

  boxLeft(i, done) {
    const sub = SUBS[i];
    const chars = sub.name.length + 2 + String(sub.price).length + 1 + (done ? 5 : sub.keep !== undefined ? 7 : 0);
    return LABEL_RIGHT - chars * 7.34 - 9;
  }

  drawSubLabels(ctx, t) {
    // Soft blooms: a white "charging" glow just before a build lands, a warm flare right after.
    for (const b of BUILDS) {
      const y = rowY(b.row);
      const charge = span(t, b.done - 0.7, 0.7) * (t < b.done ? 1 : 0);
      if (charge > 0) {
        const gx = (this.boxLeft(b.row, false) + LABEL_RIGHT) / 2;
        const g = ctx.createRadialGradient(gx, y - 13, 0, gx, y - 13, 24);
        g.addColorStop(0, `rgba(255, 238, 214, ${(0.34 * charge).toFixed(3)})`);
        g.addColorStop(0.55, `rgba(255, 226, 200, ${(0.16 * charge).toFixed(3)})`);
        g.addColorStop(1, 'rgba(255, 220, 190, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(gx - 24, y - 37, 48, 48);
      }
      const flare = t >= b.done ? (1 - span(t, b.done, 1.4)) ** 1.5 : 0;
      if (flare > 0) {
        const g = ctx.createRadialGradient(LABEL_RIGHT + 6, y, 0, LABEL_RIGHT + 6, y, 34);
        g.addColorStop(0, `rgba(255, 228, 168, ${(0.36 * flare).toFixed(3)})`);
        g.addColorStop(0.5, `rgba(240, 190, 150, ${(0.16 * flare).toFixed(3)})`);
        g.addColorStop(1, 'rgba(230, 170, 140, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(LABEL_RIGHT - 28, y - 34, 68, 68);
      }
    }
    for (let i = 0; i < SUBS.length; i++) {
      const a = span(t, this.revealAt[i], 0.8);
      if (a <= 0) continue;
      const y = rowY(i);
      const L = this.subLabel(i, t);
      const weight = L.done ? 700 : 400;
      this.font(ctx, 12.2, weight);
      const priceW = ctx.measureText(L.price).width;
      const totalW = ctx.measureText(`${L.name}  ${L.price}`).width;
      const boxA = clamp((a - 0.82) / 0.18);
      if (boxA > 0) {
        ctx.fillStyle = `rgba(16, 9, 22, ${(0.9 * boxA).toFixed(3)})`;
        ctx.fillRect(LABEL_RIGHT - totalW - 9, y - 10.5, totalW + 13.5, 21);
      }
      const b = BUILD_BY_ROW[i];
      const flash = L.done ? 1 - span(t, b.done, 0.45) : 0;
      ctx.globalAlpha = a;
      ctx.textAlign = 'right';
      if (L.done) {
        ctx.fillStyle = rgba(mixRgb([226, 210, 150], [255, 255, 255], flash * 0.6), 1);
        ctx.fillText(`${L.name}  ${L.price}`, LABEL_RIGHT, y + 4.3);
      } else {
        ctx.fillStyle = L.keep ? '#7d7388' : '#7f758a';
        ctx.fillText(L.price, LABEL_RIGHT, y + 4.3);
        ctx.fillStyle = L.keep ? '#7d7388' : '#c2bbc9';
        ctx.fillText(L.name, LABEL_RIGHT - priceW - ctx.measureText('  ').width, y + 4.3);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  // ── Act 2: JEV filter ─────────────────────────────────────────────────────
  drawJevFilter(ctx, t, mo) {
    const vis = span(t, P2 + 0.05, 0.35) * (1 - span(t, P3 - 0.15, 0.4));
    if (vis <= 0) return;
    const th = this.focusAt(t);
    const [sx, sy] = polar(th, DOME.r);
    const by = sy - 71.5;

    ctx.globalAlpha = vis;
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 28);
    glow.addColorStop(0, 'rgba(255, 206, 242, 0.95)');
    glow.addColorStop(0.22, 'rgba(246, 120, 206, 0.6)');
    glow.addColorStop(0.6, 'rgba(236, 72, 170, 0.16)');
    glow.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - 28, sy - 28, 56, 56);
    const spin = Math.PI / 4 + Math.sin(t * 2.2) * 0.12 * mo;
    const reach = 34 + Math.sin(t * 7.3) * 3 * mo;
    for (let k = 0; k < 4; k++) {
      const a = spin + (k * Math.PI) / 2;
      const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * reach, sy + Math.sin(a) * reach);
      grad.addColorStop(0, 'rgba(255, 176, 230, 0.95)');
      grad.addColorStop(0.55, 'rgba(250, 140, 214, 0.5)');
      grad.addColorStop(1, 'rgba(255, 140, 210, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * reach, sy + Math.sin(a) * reach);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe6f6';
    ctx.beginPath();
    ctx.arc(sx, sy, 2.6, 0, Math.PI * 2);
    ctx.fill();

    this.line(ctx, 540.5, by + 23.5, sx + 4, sy - 3, 'rgba(236, 128, 196, 0.55)', 1);
    ctx.fillStyle = 'rgba(26, 6, 28, 0.95)';
    ctx.fillRect(533, by, 123, 23.5);
    ctx.strokeStyle = 'rgba(112, 72, 112, 0.75)';
    ctx.lineWidth = 1;
    ctx.strokeRect(533.5, by + 0.5, 122, 22.5);
    this.spaced(ctx, [['JEV FILTER', '#ad6c9c']], 542, by + 15.5, 11, 700, 0.85);
    ctx.globalAlpha = 1;
  }

  // ── Act 3: REA call chain ─────────────────────────────────────────────────
  drawCallChain(ctx, t, mo) {
    const head = span(t, P3 + 0.15, 0.4);
    if (head <= 0) return;
    ctx.globalAlpha = head;
    this.text(ctx, 'call chain · pdf export', 22, 230.8, '#b3a5dc', 11, 700);
    ctx.globalAlpha = 1;
    const pulse = fract((t - P3 - 2.3) * 0.42) * (CALL_CHAIN.length + 1.5) - 0.5;
    for (let k = 0; k < CALL_CHAIN.length; k++) {
      const [label, x, y] = CALL_CHAIN[k];
      const at = P3 + 0.25 + k * 0.2;
      const a = easeOut(span(t, at, 0.3));
      if (a <= 0) continue;
      if (k > 0) {
        const [, px, py] = CALL_CHAIN[k - 1];
        const seg = span(t, at - 0.2, 0.2);
        this.line(ctx, px, py + 6, lerp(px, x, seg), lerp(py + 6, y - 6, seg), 'rgba(170, 146, 226, 0.5)', 1);
      }
      const hot = t > P3 + 2.3 ? Math.max(0, 1 - Math.abs(pulse - k) * 0.9) * mo : 0;
      const endpoint = k === 0 || k === CALL_CHAIN.length - 1;
      ctx.globalAlpha = a;
      if (hot > 0.02) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, `rgba(220, 196, 255, ${(0.45 * hot).toFixed(3)})`);
        g.addColorStop(1, 'rgba(220, 196, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 12, y - 12, 24, 24);
      }
      ctx.strokeStyle = endpoint ? '#c8b8e6' : '#a68ce0';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x, y, 5.4 * (0.6 + 0.4 * a), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = endpoint ? '#f6e29a' : mixRgbStr('#c7b4f4', '#ffffff', hot * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      this.text(ctx, label, x + 14.5, y + 3.6, k === 0 ? '#d4c48e' : '#aea3bb', 10);
      ctx.globalAlpha = 1;
    }
  }

  // ── Act 4: Opus builder ring ──────────────────────────────────────────────
  drawOpus(ctx, S, t, mo) {
    const enter = span(t, P4, 1.4);
    if (enter <= 0) return;
    // The ring steps down the subscription list as each of the first four builds lands.
    let steps = 0;
    for (let n = 0; n < 4; n++) steps += settle(span(t, BUILDS[n].done - 0.25, 0.42));
    const cx = RING.x;
    const cy = lerp(RING.y - 300, RING.y - 60 * (4 - steps), settle(enter)) + Math.sin(t * 1.3) * 1.5 * mo * enter;
    const alpha = clamp(enter * 2.5);

    // Leader lines from the badge corner to active builds: grow → connected (packet) → retract, then hop.
    const ox = cx + 73;
    const oy = cy - 89;
    for (const L of LEADERS) {
      const local = t - P4 - L.offset;
      if (local < 0) continue;
      const row = L.rows[Math.min(Math.floor(local / LEADER_SLOT), L.rows.length - 1)];
      const b = BUILD_BY_ROW[row];
      if (!b || t < b.start + 0.15 || t >= b.done + 0.2) continue;
      const u = fract(local / LEADER_SLOT);
      const tx = this.boxLeft(row, false) + L.dx;
      const ty = rowY(row) + L.dy;
      const qx = lerp(ox, tx, 0.5) + L.bend;
      const qy = lerp(oy, ty, 0.5);
      const bez = s => [
        (1 - s) ** 2 * ox + 2 * (1 - s) * s * qx + s * s * tx,
        (1 - s) ** 2 * oy + 2 * (1 - s) * s * qy + s * s * ty,
      ];
      let from = 0;
      let to = 1;
      let dot = 1;
      if (u < 0.2) {
        to = easeOut(u / 0.2);
        dot = to;
      } else if (u < 0.75) {
        dot = fract((u - 0.2) / 0.275);
      } else {
        from = (u - 0.75) / 0.25;
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(246, 242, 255, 0.82)';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (let s = 0; s <= 20; s++) {
        const [px, py] = bez(lerp(from, to, s / 20));
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const [hx, hy] = bez(dot);
      ctx.fillStyle = '#fbf8ff';
      ctx.beginPath();
      ctx.arc(hx, hy, 3.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = alpha;
    const halo = ctx.createRadialGradient(cx, cy, 50, cx, cy, 82);
    halo.addColorStop(0, 'rgba(22, 14, 34, 0.9)');
    halo.addColorStop(1, 'rgba(22, 14, 34, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 82, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(26, 20, 40, 0.94)';
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(122, 112, 150, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 62.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#efe07c';
    ctx.lineWidth = 2.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, 62.5, -Math.PI / 2, -Math.PI / 2 + Math.max(0.001, S.doneFrac) * Math.PI * 2);
    ctx.stroke();
    ctx.lineCap = 'butt';

    ctx.fillStyle = '#1d2440';
    ctx.beginPath();
    ctx.arc(cx, cy, 51, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 206, 226, 0.78)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 51, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 240, 250, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([1.5, 3.5]);
    ctx.lineDashOffset = -t * 5 * mo;
    ctx.beginPath();
    ctx.arc(cx, cy, 51, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#08171f';
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#62c6dc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.stroke();

    const rot = t * 0.7 * mo + 0.6;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    for (const [px, py, pz, tw] of this.cloud) {
      const x = px * cr - pz * sr;
      const z = px * sr + pz * cr;
      const depth = (z + 1) / 2;
      const a = (0.35 + 0.55 * depth) * (0.75 + 0.25 * Math.sin(t * 3 + tw * 20) * mo);
      ctx.fillStyle = `rgba(126, 226, 196, ${a.toFixed(3)})`;
      const s = 1.1 + depth * 0.9;
      ctx.fillRect(cx + x * 27 - s / 2, cy + py * 27 - s / 2, s, s);
    }

    ctx.fillStyle = '#0a0e19';
    ctx.fillRect(cx - 75, cy - 89, 149, 24.5);
    ctx.strokeStyle = 'rgba(150, 190, 206, 0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 74.5, cy - 88.5, 148, 23.5);
    this.spaced(ctx, [['CLAUDE OPUS 5.5', '#78b2bd']], cx, cy - 74.5, 12.3, 700, 1.15, 'center');
    this.text(ctx, `building ${S.done}/11 · tests vs observed`, cx + 0.5, cy + 77, '#72a2bb', 11, 400, 'center');
    ctx.globalAlpha = 1;
  }

  drawSonnetBadge(ctx, t) {
    const a = easeOut(span(t, 0.2, 0.5)) * (1 - 0.55 * span(t, P3, 0.8));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(15, 8, 22, 0.82)';
    ctx.fillRect(20.5, 982.5, 186, 25.5);
    ctx.strokeStyle = 'rgba(126, 102, 146, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20.5, 982.5, 186, 25.5);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(30.5, 993, 5, 5);
    const w = this.spaced(ctx, [['CLAUDE SONNET', '#ece4f0']], 42.5, 999, 10.5, 700, 0.5);
    this.text(ctx, '→ research', 42.5 + w + 7, 999, '#8e8199', 10.5);
    ctx.globalAlpha = 1;
  }

  // ── Bottom console ────────────────────────────────────────────────────────
  drawConsole(ctx, S, t, mo) {
    ctx.fillStyle = '#1f1127';
    ctx.fillRect(0, STAGE_BOTTOM, WIDTH, HEIGHT - STAGE_BOTTOM);

    this.roundRect(ctx, 15, 1037.5, 1049, 24, 2);
    ctx.fillStyle = '#271932';
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(25.5, 1046.5, 5.5, 5.5);
    this.text(ctx, 'jev@desk', 38.5, 1053.2, '#d9d1de', 10, 700);
    this.text(ctx, '~ % run teardown --bill 300 --rea authorized --opus 5.5 --demo', 100, 1053.2, '#857993', 10);
    this.text(ctx, 'state:', 648, 1053.2, '#7f738d', 10);
    this.text(ctx, S.stateName, 692.8, 1053.2, '#e2cd86', 10, 700);
    for (let k = 0; k < 22; k++) {
      const wob = 0.5 + 0.5 * Math.sin(t * (4.5 + rand(k * 3.3) * 6) * mo + k * 1.7);
      const h = 2 + 9 * wob * (0.55 + 0.45 * Math.sin(t * 2.1 * mo + k * 0.9) ** 2);
      ctx.fillStyle = k < 4 ? '#d690c6' : '#6c5582';
      ctx.fillRect(946.5 + k * 5, 1054.5 - h, 2.4, h);
    }

    const titles = [
      ['claude sonnet', '', '#f472b6'],
      ['jev', 'every feature', '#f472b6'],
      ['rea', 'authorized', '#a78bfa'],
      ['code', 'teardown.py · live', '#f472b6'],
      ['claude opus 5.5', '', '#67d8ef'],
      ['bill', 'usd/mo · demo', '#fcd34d'],
    ];
    titles.forEach(([title, sub, sq], i) => {
      const x = panelX(i);
      this.roundRect(ctx, x + 0.5, PANEL_Y, PANEL_W - 1, PANEL_H, 3);
      ctx.fillStyle = '#25162c';
      ctx.fill();
      ctx.strokeStyle = '#34253e';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = sq;
      ctx.fillRect(x + 11, 1083.3, 4.6, 4.6);
      this.text(ctx, title, x + 22.7, 1088, UI.title, 11.4, 700);
      if (sub) this.text(ctx, sub, x + 160, 1088, UI.sub, 9.1, 400, 'right');
      ctx.fillStyle = 'rgba(78, 60, 92, 0.55)';
      ctx.fillRect(x + 11, 1096.5, PANEL_W - 22, 1);
    });

    this.drawSonnetPanel(ctx, S, t);
    this.drawJevPanel(ctx, S, t, mo);
    this.drawReaPanel(ctx, S, t);
    this.drawCodePanel(ctx, S, t);
    this.drawOpusPanel(ctx, S, t, mo);
    this.drawBillPanel(ctx, S, t);
  }

  bar(ctx, x, y, w, h, color) {
    if (w <= 0) return;
    const r = Math.min(h / 2, w / 2);
    this.roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawSonnetPanel(ctx, S, t) {
    const x0 = panelX(0);
    SONNET_SOURCES.forEach(([label, len], k) => {
      const cy = 1113.3 + k * 17;
      this.text(ctx, label, x0 + 11, cy + 3.2, UI.label, UI.labelSize);
      this.bar(ctx, x0 + 94.7, cy - 2.4, len * easeOut(span(t, 0.4 + k * 0.22, 0.9)), 4.8, '#62c9e2');
    });
    this.text(ctx, 'signals in flight', x0 + 11, 1232.5, UI.label, UI.labelSize);
    this.text(ctx, group(S.signals - S.jev), x0 + 11, 1258, '#e47ec0', UI.bigSize, 700);
    this.text(ctx, 'your 14 subs', x0 + 11, 1278.3, UI.label, UI.labelSize);
    SUBS.forEach((sub, i) => {
      const a = span(t, 1.0 + i * 0.12, 0.3);
      if (a <= 0) return;
      const r = Math.floor(i / 7);
      const c = i % 7;
      let col = hex(sub.box);
      if (sub.keep !== undefined) col = mixRgb(col, hex('#5a4f61'), span(t, this.keepAt[i], 0.4));
      const b = BUILD_BY_ROW[i];
      if (b) col = mixRgb(col, hex('#f8d865'), span(t, b.done, 0.2));
      ctx.globalAlpha = a;
      this.roundRect(ctx, x0 + 11 + c * 21.3, 1286 + r * 16, 17.3, 11.7, 2);
      ctx.fillStyle = rgba(col, 1);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawJevPanel(ctx, S, t, mo) {
    const x0 = panelX(1);
    JEV_BARS.forEach((h, k) => {
      const g = clamp((t - 4.4 - 0.12 * k) / 4.0) ** 2;
      const jitter = t > P2 && t < P3 ? Math.sin(t * 9 + k * 2.1) * 1.2 * mo * g : 0;
      const hh = Math.max(2, h * g + jitter);
      ctx.fillStyle = JEV_CYAN.has(k) ? '#5bd0e8' : '#ea6ec6';
      ctx.fillRect(x0 + 11.2 + k * 9.93, 1174.3 - hh, 7.7, hh);
    });
    this.text(ctx, 'kept signals', x0 + 11, 1196, UI.label, UI.labelSize);
    this.text(ctx, group(S.kept), x0 + 11, 1224, '#e47ec0', UI.bigSize, 700);
    this.text(ctx, `/ ${group(8940)}`, x0 + 160, 1224, UI.dim, 9.8, 400, 'right');
    [['runs local', S.local, 1247.7], ['one person', S.person, 1269.3]].forEach(([label, pct, cy]) => {
      this.text(ctx, label, x0 + 11, cy + 3.2, UI.label, UI.labelSize);
      this.bar(ctx, x0 + 75, cy - 2.3, 50.3, 4.6, '#3a2a47');
      this.bar(ctx, x0 + 75, cy - 2.3, 50.3 * pct / 100, 4.6, '#62c9e2');
      this.text(ctx, `${Math.round(pct)}%`, x0 + 160, cy + 3.2, UI.value, UI.valueSize, 700, 'right');
    });
    const tailA = span(t, 8.7, 0.4);
    if (tailA > 0) {
      ctx.globalAlpha = tailA;
      this.text(ctx, '3 subs: keep paying', x0 + 11, 1310, UI.label, UI.labelSize);
      ctx.globalAlpha = 1;
    }
    this.text(ctx, 'DEMO', x0 + 160, 1310, '#b8578a', UI.labelSize, 400, 'right');
  }

  drawReaPanel(ctx, S, t) {
    const x0 = panelX(2);
    DAG_EDGES.forEach(([a, b]) => {
      const k = span(t, DAG_REVEAL[b] - 0.15, 0.3);
      if (k <= 0) return;
      const [ax, ay] = DAG_NODES[a];
      const [bx, by] = DAG_NODES[b];
      this.line(ctx, x0 + ax, ay, x0 + lerp(ax, bx, k), lerp(ay, by, k), 'rgba(166, 140, 232, 0.85)', 1.3);
    });
    DAG_NODES.forEach(([nx, ny], k) => {
      const on = span(t, DAG_REVEAL[k], 0.3);
      if (on < 1) {
        ctx.fillStyle = `rgba(104, 88, 118, ${(0.9 * (1 - on)).toFixed(3)})`;
        const r = k === 0 ? 2.8 : 2.2;
        ctx.fillRect(x0 + nx - r, ny - r, r * 2, r * 2);
      }
      if (on > 0) {
        ctx.fillStyle = k === 0 ? rgba(hex('#f6d35e'), on) : rgba(hex('#b49df0'), on);
        ctx.beginPath();
        ctx.arc(x0 + nx, ny, (k === 0 ? 4.6 : 3.6) * (0.5 + 0.5 * easeOut(on)), 0, Math.PI * 2);
        ctx.fill();
      }
    });
    const rows = [['modules', TRACKS.modules], ['functions', TRACKS.functions], ['ui events', TRACKS.uiEvents], ['data flows', TRACKS.dataFlows]];
    rows.forEach(([label, keys], k) => {
      const cy = 1212.7 + k * 15.1;
      this.text(ctx, label, x0 + 11.4, cy + 3.2, UI.label, UI.labelSize);
      this.text(ctx, group(track(keys, t)), x0 + 159.7, cy + 3.2, UI.value, UI.valueSize, 700, 'right');
    });
    this.text(ctx, 'findings w/ evidence', x0 + 11.4, 1284.3, UI.label, UI.labelSize);
    this.text(ctx, group(S.rea), x0 + 12, 1312, '#b9a6e6', UI.bigSize, 700);
  }

  codeLineAt(t) {
    if (t >= BUILDS[BUILDS.length - 1].done + 0.4) return 14;
    const phase = t < P2 ? 0 : t < P3 ? 1 : t < P4 ? 2 : 3;
    const [lines, offset] = CODE_CYCLES[phase];
    const steps = (t - PHASE_STARTS[phase]) / 0.5 + offset + 0.5;
    const idx = Math.floor(steps);
    const cur = lines[((idx % lines.length) + lines.length) % lines.length];
    const prev = lines[(((idx - 1) % lines.length) + lines.length) % lines.length];
    return lerp(prev, cur, easeOut(clamp(fract(steps) * 4)));
  }

  drawCodePanel(ctx, S, t) {
    const x0 = panelX(3);
    const pos = this.codeLineAt(t);
    const active = Math.round(pos);
    ctx.fillStyle = 'rgba(176, 82, 146, 0.26)';
    ctx.fillRect(x0 + 7.3, 1110.3 + pos * 14.64 - 6.7, 156.6, 13.4);
    CODE.forEach(([indent, parts], k) => {
      if (!parts.length) return;
      const y = 1113.3 + k * 14.64;
      const lit = k === active;
      const tinted = parts.map(([s, c]) => [s, lit ? (c === C_DIM ? '#d8cfe0' : c) : c]);
      this.runs(ctx, tinted, x0 + 10.6 + indent * 20.9, y, 8.55, 400);
    });
  }

  drawOpusPanel(ctx, S, t, mo) {
    const x0 = panelX(4);
    const cx = x0 + 85.8;
    const cy = 1151;
    const live = 0.45 + 0.45 * span(t, P4, 1.2);
    const rot = t * 0.55 * Math.max(mo, 0.15);
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const tilt = 0.32;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    for (const [px, py, pz] of this.sphere) {
      const x = px * cr - pz * sr;
      const z1 = px * sr + pz * cr;
      const y = py * ct - z1 * st;
      const z = py * st + z1 * ct;
      const depth = (z + 1) / 2;
      const a = live * (0.25 + 0.75 * depth);
      ctx.strokeStyle = `rgba(178, 168, 196, ${a.toFixed(3)})`;
      ctx.lineWidth = 1.1;
      const sx = cx + x * 40;
      const sy = cy + y * 40;
      const tx = -z * 1.3;
      ctx.beginPath();
      ctx.moveTo(sx - tx * 0.5, sy - 0.5);
      ctx.lineTo(sx + tx * 0.5 + 0.6, sy + 0.5);
      ctx.stroke();
    }
    this.text(ctx, 'tests passing', x0 + 10.8, 1212.5, UI.label, UI.labelSize);
    this.text(ctx, group(S.tests), x0 + 11.5, 1240.5, '#7fcbd9', UI.bigSize, 700);
    this.text(ctx, '/ 190', x0 + 160, 1240.5, UI.dim, 9.8, 400, 'right');
    const start = clamp(S.done - 4, 0, OPUS_TESTS.length - 5);
    for (let k = 0; k < 5; k++) {
      const idx = start + k;
      const y = 1261.7 + k * 14.15;
      const pass = idx < S.done;
      this.text(ctx, `> ${OPUS_TESTS[idx]}`, x0 + 10.8, y, pass ? '#aea5b6' : UI.pending, UI.labelSize);
      if (pass) this.text(ctx, 'pass', x0 + 160, y, '#d8c97e', UI.labelSize, 700, 'right');
      else this.text(ctx, idx === S.done && t > P4 ? '.'.repeat(1 + (Math.floor(t * 3) % 3)) : '‥', x0 + 160, y, UI.pending, UI.labelSize, 400, 'right');
    }
  }

  drawBillPanel(ctx, S, t) {
    const x0 = panelX(5);
    this.text(ctx, 'monthly', x0 + 11, 1116, UI.label, UI.labelSize);
    this.text(ctx, `$${Math.round(S.bill)}`, x0 + 11.5, 1147.5, '#f0d98f', 25.5, 700);
    this.text(ctx, 'target $0', x0 + 160, 1144, '#b85a99', 9, 700, 'right');

    const cx0 = x0 + 11;
    const cw = 149;
    const top = 1160;
    const bottom = 1203.3;
    const N = 90;
    const span0 = Math.max(t, 0.001);
    const pts = [];
    for (let s = 0; s <= N; s++) {
      const tau = (s / N) * span0;
      pts.push([cx0 + (s / N) * cw, top + (1 - this.billAt(tau) / 300) * (bottom - top)]);
    }
    ctx.beginPath();
    ctx.moveTo(cx0, bottom);
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(cx0 + cw, bottom);
    ctx.closePath();
    ctx.fillStyle = '#4b3833';
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], s) => (s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = '#e8d090';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    this.text(ctx, 'split', x0 + 11, 1224.3, UI.label, UI.labelSize);
    [['rebuilt', S.rebuiltUsd, '#f5d470', 1241], ['keep', S.keepUsd, '#cfc6da', 1261]].forEach(([label, usd, col, cy]) => {
      this.text(ctx, label, x0 + 11, cy + 3.2, UI.label, UI.labelSize);
      this.bar(ctx, x0 + 61.7, cy - 2.3, 50, 4.6, '#3a2a47');
      if (usd > 0.5) this.bar(ctx, x0 + 61.7, cy - 2.3, Math.max(4.6, (50 * usd) / 300), 4.6, col);
      this.text(ctx, `$${Math.round(usd)}`, x0 + 160, cy + 3.2, UI.value, UI.valueSize, 700, 'right');
    });
    this.text(ctx, 'this run cost', x0 + 11, 1286.6, UI.label, UI.labelSize);
    this.text(ctx, `$${S.api.toFixed(2)}`, x0 + 11.5, 1311, '#e87bbc', 17, 700);
    this.text(ctx, 'one time, not monthly', x0 + 11, 1326, '#776a83', 8.5);
  }
}

function mixRgbStr(a, b, k) {
  return rgba(mixRgb(hex(a), hex(b), k), 1);
}
