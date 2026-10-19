// Scene 04: STANFORD AI LAB / DISCOVERY ARCHITECTURE (Opus 5.5 + GPT-6.1 Sol Torus Connectome)
// Layout, palette and geometry measured from the 1080x1350 reference frame (t = 0 reproduces it).
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"JetBrains Mono NL", "JetBrainsMonoNL NFM", "JetBrainsMonoNL Nerd Font Mono", "JetBrains Mono", "JetBrainsMono NFM", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';
// Coding fonts turn "->" and "0x8F" / "1080x1350" into ligatures; a zero-width non-joiner keeps
// the plain glyphs the reference terminal shows.
const ZWNJ = '\u200c';
const noLigatures = s => s.replace(/->/g, `-${ZWNJ}>`).replace(/(\d)x(?=[\dA-Fa-f])/g, `$1${ZWNJ}x${ZWNJ}`);
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
// Every oscillator runs at an integer multiple of this rate so the 24 s loop is seamless.
const LOOP = TAU / 24;

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a, b, x) => {
  const k = clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const hexRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const rgba = (hex, a) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
};
const mixHex = (a, b, k) => {
  const A = hexRgb(a), B = hexRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(', ')})`;
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// Torus connectome: perspective camera fitted to the reference silhouette.
// theta runs clockwise from 12 o'clock; the tube body is a C that opens on the far (left) side.
// ---------------------------------------------------------------------------------------------
const TORUS = {
  cx: 366.9, cy: 556.7, R: 230.5, r: 63, D: 702,
  yaw: -53.5 * DEG, pitch: 1.7 * DEG, roll: 11.6 * DEG,
  arcStart: -40 * DEG, arcEnd: 215 * DEG,
};
// Thin guide rings inside the hollow: [radius, offset xyz, tilt about X, tilt about Y, color, width]
const GUIDE_RINGS = [
  [140.6, -23.6, 7.8, -19.1, -1 * DEG, -8.8 * DEG, 'rgba(178, 162, 184, 0.8)', 1.05],
  [166, -18, 2, -8, 4 * DEG, -3 * DEG, 'rgba(206, 196, 170, 0.32)', 0.9],
];
// Needle reach beyond the tube silhouette (screen px) and relative density by theta, measured
// by ray-marching the reference frame outward from the fitted centerline.
const NEEDLE_REACH = [
  [-90, 40], [-60, 52], [-30, 72], [-15, 80], [0, 56], [10, 62], [20, 80], [30, 104], [40, 104],
  [50, 104], [60, 92], [70, 70], [80, 70], [90, 76], [100, 72], [110, 72], [120, 80], [130, 90],
  [140, 126], [150, 112], [160, 106], [170, 98], [180, 64], [200, 40], [220, 26], [240, 30], [270, 40],
];
const NEEDLE_DENSITY = [
  [-90, 0.75], [-40, 0.8], [-30, 1], [10, 1], [20, 1.2], [60, 1.2], [70, 1.2], [90, 1.45], [125, 1.45],
  [135, 1.2], [145, 1.2], [150, 1.45], [172, 1.45], [180, 0.45], [205, 0.45], [215, 0.7], [270, 0.75],
];
function lerpTable(table, deg) {
  const d = ((deg + 90) % 360 + 360) % 360 - 90;
  for (let i = 1; i < table.length; i++) {
    const [d1, l1] = table[i];
    if (d <= d1) {
      const [d0, l0] = table[i - 1];
      return l0 + ((l1 - l0) * (d - d0)) / (d1 - d0);
    }
  }
  return table[table.length - 1][1];
}
const LIGHT = (() => {
  const v = [-0.6, -0.35, 0.7];
  const n = Math.hypot(...v);
  return v.map(c => c / n);
})();
const BODY_DARK = '#05080f';
const BODY_LIGHT = '#2c4774';
const BODY_SHADES = Array.from({ length: 40 }, (_, i) => mixHex(BODY_DARK, BODY_LIGHT, i / 39));

const GOLD_STRAND = '#c99a4a';
const STRAND_PALETTE = [
  ['#86aecb', 0.25],
  ['#38bdf8', 0.11],
  ['#2563eb', 0.07],
  [GOLD_STRAND, 0.33],
  ['#4fc79c', 0.07],
  ['#d3d6d8', 0.17],
];
const WARM_NEEDLES = ['#3a1c0e', '#5e2c10', '#94481a', '#b8692a'];
const COOL_NEEDLES = ['#8e8e98', '#c4c4cc', '#e4e4e7', '#f4f4f5'];

// Ring angle whose spike carries the candidate reticle.
const CANDIDATE_THETA = 190 * DEG;
// Blocked reward-hack markers: (theta, v) on the tube surface, placed to match the reference frame.
const HACK_DOTS = [
  [42, 1.36], [63.5, 1.15], [70.5, 1.15], [78.5, 0.51], [83, 1.08],
  [111, 1.08], [137.5, 2.13], [123, 0.98], [139.5, 1.5],
];

// ---------------------------------------------------------------------------------------------
// Header flame graph (x, width measured; rows: y, height, text baseline)
// ---------------------------------------------------------------------------------------------
const BLOCK_STYLES = {
  slate: { fill: '#10141d', stroke: '#1f2432', text: '#e4e4e7' },
  green: { fill: '#03261f', stroke: '#2e6a5a', text: '#2fae86' },
  amber: { fill: '#2f1d05', stroke: '#7e602f', text: '#e0922a' },
  gold: { fill: '#2f1f06', stroke: '#b59552', text: '#f2c35c' },
  blue: { fill: '#062239', stroke: '#4a80a6', text: '#5ab8e6' },
  cream: { fill: '#2b2717', stroke: '#d2cdb2', text: '#f4efdc' },
};
const FLAME_ROWS = [[52.5, 19, 66], [74.5, 21, 89.5], [97.5, 30, 120.5]];
const FLAME = [
  ['ast.diff', 418, 93, 0, 'slate'],
  ['sandbox.run', 514, 124, 0, 'green'],
  ['kernel.bench', 669, 113, 0, 'slate'],
  ['assert.shape', 860, 124, 0, 'slate'],
  ['cypher.query', 116, 114, 1, 'slate'],
  ['map_elites.hop', 232, 133, 1, 'amber'],
  ['mcts.select', 368, 113, 1, 'gold'],
  ['sol.propose', 483, 124, 1, 'blue'],
  ['eval.isolate', 609, 114, 1, 'green'],
  ['meta.distill', 724, 114, 1, 'gold'],
  ['sota.verify', 840, 184, 1, 'green'],
  ['neo4j.graph_kv', 17, 131, 2, 'slate'],
  ['sol.sample_deck', 151, 194, 2, 'blue'],
  ['opus.search_plan', 348, 183, 2, 'amber'],
  ['sandbox.container_barrier', 534, 193, 2, 'green'],
  ['meta.lesson_extract', 729, 144, 2, 'gold'],
  ['opus.guidance_sync', 875, 169, 2, 'cream'],
];

// ---------------------------------------------------------------------------------------------
// Right telemetry column data
// ---------------------------------------------------------------------------------------------
const SPLIT_BARS = [
  [37, '#f7a21b'], [31, '#f7a21b'], [23.5, '#f7a21b'], [14.5, '#f7a21b'], [18.5, '#f7a21b'], [27.5, '#f7a21b'], [34, '#f7a21b'],
  [38.5, '#4a8af4'], [40, '#4a8af4'], [37, '#4a8af4'], [31, '#4a8af4'], [23.5, '#4a8af4'], [14.5, '#4a8af4'],
  [18.5, '#4a8af4'], [27.5, '#4a8af4'], [34, '#4a8af4'], [38.5, '#4a8af4'], [39.5, '#4a8af4'],
];
const POD_PALETTE = ['#2f6f9f', '#1f7a5f', '#c03a44', '#1a5a40', '#4ab4e4', '#3a7aaa', '#e39d22', '#1a6a4a', '#2f78b0', '#a86a14', '#22a07a'];
const POD_GRID = [
  ['#2f6f9f', '#1f7a5f', '#c03a44', '#1a5a40', '#4ab4e4', '#3a7aaa', '#e39d22', '#2f6a95'],
  ['#1a6a4a', '#1f7a5f', '#2f78b0', '#60c2ea', '#1f7a5a', '#a86a14', '#e39d22', '#1a6a4a'],
  ['#3a90c8', '#2f78a8', '#2a6a98', '#1f6a4a', '#1f8a6a', '#2f80b8', '#1a6a50', '#2f6a95'],
  ['#22a07a', '#1a5a48', '#a8701a', '#4ab8e8', '#a86a14', '#3a80b8', '#22a07a', '#1a5a48'],
];
const READOUT = [
  ['YAW / PITCH', null, '#e4e4e7'],
  ['GRAPH R', '120 - 480', '#e4e4e7'],
  ['IDEA NODES', '14 280', '#e4e4e7'],
  ['CYPHER EDGES', '68 400', '#e4e4e7'],
  ['HACKS BLOCKED', null, '#c0263f'],
  ['SESSIONS', '100', '#e4e4e7'],
  ['SOTA GAIN', '+28.4%', '#2fae86'],
  ['CYCLE / FPS', null, '#e4e4e7'],
];

// ---------------------------------------------------------------------------------------------
// Bottom analytics data
// ---------------------------------------------------------------------------------------------
// Rose sectors clockwise from 12 o'clock, 30 deg each: [radius, kind]
const ROSE = [
  [40, 'blue'], [64, 'dark'], [80, 'blue'], [66, 'dark'], [38, 'blue'], [66, 'dark'],
  [79, 'blue'], [67, 'dark'], [36, 'blue'], [66, 'gold'], [80, 'blue'], [70, 'dark'],
];
// [label, after, before, particle phase, delta, delta color, kind]
const BENCH = [
  ['ahc-heuristics', 164, 540, 0.95, '-70.2%', '#e0a03c', 'white'],
  ['kernel-builder', 213, 520, 0.27, '-59.6%', '#e0a03c', 'white'],
  ['math-extremal', 240, 440, 0.58, '-45.7%', '#e0a03c', 'white'],
  ['reward-leakage', 15, 240, 0.9, '-93.8%', '#e11d48', 'red'],
  ['model-spend', 182, 580, 0.2, '-68.7%', '#e0a03c', 'white'],
  ['sota-winrate', 520, 211, 0.49, '+28.4%', '#34d399', 'green'],
];
const PARETO = [
  ['ShapeErr', 111, 1200], ['Timeout', 61, 1166.5], ['MemLeak', 43.5, 1139], ['StaleRead', 24.5, 1128],
  ['DataLeak', 14.5, 1120], ['TypeError', 7, 1116], ['Other', 3.5, 1114],
];

// Scratch registers for the projector (avoids per-point allocation inside hot loops).
let PX = 0;
let PY = 0;
let PZ = 0;
let PS = 1;
let PF = 1;

function buildGeometry() {
  const rnd = mulberry32(0x5eed04);

  const needles = [];
  const CANDIDATES = 1500;
  for (let i = 0; i < CANDIDATES; i++) {
    const theta = ((i + rnd() * 0.95) / CANDIDATES) * TAU;
    const deg = theta / DEG;
    if (rnd() * 1.55 > lerpTable(NEEDLE_DENSITY, deg)) continue;
    // Silver needles own the near right/bottom arc (~14..178 deg); copper fur covers the far side.
    const d = Math.abs(((deg - 96) % 360 + 540) % 360 - 180);
    const warm = rnd() < smoothstep(79, 85, d);
    const pal = warm ? WARM_NEEDLES : COOL_NEEDLES;
    // Copper glows brightest on the near top-left and sinks to dim rust on the far side.
    const warmDeg = deg < 90 ? deg + 360 : deg;
    const glow = smoothstep(300, 345, warmDeg);
    const colorIdx = warm
      ? Math.min(3, Math.floor(glow * 2.4 + rnd() * 1.6))
      : Math.min(pal.length - 1, Math.floor(Math.pow(rnd(), 0.6) * pal.length));
    needles.push({
      theta,
      warm,
      bucket: (warm ? 0 : 4) + colorIdx,
      jitter: (rnd() - 0.5) * 0.22,
      base: warm ? 0.55 + rnd() * 0.35 : 1.12 + rnd() * 0.3,
      // Copper fur stays tall right up to the silver boundary on the top arc.
      len: (warm && (deg > 330 || deg < 25) ? lerpTable(NEEDLE_REACH, -15) : lerpTable(NEEDLE_REACH, deg)) * (0.5 + 0.5 * Math.pow(rnd(), 0.45)),
      phase: rnd() * TAU,
      pearl: warm ? (rnd() < 0.55 ? 0.7 + rnd() * 0.5 : 0) : (rnd() < 0.85 ? 1.35 + rnd() * 0.85 : 0),
    });
  }
  const buckets = Array.from({ length: 8 }, () => []);
  for (const n of needles) buckets[n.bucket].push(n);

  const strands = [];
  const STRANDS = 250;
  const BRIDGES = 10;
  const span0 = TORUS.arcStart - 10 * DEG;
  const span1 = TORUS.arcEnd + 22 * DEG;
  for (let k = 0; k < STRANDS + BRIDGES; k++) {
    // A few sparse bridge strands wrap the open far side of the C.
    const bridge = k >= STRANDS;
    const span = bridge ? (120 + rnd() * 70) * DEG : (70 + Math.pow(rnd(), 0.8) * 170) * DEG;
    const start = bridge
      ? (150 + rnd() * 40) * DEG
      : span0 + rnd() * Math.max(0, span1 - span0 - span);
    let pick = rnd();
    let color = STRAND_PALETTE[0][0];
    for (const [c, w] of STRAND_PALETTE) {
      if (pick < w) { color = c; break; }
      pick -= w;
    }
    if (bridge) color = rnd() < 0.7 ? '#cdb184' : '#c8ccd4';
    const alpha = bridge ? 0.2 + rnd() * 0.22 : 0.28 + rnd() * 0.38;
    const wild = rnd() < 0.07;
    const spinTurns = [1, 1, 2, -1][Math.floor(rnd() * 4)];
    // Gold geodesics drift slowly; the blue/white field spins around the tube.
    const gold = color === GOLD_STRAND && !bridge;
    strands.push({
      start,
      end: bridge ? start + span : Math.min(span1, start + span),
      v0: bridge ? Math.PI * (0.75 + rnd() * 0.5) : rnd() * TAU,
      twist: bridge ? (rnd() - 0.5) * 0.3 : (rnd() < 0.5 ? -1 : 1) * (0.3 + rnd() * 0.75),
      lift: bridge ? 0.7 + rnd() * 0.25 : 1.0 + rnd() * 0.2,
      fray: bridge ? 0 : rnd(),
      wild: wild ? 0.15 + rnd() * 0.3 : 0,
      wildFreq: 1 + Math.floor(rnd() * 3),
      spin: (gold ? 1 : spinTurns) * LOOP,
      color: rgba(color, alpha),
      pulseColor: rgba(color === '#2563eb' ? '#93c5fd' : color, Math.min(1, alpha + 0.35)),
      width: 0.75 + rnd() * 0.55,
      pulse: rnd() < 0.16 ? rnd() : -1,
    });
  }
  return { buckets, strands };
}

const GEO = buildGeometry();

export class StanfordTorusScene {
  constructor() {
    this.duration = 24;
    this.center = new Float32Array(361 * 5);
    const NU = 56, NV = 18;
    this.grid = { NU, NV, pts: new Float32Array((NU + 1) * (NV + 1) * 3) };
    this.quads = [];
  }

  font(ctx, size = 10, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#e4e4e7', size = 10, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(noLigatures(String(str)), x, y);
    ctx.textAlign = 'left';
  }

  line(ctx, x0, y0, x1, y1, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const rm = Boolean(state.reducedMotion);

    ctx.save();
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#06050b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.drawHeader(ctx, t, rm);
    this.drawStage(ctx, t, rm);
    this.drawRightTelemetry(ctx, t, rm);
    this.drawBottomAnalytics(ctx, t, rm);
    ctx.restore();
  }

  // -------------------------------------------------------------------------------------------
  // Header + cognitive-stack flame graph + sub bar
  // -------------------------------------------------------------------------------------------
  drawHeader(ctx, t, rm) {
    this.text(ctx, '| STANFORD AI LAB / DISCOVERY ARCHITECTURE', 18, 19.5, '#f1f1f4', 14, 700);
    this.text(ctx, 'AGENT COGNITIVE STACK | 3 420 ITERATIONS | FLAME', 17, 41, '#8a8d99', 10, 500);
    this.text(ctx, 'GRAPH neo4j | NODES 14 280 | CYPHER-EDGES 68 400 | SESSIONS 100', 1063, 19.5, '#d6d6dc', 10, 600, 'right');
    const ratio = 65.6 + (rm ? 0 : Math.sin(t * LOOP * 4) * 0.25);
    this.text(ctx, `cypher/eval ${ratio.toFixed(1)} %`, 1063, 41, '#f3bd48', 10, 600, 'right');

    ctx.strokeStyle = '#1b1c25';
    ctx.lineWidth = 1;
    ctx.strokeRect(17.5, 48.5, 1045, 80);

    const glow = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * LOOP * 6);
    for (const [label, x, w, row, styleKey] of FLAME) {
      const [y, h, base] = FLAME_ROWS[row];
      const st = BLOCK_STYLES[styleKey];
      ctx.fillStyle = st.fill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = styleKey === 'cream' ? mixHex('#a8a48c', st.stroke, glow) : st.stroke;
      ctx.lineWidth = styleKey === 'cream' || styleKey === 'gold' ? 1.4 : 1.1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      this.text(ctx, label, x + 9, base, st.text, 9.6, 700);
    }

    this.text(ctx, 'AGENTDISCOVER | OPUS 5.5 PLANNER + GPT-6.1 SOL PROPOSER | WAVE 32 DEG | HACKS BLOCKED 404', 17, 146, '#6f727e', 10.1, 700);
    this.text(ctx, 'CONNECTOME R 120-480 | STRANDS 11 988 | ZERO CONTEXT BLEED', 1063, 146, '#bdbdc7', 10.1, 700, 'right');
    this.line(ctx, 17, 156.5, 1063, 156.5, '#0f1018');
  }

  // -------------------------------------------------------------------------------------------
  // Stage: 3D torus connectome
  // -------------------------------------------------------------------------------------------
  makeView(t, rm) {
    const k = rm ? 0 : 1;
    const yaw = TORUS.yaw + Math.sin(t * LOOP) * 2.6 * DEG * k;
    const pitch = TORUS.pitch + Math.sin(t * LOOP * 2) * 1.1 * DEG * k;
    const roll = TORUS.roll;
    this.view = {
      cyw: Math.cos(yaw), syw: Math.sin(yaw),
      cp: Math.cos(pitch), sp: Math.sin(pitch),
      cr: Math.cos(roll), sr: Math.sin(roll),
      yawDeg: 49 + (yaw - TORUS.yaw) / DEG,
      pitchDeg: 18.5 + (pitch - TORUS.pitch) / DEG,
    };
  }

  // Projects a model-space point; with a normal it also stores the camera-facing sign in PF.
  project(X, Y, Z, nx = 0, ny = 0, nz = 0) {
    const V = this.view;
    const x1 = X * V.cyw + Z * V.syw;
    const z1 = Z * V.cyw - X * V.syw;
    const y2 = Y * V.cp - z1 * V.sp;
    const z2 = Y * V.sp + z1 * V.cp;
    const s = TORUS.D / (TORUS.D - z2);
    PX = TORUS.cx + (x1 * V.cr - y2 * V.sr) * s;
    PY = TORUS.cy + (x1 * V.sr + y2 * V.cr) * s;
    PZ = z2;
    PS = s;
    if (nx || ny || nz) {
      const m1x = nx * V.cyw + nz * V.syw;
      const m1z = nz * V.cyw - nx * V.syw;
      const m2y = ny * V.cp - m1z * V.sp;
      const m2z = ny * V.sp + m1z * V.cp;
      PF = -m1x * x1 - m2y * y2 + m2z * (TORUS.D - z2);
    }
  }

  // Tube radius tapers to a soft tip at both ends of the C.
  taper(theta) {
    const a = smoothstep(0, 26 * DEG, theta - TORUS.arcStart);
    const b = smoothstep(0, 26 * DEG, TORUS.arcEnd - theta);
    return 0.62 + 0.38 * Math.min(a, b);
  }

  surface(theta, v, rho) {
    const cv = Math.cos(v), sv = Math.sin(v);
    const st = Math.sin(theta), ct = Math.cos(theta);
    const ring = TORUS.R + rho * cv;
    this.project(ring * st, -ring * ct, rho * sv, cv * st, -cv * ct, sv);
  }

  drawStage(ctx, t, rm) {
    ctx.strokeStyle = '#16171f';
    ctx.lineWidth = 1;
    ctx.strokeRect(17.5, 165.5, 760, 812);

    ['0 DEG', '85 DEG', '169 DEG', '254 DEG', '339 DEG'].forEach((label, i) => {
      this.text(ctx, label, 33, 218 + i * 158.75, '#73737f', 8.6, 700);
    });
    // Theta scan cursor riding the DEG ruler.
    const cursorY = 534.5 + 317.5 * Math.sin(0.4655 + (rm ? 0 : t * LOOP));
    ctx.fillStyle = '#d6d8bd';
    ctx.beginPath();
    ctx.moveTo(7.5, cursorY - 4);
    ctx.lineTo(13.5, cursorY);
    ctx.lineTo(7.5, cursorY + 4);
    ctx.closePath();
    ctx.fill();

    this.makeView(t, rm);
    this.computeCenterline();

    ctx.save();
    ctx.beginPath();
    ctx.rect(18, 166, 759, 811);
    ctx.clip();
    this.drawGuideRings(ctx);
    this.drawNeedles(ctx, t, rm);
    this.drawTubeBody(ctx);
    this.drawStrands(ctx, t, rm);
    this.drawHackDots(ctx, t, rm);
    this.drawCandidate(ctx, t, rm);
    ctx.restore();
  }

  computeCenterline() {
    const C = this.center;
    const { R, r } = TORUS;
    for (let k = 0; k <= 360; k++) {
      const th = k * DEG;
      this.project(R * Math.sin(th), -R * Math.cos(th), 0);
      C[k * 5] = PX;
      C[k * 5 + 1] = PY;
      C[k * 5 + 4] = r * PS;
    }
    for (let k = 0; k <= 360; k++) {
      const a = ((k + 359) % 360) * 5, b = ((k + 1) % 360) * 5;
      const tx = C[b] - C[a], ty = C[b + 1] - C[a + 1];
      const len = Math.hypot(tx, ty) || 1;
      C[k * 5 + 2] = ty / len;
      C[k * 5 + 3] = -tx / len;
    }
  }

  drawGuideRings(ctx) {
    for (const [rad, ox, oy, oz, ta, tb, color, width] of GUIDE_RINGS) {
      const ca = Math.cos(ta), sa = Math.sin(ta), cb = Math.cos(tb), sb = Math.sin(tb);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const th = (k / 120) * TAU;
        const x = rad * Math.sin(th), y = -rad * Math.cos(th);
        const y1 = y * ca, z1 = y * sa;
        this.project(ox + x * cb + z1 * sb, oy + y1, oz - x * sb + z1 * cb);
        if (k === 0) ctx.moveTo(PX, PY);
        else ctx.lineTo(PX, PY);
      }
      ctx.stroke();
    }
  }

  drawNeedles(ctx, t, rm) {
    const C = this.center;
    const wavePhase = rm ? 0 : t * LOOP * 3;
    const tips = [];
    GEO.buckets.forEach((bucket, b) => {
      if (!bucket.length) return;
      const warm = b < 4;
      const color = warm ? WARM_NEEDLES[b] : COOL_NEEDLES[b - 4];
      ctx.strokeStyle = rgba(color, warm ? 0.85 : 0.82);
      ctx.lineWidth = warm ? 0.85 : 1.05;
      ctx.beginPath();
      for (const n of bucket) {
        const fk = n.theta / DEG;
        const k0 = Math.floor(fk), f = fk - k0;
        const i0 = k0 * 5, i1 = (k0 + 1) * 5;
        const cx = C[i0] + (C[i1] - C[i0]) * f;
        const cy = C[i0 + 1] + (C[i1 + 1] - C[i0 + 1]) * f;
        const nx = C[i0 + 2] + (C[i1 + 2] - C[i0 + 2]) * f;
        const ny = C[i0 + 3] + (C[i1 + 3] - C[i0 + 3]) * f;
        const hw = C[i0 + 4] + (C[i1 + 4] - C[i0 + 4]) * f;
        const cj = Math.cos(n.jitter), sj = Math.sin(n.jitter);
        const dx = nx * cj - ny * sj, dy = nx * sj + ny * cj;
        const wave = 1 + 0.13 * Math.sin(3 * n.theta - wavePhase + n.phase * 0.25);
        const reach = hw + n.len * wave;
        const bx = cx + nx * hw * n.base, by = cy + ny * hw * n.base;
        const tx = cx + dx * reach, ty = cy + dy * reach;
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        if (n.pearl) tips.push(tx, ty, n.pearl, warm ? 1 : 0);
      }
      ctx.stroke();
    });

    // Pearl tips: soft halo then crisp core.
    ctx.fillStyle = 'rgba(244, 244, 245, 0.16)';
    ctx.beginPath();
    for (let i = 0; i < tips.length; i += 4) {
      if (tips[i + 3]) continue;
      ctx.moveTo(tips[i] + tips[i + 2] + 1.6, tips[i + 1]);
      ctx.arc(tips[i], tips[i + 1], tips[i + 2] + 1.6, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = '#f4f4f5';
    ctx.beginPath();
    for (let i = 0; i < tips.length; i += 4) {
      if (tips[i + 3]) continue;
      ctx.moveTo(tips[i] + tips[i + 2], tips[i + 1]);
      ctx.arc(tips[i], tips[i + 1], tips[i + 2], 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(240, 214, 176, 0.55)';
    ctx.beginPath();
    for (let i = 0; i < tips.length; i += 4) {
      if (!tips[i + 3]) continue;
      ctx.moveTo(tips[i] + tips[i + 2], tips[i + 1]);
      ctx.arc(tips[i], tips[i + 1], tips[i + 2], 0, TAU);
    }
    ctx.fill();
  }

  drawTubeBody(ctx) {
    const { NU, NV, pts } = this.grid;
    const { r, arcStart, arcEnd } = TORUS;
    for (let i = 0; i <= NU; i++) {
      const th = arcStart + ((arcEnd - arcStart) * i) / NU;
      const rho = r * this.taper(th);
      for (let j = 0; j <= NV; j++) {
        this.surface(th, (j / NV) * TAU, rho);
        const o = (i * (NV + 1) + j) * 3;
        pts[o] = PX;
        pts[o + 1] = PY;
        pts[o + 2] = PZ;
      }
    }

    const quads = this.quads;
    quads.length = 0;
    const V = this.view;
    for (let i = 0; i < NU; i++) {
      const th = arcStart + ((arcEnd - arcStart) * (i + 0.5)) / NU;
      const st = Math.sin(th), ct = Math.cos(th);
      // The upper end keeps a lit cap; the lower end dissolves into shadow under its frayed strands.
      const endFade = Math.min(0.55 + 0.45 * smoothstep(0, 20 * DEG, th - arcStart), smoothstep(-6 * DEG, 48 * DEG, arcEnd - th));
      const rho = r * this.taper(th);
      for (let j = 0; j < NV; j++) {
        const v = ((j + 0.5) / NV) * TAU;
        const cv = Math.cos(v), sv = Math.sin(v);
        const nx = cv * st, ny = -cv * ct, nz = sv;
        const ring = TORUS.R + rho * cv;
        this.project(ring * st, -ring * ct, rho * sv, nx, ny, nz);
        if (PF <= 0) continue;
        // Lighting in camera space.
        const m1x = nx * V.cyw + nz * V.syw;
        const m1z = nz * V.cyw - nx * V.syw;
        const m2y = ny * V.cp - m1z * V.sp;
        const m2z = ny * V.sp + m1z * V.cp;
        const diffuse = Math.max(0, m1x * LIGHT[0] + m2y * LIGHT[1] + m2z * LIGHT[2]);
        const facing = clamp(m2z, 0, 1);
        const shade = clamp((0.1 + 0.9 * diffuse * diffuse) * (0.62 + 0.38 * facing) * (0.12 + 0.88 * endFade), 0, 1);
        const a = (i * (NV + 1) + j) * 3, b = ((i + 1) * (NV + 1) + j) * 3;
        const z = pts[a + 2] + pts[b + 2] + pts[a + 5] + pts[b + 5];
        quads.push([z, a, b, Math.round(shade * 39)]);
      }
    }
    quads.sort((p, q) => p[0] - q[0]);

    for (const [, a, b, shade] of quads) {
      const c = a + 3, d = b + 3;
      const mx = (pts[a] + pts[b] + pts[c] + pts[d]) / 4;
      const my = (pts[a + 1] + pts[b + 1] + pts[c + 1] + pts[d + 1]) / 4;
      ctx.fillStyle = BODY_SHADES[shade];
      ctx.beginPath();
      // Grow each quad ~0.6 px around its centroid so adjacent facets overlap without seams.
      for (const [o, first] of [[a, true], [b, false], [d, false], [c, false]]) {
        const ex = pts[o] - mx, ey = pts[o + 1] - my;
        const k = 1 + 0.6 / (Math.hypot(ex, ey) || 1);
        if (first) ctx.moveTo(mx + ex * k, my + ey * k);
        else ctx.lineTo(mx + ex * k, my + ey * k);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  drawStrands(ctx, t, rm) {
    const { r, arcStart, arcEnd } = TORUS;
    const STEP = 3 * DEG;
    const pulses = [];
    for (const s of GEO.strands) {
      const spin = rm ? 0 : s.spin * t;
      const n = Math.max(2, Math.ceil((s.end - s.start) / STEP) + 1);
      const dt = (s.end - s.start) / (n - 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      let pen = false;
      const head = s.pulse >= 0 ? fract(s.pulse + (rm ? 0 : t * LOOP * 2 / TAU)) * (n - 1) : -99;
      let pulsePts = null;
      for (let k = 0; k < n; k++) {
        const th = s.start + k * dt;
        const along = th - s.start;
        const v = s.v0 + s.twist * along + spin;
        const thN = arcStart + ((((th - arcStart) % TAU) + TAU) % TAU);
        const inside = thN <= arcEnd;
        // Strands fray outward where the C terminates, like the loose end of a rope.
        const endDist = inside ? Math.min(thN - arcStart, arcEnd - thN) : -Math.min(thN - arcEnd, arcStart + TAU - thN);
        let rho = r * this.taper(inside ? thN : arcEnd) * s.lift * (1 + s.fray * 0.75 * (1 - smoothstep(-8 * DEG, 30 * DEG, endDist)));
        if (s.wild) rho *= 1 + s.wild * Math.sin(s.wildFreq * along + s.v0);
        this.surface(th, v, rho);
        const visible = PF > 0 || !inside;
        if (visible) {
          if (pen) ctx.lineTo(PX, PY);
          else ctx.moveTo(PX, PY);
          pen = true;
          if (k <= head && k >= head - 4) (pulsePts ||= []).push(PX, PY);
        } else {
          pen = false;
        }
      }
      ctx.stroke();
      if (pulsePts && pulsePts.length >= 4) pulses.push([s, pulsePts]);
    }
    for (const [s, p] of pulses) {
      ctx.strokeStyle = s.pulseColor;
      ctx.lineWidth = s.width + 0.7;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.stroke();
    }
  }

  drawHackDots(ctx, t, rm) {
    const { r } = TORUS;
    HACK_DOTS.forEach(([thDeg, v], i) => {
      const th = thDeg * DEG;
      this.surface(th, v, r * this.taper(th) * 1.08);
      if (PF <= 0) return;
      const pulse = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * LOOP * 5 + i * 1.7);
      const g = ctx.createRadialGradient(PX, PY, 0, PX, PY, 8.5);
      g.addColorStop(0, `rgba(244, 63, 94, ${0.62 + 0.2 * pulse})`);
      g.addColorStop(0.45, `rgba(225, 60, 84, ${0.42 + 0.12 * pulse})`);
      g.addColorStop(1, 'rgba(225, 60, 84, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(PX, PY, 8.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8566c';
      ctx.beginPath();
      ctx.arc(PX, PY, 2.6 + 0.5 * pulse, 0, TAU);
      ctx.fill();
    });
  }

  // Centerline anchor of the candidate spike under the rest pose (t = 0, no sway).
  candidateAnchor() {
    if (!this.anchor0) {
      const saved = this.view;
      this.makeView(0, true);
      this.project(TORUS.R * Math.sin(CANDIDATE_THETA), -TORUS.R * Math.cos(CANDIDATE_THETA), 0);
      this.anchor0 = [PX, PY];
      this.view = saved;
    }
    return this.anchor0;
  }

  drawCandidate(ctx, t, rm) {
    // The reticle rides the tip of a bright spike rooted on the lower-left of the ring.
    const C = this.center;
    const k = Math.round(CANDIDATE_THETA / DEG) * 5;
    const [ax, ay] = this.candidateAnchor();
    const tx = 207.5 + (C[k] - ax);
    const ty = 867.5 + (C[k + 1] - ay);
    const spikeX = C[k] + C[k + 2] * C[k + 4] * 0.9;
    const spikeY = C[k + 1] + C[k + 3] * C[k + 4] * 0.9;
    const grad = ctx.createLinearGradient(spikeX, spikeY, tx, ty);
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.1)');
    grad.addColorStop(1, 'rgba(250, 214, 150, 0.85)');
    this.line(ctx, spikeX, spikeY, tx, ty, grad, 1.2);

    const boxX = 33, boxY = 724, boxW = 297.5, boxH = 45.5;
    ctx.fillStyle = 'rgba(8, 9, 26, 0.86)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#b9973f';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
    this.line(ctx, tx, ty, boxX + boxW, boxY + 23, '#d1b03e', 1.2);

    const pulse = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * LOOP * 8);
    const halo = ctx.createRadialGradient(tx, ty, 4, tx, ty, 18 + 3 * pulse);
    halo.addColorStop(0, `rgba(250, 245, 225, ${0.16 + 0.12 * pulse})`);
    halo.addColorStop(1, 'rgba(250, 245, 225, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(tx, ty, 18 + 3 * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#e6e6dc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(tx, ty, 10.5, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      ctx.moveTo(tx + dx * 10.5, ty + dy * 10.5);
      ctx.lineTo(tx + dx * 14.5, ty + dy * 14.5);
    }
    ctx.stroke();
    ctx.fillStyle = '#fffef6';
    ctx.beginPath();
    ctx.arc(tx, ty, 4.6, 0, TAU);
    ctx.fill();

    this.text(ctx, 'CANDIDATE cand-0428 | SHA-256 0x8F | SOTA 0.994', boxX + 10, boxY + 18, '#e3a93a', 9.2, 700);
    this.text(ctx, 'OPUS PLAN: CYPHER MCTS HOP | GPT-6.1 SOL CODE-GEN', boxX + 10, boxY + 34.5, '#c6c6ce', 9.2, 500);
  }

  // -------------------------------------------------------------------------------------------
  // Right telemetry column
  // -------------------------------------------------------------------------------------------
  drawRightTelemetry(ctx, t, rm) {
    const L = 807.5, Rr = 1049;
    const m = rm ? 0 : 1;
    ctx.strokeStyle = '#16171f';
    ctx.lineWidth = 1;
    ctx.strokeRect(793.5, 165.5, 269, 812);

    const title = (s, y) => this.text(ctx, s, L, y, '#8e8e9c', 10.1, 500);

    // 1) DISCOVERY LOAD - 90 S
    title('DISCOVERY LOAD - 90 S', 186);
    this.text(ctx, '101.0', Rr, 186, '#e9b44c', 9.8, 700, 'right');
    const scroll = m * ((t * 34.5 * 6) / 24);
    ctx.strokeStyle = '#d6a77c';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 807; x <= 1046; x += 1) {
      const local = ((((x - 809 + scroll) % 34.5) + 34.5) % 34.5);
      let y;
      if (local < 3) y = 218.75 - (local / 3) * 17.5;
      else if (local < 12) y = 201.25;
      else if (local < 15) y = 201.25 + ((local - 12) / 3) * 17.5;
      else y = 218.75;
      if (x === 807) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    this.text(ctx, 'CYPHER QUERIES / S', L, 234.5, '#7a7a88', 9.2, 500);
    this.text(ctx, '281', Rr, 234.5, '#4f9fd3', 9, 700, 'right');
    ctx.strokeStyle = '#56789c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const ph = m * t * LOOP;
    for (let x = 807; x <= 1046; x += 2) {
      const y = 243.3 + 1.6 * Math.sin(x * 0.115 - ph * 8) + 1.1 * Math.sin(x * 0.043 + ph * 3 + 1.3);
      if (x === 807) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    this.text(ctx, 'HACKS BLOCKED / S', L, 254.5, '#b3203f', 9.2, 500);
    this.text(ctx, '3.8', Rr, 254.5, '#c2304e', 9, 700, 'right');
    const humps = [824.75, 878.5, 929.75, 976, 1014.75];
    const hs = m * ((t * 239 * 2) / 24);
    ctx.strokeStyle = 'rgba(214, 51, 94, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 807; x <= 1046; x += 1.5) {
      let y = 268.5;
      for (const hx of humps) {
        let d = ((x - hx + hs) % 239 + 239) % 239;
        if (d > 119.5) d -= 239;
        y -= 7 * Math.exp(-(d * d) / 72);
      }
      if (x === 807) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2) IDEA DIVERSITY BY THETA | 48 BINS — 48 stacked theta bins forming three lobes.
    title('IDEA DIVERSITY BY THETA | 48 BINS', 289.5);
    const lobeShift = m * ((t * 15.3) / 24);
    const grad = ctx.createLinearGradient(807, 0, 1035, 0);
    grad.addColorStop(0, '#3d5550');
    grad.addColorStop(0.55, '#4a605a');
    grad.addColorStop(1, '#3a4d49');
    ctx.fillStyle = grad;
    for (let i = 0; i < 48; i++) {
      const u = ((((i - 4 - lobeShift + 7.65) % 15.3) + 15.3) % 15.3) - 7.65;
      const tri = 1 - Math.abs(u) / 7.65;
      const len = 73 + 153 * Math.pow(tri, 0.55);
      ctx.fillRect(807, 296.5 + i * 1.79, len, 1.85);
    }
    const markY = 339.5 + (rm ? 0 : Math.sin(t * LOOP * 2) * 34);
    ctx.fillStyle = '#d4d4d8';
    ctx.beginPath();
    ctx.moveTo(800.5, markY - 3.5);
    ctx.lineTo(805.5, markY);
    ctx.lineTo(800.5, markY + 3.5);
    ctx.closePath();
    ctx.fill();

    // 3) MODEL COMPUTE SPLIT | 2 HISTOGRAM
    title('MODEL COMPUTE SPLIT | 2 HISTOGRAM', 401.5);
    this.text(ctx, 'OPUS 5.5: 38%', L, 415.5, '#f59e0b', 9.3, 700);
    this.text(ctx, 'GPT-6.1 SOL: 62%', Rr, 415.5, '#60a5fa', 9.3, 700, 'right');
    SPLIT_BARS.forEach(([h, color], i) => {
      const hh = h * (1 + m * 0.07 * Math.sin(t * LOOP * 3 + i * 0.8));
      ctx.fillStyle = color;
      ctx.fillRect(807.5 + i * 13.47, 462.5 - hh, 10, hh);
    });

    // 4) CYCLE STATE | SYNCHRONIZER
    title('CYCLE STATE | SYNCHRONIZER', 487.5);
    const solFill = 33 + m * 22 * (0.5 - 0.5 * Math.cos(t * LOOP * 4));
    const cycle = [
      ['01 SOL PROPOSE', solFill, 'ACTIVE', '#56b4e0', '#38bdf8'],
      ['02 OPUS CYPHER', 9, 'READY', '#e4e4e7', '#d4d4d8'],
      ['03 ISOLATED EVAL', 9, 'ARMED', '#e4e4e7', '#d4d4d8'],
      ['04 META DISTILL', 83.5, 'WAIT', '#e4e4e7', '#d4d4d8'],
    ];
    cycle.forEach(([label, fill, status, barColor, statusColor], i) => {
      const y = 506 + i * 15.67;
      this.text(ctx, label, L, y, '#83838f', 8.8, 500);
      ctx.fillStyle = '#16181f';
      ctx.fillRect(910, y - 5.5, 93, 4);
      ctx.fillStyle = barColor;
      ctx.fillRect(910, y - 5.5, fill, 4);
      this.text(ctx, status, Rr, y, statusColor, 8.8, 700, 'right');
    });

    // 5) TELEMETRY READOUT
    title('TELEMETRY READOUT', 587);
    const V = this.view;
    const hacks = 428 + Math.floor(m * t * 0.5);
    const cycleNo = 144 + Math.floor(m * t / 3);
    READOUT.forEach(([label, value, color], i) => {
      const y = 603.5 + i * 12.78;
      let val = value;
      if (label === 'YAW / PITCH') val = `${V.yawDeg.toFixed(1)} / ${V.pitchDeg.toFixed(1)} DEG`;
      if (label === 'HACKS BLOCKED') val = String(hacks);
      if (label === 'CYCLE / FPS') val = `#${cycleNo} | 60.0`;
      this.text(ctx, label, L, y, '#696977', 9.2, 500);
      this.text(ctx, val, Rr, y, color, 9.2, 700, 'right');
    });

    // 6) ISOLATED SANDBOX PODS | 32 PODS
    title('ISOLATED SANDBOX PODS | 32 PODS', 717.5);
    this.text(ctx, 'ACTIVE: 31/32 | RUN: APPTAINER | LEAK: 0.0%', L, 729.5, '#e4e4e7', 8.8, 700);
    const step = Math.floor(m * t / 1.5);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = row * 8 + col;
        let color = POD_GRID[row][col];
        if (step > 0 && rand(cell * 13.7 + step * 3.1) < 0.16) {
          color = POD_PALETTE[Math.floor(rand(cell * 7.3 + step) * POD_PALETTE.length)];
        }
        ctx.fillStyle = color;
        ctx.fillRect(807.7 + col * 30.62, 737.3 + row * 12.9, 27.7, 9.3);
      }
    }

    // 7) DISPATCH QUEUE | LIVE COMMITS
    title('DISPATCH QUEUE | LIVE COMMITS', 813);
    const lat = (base, i) => `+${(base + m * 0.1 * Math.floor(2.99 * (0.5 - 0.5 * Math.cos(t * LOOP * 6 + i * 2.1)))).toFixed(1)}ms`;
    const commits = [
      ['sol.code   -> sandbox.run', lat(0.4, 0), '#8a8a98'],
      ['eval.bench -> score.valid', lat(1.1, 1), '#8a8a98'],
      ['isolate.chk-> leak.none', 'PASSED', '#2a9a72'],
      ['meta.lesson-> graph.edge', `#${14284 + Math.floor(m * t / 2)}`, '#f0a040'],
    ];
    commits.forEach(([cmd, value, color], i) => {
      const y = 833.5 + i * 13.8;
      this.text(ctx, '>', L, y, '#c06a28', 8.9, 700);
      this.text(ctx, cmd, 819.5, y, '#c9c9d1', 8.9, 500);
      this.text(ctx, value, Rr, y, color, 8.9, 500, 'right');
    });

    for (const y of [276.5, 388.5, 473.5, 572.5, 703.5, 798.5, 899.5]) this.line(ctx, L, y, Rr, y, '#111118');
    this.text(ctx, 'KEY', L, 913, '#6f6f7c', 8.9, 500);
    this.text(ctx, '- SOL', L, 926, '#6f6f7c', 8.9, 500);
    ctx.fillStyle = '#f4f4f5';
    ctx.beginPath();
    ctx.arc(871.3, 923, 1.7, 0, TAU);
    ctx.fill();
    this.text(ctx, 'IDEA', 877.5, 926, '#6f6f7c', 8.9, 500);
    this.text(ctx, '- OPUS', 929.3, 926, '#6f6f7c', 8.9, 500);
    this.text(ctx, '!', 989.3, 926, '#b3203f', 8.9, 700);
    this.text(ctx, 'HACK', 1000, 926, '#6f6f7c', 8.9, 500);
    this.text(ctx, 'SYSTEM BUFFER', L, 937.5, '#7a7a88', 9.2, 500);
    this.text(ctx, '99.8 % VERIFIED', Rr, 937.5, '#2fae86', 9.2, 500, 'right');
    const shimmer = m ? fract(t / 3) * 23 - 2 : -10;
    for (let i = 0; i < 20; i++) {
      const hot = Math.abs(i - shimmer) < 1;
      ctx.fillStyle = i === 19 ? '#141c1a' : hot ? '#6ee7b7' : '#2fae80';
      ctx.fillRect(808 + i * 12.28, 944.3, 9.7, 5.8);
    }
  }

  // -------------------------------------------------------------------------------------------
  // Bottom: braided token stream + 3 analytic cards + footer
  // -------------------------------------------------------------------------------------------
  drawBottomAnalytics(ctx, t, rm) {
    const m = rm ? 0 : 1;
    ctx.strokeStyle = '#1b1c25';
    ctx.lineWidth = 1;
    ctx.strokeRect(17.5, 990.5, 1045, 66);
    this.text(ctx, 'MODEL TOKEN FLOW & COMPUTE SPEND | 30 MIN | STREAM', 31, 1009, '#8a8a98', 10.1, 500);
    this.text(ctx, '3.56 B TOK / MIN', 1049, 1009.5, '#f0b44c', 11.6, 700, 'right');
    this.drawTokenStream(ctx, t, m);
    this.text(ctx, 'sol.code', 41, 1048.5, '#2f6fa8', 8.9, 500);
    this.text(ctx, 'opus.plan', 167, 1048.5, '#b5582a', 8.9, 500);
    this.text(ctx, 'eval.isolate', 293, 1048.5, '#2a8a6a', 8.9, 500);

    const cards = [
      [17.5, 297, 'DISCOVERY MERGES BY DOMAIN', 31],
      [322.5, 419, 'BENCHMARK METRICS | BEFORE - AFTER', 337],
      [749.5, 313, 'EVALUATOR REJECTIONS | PARETO', 763],
    ];
    for (const [x, w, title, tx] of cards) {
      ctx.strokeStyle = '#1b1c25';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 1068.5, w, 262);
      this.text(ctx, title, tx, 1088.5, '#8a8a98', 10.1, 500);
    }
    this.drawRose(ctx, t, m);
    this.drawDumbbells(ctx, t, m);
    this.drawPareto(ctx, t, m);

    this.text(ctx, 'SOURCE: STANFORD AI LAB & AGENTDISCOVER | DUAL-ENGINE CONNECTOME | OPUS 5.5 + GPT-6.1 SOL', 17, 1336.5, '#4b4f5d', 9, 700);
    this.text(ctx, 'FRAME 60.0 FPS | SYNTHETIC TELEMETRY | 1080x1350 TERMINAL CANVAS', 1062, 1336.5, '#4b4f5d', 9, 700, 'right');
  }

  // Braided rope: three bundles (sol / opus / eval) of thin strands weaving with long lens crossings,
  // pinched into a capsule terminal on the right.
  // Lens phase: integer values are the pinch points measured at x = 100, 500 and the capsule (1040).
  streamY(x, bundle, strand, flow, ph) {
    const lens = x <= 500 ? (x - 100) / 400 : 1 + (x - 500) / 540;
    const k = (x - 31) / 1012;
    const spread = Math.abs(Math.sin(Math.PI * (lens - flow))) * (1 - smoothstep(0.94, 1, k)) * (0.55 + 0.45 * smoothstep(0, 0.05, k));
    const order = [-1, -0.15, 1][bundle];
    const cross = 0.45 * Math.sin(TAU * x / 290 + bundle * 2.1 + ph);
    const fiber = (strand - 1) * 0.32 + 0.12 * Math.sin(TAU * x / 97 + strand * 1.7 + ph * 2);
    return 1028.5 + 5.2 * spread * (order + cross * 0.6 + fiber);
  }

  drawTokenStream(ctx, t, m) {
    const x0 = 31, x1 = 1043;
    const ph = m * t * LOOP;
    // Pinch points drift downstream two lens-lengths per loop.
    const flow = m * (t / 24) * -2;
    const haze = ctx.createLinearGradient(0, 1016, 0, 1044);
    haze.addColorStop(0, 'rgba(70, 40, 90, 0)');
    haze.addColorStop(0.5, 'rgba(58, 52, 92, 0.2)');
    haze.addColorStop(1, 'rgba(70, 40, 90, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(x0, 1016, x1 - x0, 28);

    const bundles = [
      ['rgba(110, 168, 196, 0.7)', 'rgba(150, 190, 210, 0.45)', 'rgba(80, 136, 180, 0.5)'],
      ['rgba(176, 140, 104, 0.68)', 'rgba(200, 170, 130, 0.42)', 'rgba(140, 100, 70, 0.5)'],
      ['rgba(110, 168, 132, 0.68)', 'rgba(160, 196, 170, 0.42)', 'rgba(70, 140, 116, 0.5)'],
    ];
    for (let b = 0; b < 3; b++) {
      for (let s = 0; s < 3; s++) {
        ctx.strokeStyle = bundles[b][s];
        ctx.lineWidth = s === 0 ? 1.7 : 1.2;
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 4) {
          const y = this.streamY(x, b, s, flow, ph);
          if (x === x0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    // Capsule terminal where the braid converges.
    ctx.fillStyle = '#8f9894';
    ctx.beginPath();
    ctx.moveTo(1037, 1027.4);
    ctx.lineTo(1043.4, 1027.4);
    ctx.arc(1043.4, 1030, 2.6, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(1037, 1032.6);
    ctx.closePath();
    ctx.fill();
    // Travelling node pearls riding one strand of each bundle.
    for (let b = 0; b < 3; b++) {
      const k = fract(b / 3 + 0.12 + m * t / 8);
      const x = x0 + k * (x1 - x0);
      const y = this.streamY(x, b, 0, flow, ph);
      ctx.fillStyle = 'rgba(236, 244, 240, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, TAU);
      ctx.fill();
    }
  }

  drawRose(ctx, t, m) {
    const cx = 166.5, cy = 1208;
    ctx.strokeStyle = '#12141c';
    ctx.lineWidth = 1;
    for (const rr of [40, 60, 80]) {
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.stroke();
    }
    ROSE.forEach(([rad, kind], i) => {
      const a0 = -Math.PI / 2 + i * 30 * DEG;
      const rr = rad * (1 + m * 0.045 * Math.sin(t * LOOP * 2 + i * 1.3));
      if (kind === 'gold') {
        const g = ctx.createRadialGradient(cx, cy, 18, cx, cy, rr);
        g.addColorStop(0, '#eaa22c');
        g.addColorStop(1, '#c47c0c');
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = kind === 'blue' ? '#1b5f86' : '#1f2433';
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rr, a0, a0 + 30 * DEG);
      ctx.closePath();
      ctx.fill();
    });
    const na = 193 * DEG + m * Math.sin(t * LOOP * 2) * 4 * DEG;
    this.line(ctx, cx + Math.cos(na) * 20, cy + Math.sin(na) * 20, cx + Math.cos(na) * 88, cy + Math.sin(na) * 88, 'rgba(236, 222, 168, 0.9)', 1.4);
    ctx.fillStyle = '#07070c';
    ctx.beginPath();
    ctx.arc(cx, cy, 19.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#9a7a3e';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    this.text(ctx, String(14278 + Math.floor(m * t / 4)), cx, cy + 3.6, '#e0a040', 10, 700, 'center');
    this.text(ctx, 'KERNEL', 166, 1116.5, '#cfcfd6', 8.9, 700, 'center');
    this.text(ctx, 'MATH', 166, 1307, '#cfcfd6', 8.9, 700, 'center');
    this.text(ctx, 'SYSTEMS', 39, 1211.5, '#cfcfd6', 8.9, 700);
    this.text(ctx, 'BIO', 262.5, 1211.5, '#cfcfd6', 8.9, 700);
  }

  drawDumbbells(ctx, t, m) {
    const X = v => 475.5 + v * 0.275;
    BENCH.forEach(([label, after, before, phase, delta, deltaColor, kind], i) => {
      const base = 1118 + i * 32.7;
      const y = base - 3.5;
      this.text(ctx, label, 337, base, '#d0d0d8', 9.4, 500);
      const xa = X(after), xb = X(before);
      this.line(ctx, xa, y, xb, y, '#2a2a33', 2);
      ctx.strokeStyle = '#7a7a84';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(xb, y, 5, 0, TAU);
      ctx.stroke();
      if (kind !== 'red') {
        const k = fract(phase + m * t / 6);
        const px = xb + (xa - xb) * k;
        ctx.fillStyle = kind === 'green' ? '#34d399' : '#d8c25a';
        ctx.beginPath();
        ctx.arc(px, y, 1.9, 0, TAU);
        ctx.fill();
      }
      if (kind === 'red') {
        const p = m ? 0.5 + 0.5 * Math.sin(t * LOOP * 6) : 0.5;
        ctx.fillStyle = 'rgba(127, 18, 40, 0.55)';
        ctx.beginPath();
        ctx.arc(xa, y, 10.5 + p, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(190, 40, 64, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#f0506a';
        ctx.beginPath();
        ctx.arc(xa, y, 5, 0, TAU);
        ctx.fill();
      } else if (kind === 'green') {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.beginPath();
        ctx.arc(xa, y, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(xa, y, 5, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.arc(xa, y, 5, 0, TAU);
        ctx.fill();
      }
      this.text(ctx, delta, 728, base, deltaColor, 9.7, 700, 'right');
    });
    this.line(ctx, 474, 1315.5, 642, 1315.5, '#1c1d25');
    ['0', '200', '400', '600'].forEach((s, i) => this.text(ctx, s, 475.5 + i * 55, 1328, '#8a8a98', 8.5, 500, 'center'));
  }

  drawPareto(ctx, t, m) {
    PARETO.forEach(([, h], i) => {
      const x = 765 + i * 40;
      const hh = h * (1 + m * 0.04 * Math.sin(t * LOOP * 3 + i));
      if (i === 4) {
        ctx.fillStyle = '#a8740e';
        ctx.fillRect(x, 1262.5 - hh, 34, hh);
        ctx.strokeStyle = '#e2b443';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(x + 0.5, 1262.5 - hh + 0.5, 33, hh - 1);
      } else {
        ctx.fillStyle = '#0e5472';
        ctx.fillRect(x, 1262.5 - hh, 34, hh);
      }
    });
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    PARETO.forEach(([, , y], i) => {
      const x = 782 + i * 40;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    PARETO.forEach(([, , y], i) => {
      ctx.fillStyle = i === 0 ? '#c8ecff' : '#f4f4f5';
      ctx.beginPath();
      ctx.arc(782 + i * 40, y, i === 0 ? 3 : 2.6, 0, TAU);
      ctx.fill();
    });
    const kp = m ? 0.5 + 0.5 * Math.sin(t * LOOP * 6) : 0.5;
    ctx.fillStyle = `rgba(200, 144, 32, ${0.35 + 0.2 * kp})`;
    ctx.beginPath();
    ctx.arc(866, 1139.5, 7.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(866, 1139.5, 6.5 + kp, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = '#f5c842';
    ctx.beginPath();
    ctx.arc(866, 1139.5, 3.2, 0, TAU);
    ctx.fill();

    this.text(ctx, '100 %', 1053, 1118.5, '#8a8a98', 8, 500, 'right');
    this.text(ctx, '50 %', 1053, 1188.5, '#8a8a98', 8, 500, 'right');
    PARETO.forEach(([label], i) => {
      ctx.save();
      ctx.translate(779 + i * 40, 1274);
      ctx.rotate(-40 * DEG);
      this.text(ctx, label, 0, 0, i === 4 ? '#ffffff' : '#c4c4cc', 8.5, i === 4 ? 700 : 500);
      ctx.restore();
    });
  }
}
