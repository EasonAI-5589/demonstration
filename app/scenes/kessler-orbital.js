// Scene 03: KESSLER WATCH // CONJUNCTION DESK
// Reconstructed from the 1080×1300 reference keyframe. All geometry below is in that design space and is
// drawn into the 1080×1350 stage with a 1350/1300 vertical scale, which is exactly how the stage reference
// was produced. The globe uses the constellation fitted to the keyframe: Walker 48/6/1 at i = 53°,
// 550 km, camera tilt 22° (sub-pixel residual), with the Earth texture mirrored like the original.
const WIDTH = 1080;
const HEIGHT = 1350;
const DESIGN_H = 1300;
const SY = HEIGHT / DESIGN_H;
const FONT = '"JetBrains Mono", "JetBrainsMono NF", "JetBrainsMono Nerd Font", "JetBrainsMono Nerd Font Mono", "IBM Plex Mono", "SF Mono", "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace';
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a, b, x) => {
  const k = clamp((x - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const easeOutCubic = k => 1 - (1 - k) ** 3;
const pad2 = n => String(n).padStart(2, '0');
const mmss = s => `${pad2(Math.floor(Math.max(0, s) / 60))}:${pad2(Math.max(0, s) % 60)}`;
const hms = s => `${pad2(Math.floor(s / 3600) % 24)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
const rgba = (hex, a) => {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`;
};

const C = {
  page: '#04060a',
  frame: '#2b2c31',
  body: '#060a0d',
  bodyOrbit: '#05060a',
  strip: '#0d0f15',
  border: '#15191c',
  title: '#c6c9d0',
  cyan: '#94cde2',
  orange: '#e57b3b',
  red: '#e5505b',
  green: '#62d391',
  lavender: '#a09ae6',
};

const PANELS = {
  sensor: [8, 38, 261, 409],
  debris: [8, 418, 261, 629],
  orbital: [270, 38, 801, 629],
  conj: [810, 38, 1071, 629],
  maneuver: [8, 638, 359, 959],
  pc: [368, 638, 719, 959],
  ground: [728, 638, 1071, 959],
  event: [8, 968, 535, 1291],
  fleet: [544, 968, 1071, 1291],
};

const SIM_DATE = '2026-10-19';
const SIM_T0 = 13 * 3600 + 52 * 60;

// ── Sensor network ────────────────────────────────────────────────────────────────────────────────
// gap: seconds between passes for idle sites (bar = fraction of the gap elapsed); pass: active-pass progress.
const SENSORS = [
  { name: 'KIRUNA', tag: 'RADAR', coords: '67.8°N 20.2°E', obs: 11, sigma: 33, next: 300, active: false, wait: 0 },
  { name: 'ATACAMA', tag: 'OPTICAL', coords: '24.6°S 70.4°W', obs: 23, sigma: 32, next: 203, active: true, pass: 0.32 },
  { name: 'PALAU', tag: 'RADAR', coords: '7.4°N 134.5°E', obs: 23, sigma: 29, next: 106, active: true, pass: 0.65 },
  { name: 'MT STROMLO', tag: 'LASER', coords: '35.3°S 149.0°E', obs: 7, sigma: 27, next: 9, active: false, wait: 0.97 },
];

// ── Debris band histogram (36 × 25 km bins from 300 km), tops measured from the keyframe ─────────────
const BAR_TOPS = [559, 558, 560, 558, 558, 551, 542, 537, 530, 537, 533, 532, 530, 534, 529, 529, 519, 518,
  501, 490, 487, 478, 462, 500, 526, 543, 548, 551, 558, 560, 558, 560, 559, 557, 560, 560];

// ── Conjunction queue ───────────────────────────────────────────────────────────────────────────────
const CONJ = [
  { tca: 48, sat: 'KW-5A', deb: 'NOAA 16 DEB 19213', miss: '1,835', sigma: 105, pc: '<1e-10', state: 'BURN DONE' },
  { tca: 98, sat: 'KW-3B', deb: 'COSMOS-1408 DEB 14950', miss: '1,409', sigma: 201, pc: '<1e-10', state: 'MONITOR' },
  { tca: 176, sat: 'KW-4G', deb: 'SL-16 R/B 36945', miss: '1,407', sigma: 306, pc: '1.3e-8', state: 'MONITOR' },
  { tca: 251, sat: 'KW-2B', deb: 'SL-8 R/B 16224', miss: '267', sigma: 174, pc: '5.1e-4', state: 'MANEUVER REQ' },
  { tca: 315, sat: 'KW-2A', deb: 'SL-16 R/B 22350', miss: '1,524', sigma: 384, pc: '1.3e-7', state: 'MONITOR' },
  { tca: 377, sat: 'KW-3E', deb: 'H-2A DEB 13893', miss: '1,832', sigma: 423, pc: '2.4e-8', state: 'MONITOR' },
  { tca: 449, sat: 'KW-2A', deb: 'SL-8 R/B 37946', miss: '1,745', sigma: 343, pc: '1.0e-9', state: 'MONITOR' },
  { tca: 528, sat: 'KW-4A', deb: 'IRIDIUM 33 DEB 31860', miss: '666', sigma: 297, pc: '4.6e-5', state: 'WATCH' },
  { tca: 584, sat: 'KW-4B', deb: 'COSMOS-2251 DEB 24345', miss: '1,866', sigma: 445, pc: '3.8e-8', state: 'MONITOR' },
];

// ── Event log ───────────────────────────────────────────────────────────────────────────────────────
const TAGS = {
  PLN: '#e9c46a',
  TRK: '#9b95e2',
  CDM: '#e57b3b',
  UPL: '#e57b3b',
  BRN: '#5fcf8a',
  CLR: '#7cc4de',
};
const LOG = [
  ['13:48:48', 'PLN', 'KW-5A · Pc 4.7e-4 ≥ 1e-4 · burn planned Δv 0.196 m/s'],
  ['13:49:18', 'TRK', 'PALAU radar · 18 obs · σ 229 m · miss 205 m → Pc 6.4e-4'],
  ['13:49:29', 'CDM', 'new CDM · KW-2A vs SL-8 R/B 37946 · TCA 13:59:29'],
  ['13:49:38', 'UPL', 'KW-5A · burn sequence uplinked · 14 packets · ack'],
  ['13:49:57', 'TRK', 'KIRUNA radar · 22 obs · σ 132 m · miss 293 m → Pc 2.5e-4'],
  ['13:50:08', 'TRK', 'ATACAMA optical · 18 obs · σ 201 m · miss 1409 m → Pc <1e-10'],
  ['13:50:14', 'TRK', 'MT STROMLO laser · 9 obs · σ 341 m · miss 1487 m → Pc 3.2e-8'],
  ['13:50:32', 'TRK', 'KIRUNA radar · 13 obs · σ 384 m · miss 1524 m → Pc 1.3e-7'],
  ['13:50:48', 'BRN', 'KW-5A · burn executed · Δv 0.196 m/s prograde · new miss 1858 m'],
  ['13:50:48', 'CDM', 'new CDM · KW-4A vs IRIDIUM 33 DEB 31860 · TCA 14:00:48'],
  ['13:51:11', 'TRK', 'MT STROMLO laser · 20 obs · σ 174 m · miss 267 m → Pc 5.1e-4'],
  ['13:51:21', 'TRK', 'PALAU radar · 14 obs · σ 423 m · miss 1832 m → Pc 2.4e-8'],
  ['13:51:44', 'CDM', 'new CDM · KW-4B vs COSMOS-2251 DEB 24345 · TCA 14:01:44'],
  ['13:51:53', 'TRK', 'PALAU radar · 23 obs · σ 101 m · miss 266 m → Pc 1.5e-4'],
  ['13:51:56', 'TRK', 'ATACAMA optical · 10 obs · σ 259 m · miss 1304 m → Pc 2.4e-9'],
];
// Live events appended while the timeline plays (t = seconds after 13:52:00).
const LOG_LIVE = [
  [5, 'TRK', 'KIRUNA radar · 16 obs · σ 212 m · miss 1611 m → Pc 8.9e-9'],
  [12, 'CDM', 'new CDM · KW-6C vs FENGYUN-1C DEB 31142 · TCA 14:03:12'],
  [19, 'TRK', 'MT STROMLO laser · 12 obs · σ 96 m · miss 1835 m → Pc <1e-10'],
  [26, 'CLR', 'KW-5A vs NOAA 16 DEB 19213 · post-burn orbit verified · cleared'],
];

// ── Fleet state ─────────────────────────────────────────────────────────────────────────────────────
const FLEET_FUEL = [
  [2.18, 2.69, 3.28, 2.28, 2.87, 3.46, 2.45, 3.04],
  [3.64, 2.63, 3.22, 2.31, 2.80, 3.40, 2.39, 2.98],
  [3.57, 2.56, 3.16, 2.15, 2.74, 3.33, 2.32, 2.92],
  [3.51, 2.50, 3.09, 3.68, 2.68, 3.27, 2.26, 2.85],
  [3.43, 2.44, 3.03, 3.62, 2.61, 3.20, 2.20, 2.79],
  [3.38, 2.37, 2.96, 3.56, 2.55, 3.14, 2.13, 2.72],
];
const FLEET_WATCH = new Set(['2A', '2B', '3B', '3E', '4A', '4B', '4G']);

// ── Globe (fitted to the keyframe) ────────────────────────────────────────────────────────────────
const GLOBE = {
  cx: 535.12,
  cy: 339.47,
  R: 208,
  orbit: 225.82 / 208,
  tilt: -21.762 * DEG,
  inc: 53.006 * DEG,
  raan0: 4.427,
  u0: 7.46,
  phase: 7.524,
  earthSpin0: 124.4,
  spinLabel0: 326,
};
const SITES = [
  { name: 'PALAU', lat: 7.4, lon: 134.5, kind: 'sensor' },
  { name: 'MT STROMLO', lat: -35.3, lon: 149.0, kind: 'sensor' },
  { name: 'KIRUNA', lat: 67.8, lon: 20.2, kind: 'sensor' },
  { name: 'ATACAMA', lat: -24.6, lon: -70.4, kind: 'sensor' },
  { name: 'HARTEBEESTHOEK', lat: -25.9, lon: 27.7, kind: 'ttc' },
  { name: 'SVALBARD', lat: 78.2, lon: 15.4, kind: 'ttc' },
  { name: 'FAIRBANKS', lat: 64.8, lon: -147.7, kind: 'ttc' },
  { name: 'PUNTA ARENAS', lat: -53.2, lon: -70.9, kind: 'ttc' },
];
const TARGET_SAT = 1 * 8 + 3;
const THREAT_SAT = 3 * 8 + 6;

// Natural Earth 110m land, rasterised on a 2° lon/lat grid (180 × 90 bits, row 0 = 90°N, col 0 = 180°W).
const LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AOAfAP8HAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw///' +
  '/wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAc' +
  'AIL7//9//xOAAP/ff0668QD/HwAA+A8At///////v3/w/////x8++B8AAOD/1//7////////jP////+/+AE/gAcAn9f/////' +
  '/////w/w/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QA' +
  'AAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/' +
  '////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYA' +
  'AAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7' +
  'f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////' +
  'PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAA' +
  'AAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAA' +
  'PAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAA' +
  'APz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////' +
  'fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAY' +
  'XgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAA' +
  'AAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAA' +
  'AAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/' +
  'AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/' +
  'EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA' +
  '8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEg' +
  'AAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAA' +
  'AAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8A' +
  'AAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P//' +
  '/38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////' +
  '////////////////H/AfwP//////////////////////////////////////////////////////////////////////////' +
  '////////////';

export class KesslerOrbitalScene {
  constructor() {
    this.duration = 32;
    this.landDots = null;
    this.debris = null;
    this.widthCache = new Map();
    this.curFont = null;
  }

  // ── text helpers ──────────────────────────────────────────────────────────────────────────────
  // ctx.font parsing is costly, so the last font is cached; restore() invalidates it.
  font(ctx, size, weight = 400) {
    const f = `${weight} ${size}px ${FONT}`;
    if (f === this.curFont) return;
    ctx.font = f;
    this.curFont = f;
  }

  restore(ctx) {
    ctx.restore();
    this.curFont = null;
  }

  charWidth(ctx, ch, key) {
    const k = key + ch;
    let w = this.widthCache.get(k);
    if (w === undefined) {
      w = ctx.measureText(ch).width;
      this.widthCache.set(k, w);
    }
    return w;
  }

  textWidth(ctx, str, size, weight = 400, ls = 0) {
    this.font(ctx, size, weight);
    const s = String(str);
    if (!ls) return ctx.measureText(s).width;
    const key = `${weight}/${size}/`;
    let w = 0;
    for (const ch of s) w += this.charWidth(ctx, ch, key);
    return w + ls * Math.max(0, [...s].length - 1);
  }

  text(ctx, str, x, y, color, size = 9, weight = 400, align = 'left', ls = 0) {
    const s = String(str);
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    if (!ls) {
      ctx.textAlign = align;
      ctx.fillText(s, x, y);
      ctx.textAlign = 'left';
      return;
    }
    const w = this.textWidth(ctx, s, size, weight, ls);
    let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    if (typeof ctx.letterSpacing === 'string') {
      ctx.textAlign = 'left';
      ctx.letterSpacing = `${ls}px`;
      ctx.fillText(s, cx, y);
      ctx.letterSpacing = '0px';
      return;
    }
    const key = `${weight}/${size}/`;
    ctx.textAlign = 'left';
    for (const ch of s) {
      ctx.fillText(ch, cx, y);
      cx += this.charWidth(ctx, ch, key) + ls;
    }
  }

  // Slanted badge: top edge shifted right by `slant`; (x, y) is the bottom-left corner of the box.
  slantPath(ctx, x, y, w, h, slant = 4) {
    ctx.beginPath();
    ctx.moveTo(x + slant, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - slant, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  }

  badge(ctx, xRight, y, label, color, opts = {}) {
    const size = opts.size ?? 8.5;
    const ls = opts.ls ?? 0.8;
    const h = opts.h ?? 14.5;
    const slant = opts.slant ?? 4;
    const w = opts.w ?? this.textWidth(ctx, label, size, 700, ls) + 11;
    const x = opts.left !== undefined ? opts.left : xRight - w;
    this.slantPath(ctx, x, y, w, h, slant);
    if (opts.solid) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.fillStyle = opts.fill ?? rgba(color, 0.13);
      ctx.fill();
      ctx.strokeStyle = opts.stroke ?? rgba(color, 0.8);
      ctx.lineWidth = opts.lineWidth ?? 1.2;
      ctx.stroke();
    }
    this.text(ctx, label, x + w / 2, y + h - (opts.baselinePad ?? 4), opts.textColor ?? color, size, 700, 'center', ls);
    return x;
  }

  panel(ctx, key, title, accent, divider, opts = {}) {
    const [x0, y0, x1, y1] = PANELS[key];
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    ctx.fillStyle = opts.body ?? C.body;
    ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = C.strip;
    ctx.fillRect(x0 + 1, y0 + 1, w - 2, 22);
    if (divider) {
      ctx.fillStyle = divider;
      ctx.fillRect(x0 + 1, y0 + 23, w - 2, 1);
    }
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 1);
    ctx.lineTo(x0 + 12.5, y0 + 1);
    ctx.lineTo(x0, y0 + 13.5);
    ctx.closePath();
    ctx.fill();
    this.text(ctx, title, x0 + 22, y0 + 18, C.title, 13, 700, 'left', 1.45);
    if (opts.sub) this.text(ctx, opts.sub[0], opts.sub[1], y0 + 18, opts.subColor ?? '#4a4e59', 9.5, 400);
  }

  scanlines(ctx, x, y, w, h, alpha = 0.1, period = 3, offset = 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    const start = y + ((offset - y) % period + period) % period;
    for (let yy = start; yy < y + h; yy += period) ctx.fillRect(x, yy, w, 1);
  }

  glowDot(ctx, x, y, r, rgb, alpha = 0.5) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
    g.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.35})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ── main entry ────────────────────────────────────────────────────────────────────────────────
  render(ctx, state) {
    const t = clamp(Number(state.elapsed) || 0, 0, this.duration);
    const rm = Boolean(state.reducedMotion);
    const sec = Math.floor(t);
    const motion = rm ? 0 : t;

    this.curFont = null;
    ctx.save();
    // The gallery shares one canvas across scenes, so reset any state another scene may have left behind.
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
    if (typeof ctx.letterSpacing === 'string') ctx.letterSpacing = '0px';
    if (typeof ctx.filter === 'string') ctx.filter = 'none';
    ctx.fillStyle = C.page;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.scale(1, SY);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.textBaseline = 'alphabetic';

    const live = LOG_LIVE.filter(e => e[0] <= t);
    const cdmCount = 223 + live.filter(e => e[1] === 'CDM').length;

    this.drawHeader(ctx, t, sec, cdmCount, rm);
    this.drawSensors(ctx, t, motion, sec, rm);
    this.drawDebrisBand(ctx, t, rm);
    this.drawOrbital(ctx, t, motion, sec, rm);
    this.drawConjunctions(ctx, t, sec, rm);
    this.drawManeuver(ctx, t, rm);
    this.drawPc(ctx, t, rm);
    this.drawGround(ctx, t, sec, rm);
    this.drawEventLog(ctx, t, rm);
    this.drawFleet(ctx, t, rm);
    this.drawFrame(ctx);
    this.restore(ctx);
  }

  drawFrame(ctx) {
    ctx.fillStyle = C.frame;
    ctx.fillRect(271, 0, WIDTH - 271, 1);
    ctx.fillRect(0, DESIGN_H - 1, WIDTH, 1);
    ctx.fillRect(WIDTH - 1, 0, 1, DESIGN_H);
    ctx.fillRect(0, 30, 1, DESIGN_H - 30);
    ctx.fillStyle = '#6e2400';
    ctx.fillRect(0, 0, 271, 1);
    ctx.fillRect(0, 0, 1, 30);
  }

  // ── header ────────────────────────────────────────────────────────────────────────────────────
  drawHeader(ctx, t, sec, cdmCount, rm) {
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, 0, WIDTH, 29);
    ctx.fillStyle = '#1a1e21';
    ctx.fillRect(0, 29, WIDTH, 1);

    const g = ctx.createLinearGradient(0, 0, 272, 0);
    g.addColorStop(0, '#bd5411');
    g.addColorStop(1, '#da5f14');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(271.5, 0);
    ctx.lineTo(259.5, 30);
    ctx.lineTo(0, 30);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    this.scanlines(ctx, 0, 0, 272, 30, 0.09, 3, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, 28, 272, 2);
    this.restore(ctx);

    this.text(ctx, 'KESSLER WATCH', 12.5, 20, '#2a0b03', 14.5, 800, 'left', 2.3);
    this.text(ctx, 'CONJUNCTION DESK', 160, 19, '#3b1004', 8.4, 800, 'left', 1.0);

    const stats = [
      ['TRACKED OBJECTS', '31,290', '#d7d9dd', 288],
      ['CONSTELLATION', '48 / 48', '#93c8dc', 396],
      ['CDMs · 24H', String(cdmCount), '#eac57c', 495],
      ['MANEUVERS · 24H', '4', '#e57b3b', 578],
      ['Kp INDEX', '3+', '#a39ee8', 686],
    ];
    for (const [label, value, color, x] of stats) {
      this.text(ctx, label, x, 12, '#4a4d55', 8, 400, 'left', 0.5);
      this.text(ctx, value, x, 24, color, 12, 700);
    }

    ctx.fillStyle = '#4d171c';
    ctx.fillRect(750, 5, 118, 20);
    ctx.strokeStyle = 'rgba(230, 80, 90, 0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(750.5, 5.5, 117, 19);
    const pulse = rm ? 1 : 0.86 + 0.14 * Math.cos(t * TAU * 0.5);
    this.text(ctx, '1 ACTIVE ALERT', 809, 19, `rgba(242, 196, 199, ${pulse})`, 9, 700, 'center', 1.05);

    this.slantPath(ctx, 876, 5.5, 82, 17, 4);
    ctx.fillStyle = '#15112a';
    ctx.fill();
    ctx.strokeStyle = '#4e4a74';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    this.text(ctx, 'SIMULATED DATA', 917, 18, '#918bd2', 8.2, 700, 'center', 0.3);

    this.text(ctx, SIM_DATE, 1069.5, 9, '#41444c', 7.5, 400, 'right');
    this.text(ctx, `${hms(SIM_T0 + sec)} UTC`, 1069.5, 21, '#d0d3d8', 13, 600, 'right');
  }

  // ── sensor net ────────────────────────────────────────────────────────────────────────────────
  drawSensors(ctx, t, motion, sec, rm) {
    this.panel(ctx, 'sensor', 'SENSOR NET', '#7d76dc', '#343341', { sub: ['tracki…', 149] });
    this.badge(ctx, 254.5, 42.5, '4 SITES', C.lavender, { fill: '#1b1933', stroke: '#6d68b4' });

    const sweep = rm ? 0 : motion * 72 * DEG;
    SENSORS.forEach((s, i) => {
      const top = 64 + i * 84;
      if (i < 3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.fillRect(9, top + 85, 252, 1);
      }
      // Idle sites count down to their next pass; MT STROMLO acquires at 13:52:09.
      const remaining = s.next - sec;
      let active = s.active;
      let barFrac;
      let act = active ? 1 : 0;
      if (!s.active) {
        const gap = s.next / Math.max(0.0001, 1 - s.wait);
        if (remaining <= 0) {
          active = true;
          act = rm ? 1 : smoothstep(s.next, s.next + 0.8, t);
          barFrac = clamp((t - s.next) / 100, 0, 1);
        } else {
          barFrac = clamp(s.wait + t / gap, 0, 1);
        }
      } else {
        barFrac = clamp(s.pass + t / 100, 0, 1);
      }
      const nextLabel = remaining > 0 ? `next pass ${mmss(remaining)}` : `in pass ${mmss(-remaining)}`;
      this.drawScope(ctx, 44.5, top + 42.3, 24, i, act, sweep, t, rm);

      this.text(ctx, s.name, 80, top + 24.3, '#d8dade', 12, 700, 'left', 0.5);
      const nameW = this.textWidth(ctx, s.name, 12, 700, 0.5);
      const tagColor = act > 0.5 ? C.lavender : '#4a4d58';
      this.badge(ctx, 0, top + 14.5, s.tag, tagColor, {
        left: 80 + nameW + 11.5,
        w: this.textWidth(ctx, s.tag, 6.6, 700) + 8.5,
        size: 6.6,
        ls: 0,
        h: 11,
        slant: 3,
        baselinePad: 2.8,
        fill: act > 0.5 ? '#1b1933' : 'rgba(255,255,255,0.02)',
        stroke: act > 0.5 ? '#6d68b4' : '#353843',
        lineWidth: 1,
      });
      this.text(ctx, s.coords, 80, top + 38, '#4b4f58', 8.5);
      const obs = s.obs + (rm ? 0 : Math.round((hash(i * 17 + Math.floor(t / 5)) - 0.5) * 2.4) * (t >= 5 ? 1 : 0));
      const obsColor = act > 0.5 ? '#a49ee9' : '#d7d9dd';
      this.text(ctx, `${obs} obs/min`, 80, top + 55, obsColor, 9.5, 700);
      this.text(ctx, `σ ${s.sigma} m`, 158, top + 55, '#d2d4d8', 9.5, 700);
      this.text(ctx, nextLabel, 80, top + 68, '#2d3138', 8.5);
      if (act > 0.01) this.text(ctx, 'TRACK → CDM', 249.5, top + 68, rgba('#8f89da', act), 8.5, 700, 'right', 0.6);

      ctx.fillStyle = '#171a22';
      ctx.fillRect(80, top + 74, 170, 3);
      if (barFrac > 0) {
        ctx.fillStyle = act > 0.5 ? '#9c95d8' : '#4f525e';
        ctx.fillRect(80, top + 74, 170 * barFrac, 3);
      }
    });
  }

  drawScope(ctx, cx, cy, r, idx, act, sweep, t, rm) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    if (act > 0) {
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      g.addColorStop(0, `rgba(104, 98, 160, ${0.4 * act})`);
      g.addColorStop(0.7, `rgba(80, 75, 132, ${0.34 * act})`);
      g.addColorStop(1, `rgba(58, 54, 100, ${0.22 * act})`);
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      this.scanlines(ctx, cx - r, cy - r, r * 2, r * 2, 0.14 * act, 3, 1);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Trailing wedge (55°) behind the leading edge; the sweep turns clockwise.
    const lead = sweep;
    const wedge = ctx.createLinearGradient(cx, cy, cx + Math.cos(lead) * r, cy + Math.sin(lead) * r);
    const base = act > 0.5 ? '146, 138, 222' : '104, 102, 150';
    wedge.addColorStop(0, `rgba(${base}, ${act > 0.5 ? 0.36 : 0.26})`);
    wedge.addColorStop(1, `rgba(${base}, ${act > 0.5 ? 0.5 : 0.36})`);
    ctx.fillStyle = wedge;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, lead - 55 * DEG, lead);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = act > 0.5 ? '#c4beff' : '#9a98c6';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(lead) * r, cy + Math.sin(lead) * r);
    ctx.stroke();

    for (let k = 0; k < 8; k++) {
      const seed = idx * 31 + k * 7;
      const a = hash(seed) * TAU;
      const d = r * (0.22 + 0.7 * hash(seed + 3));
      const bx = cx + Math.cos(a) * d;
      const by = cy + Math.sin(a) * d;
      const behind = ((lead - a) % TAU + TAU) % TAU;
      const fresh = rm ? 0.7 : 0.4 + 0.6 * Math.exp(-behind / 2.2);
      const hot = hash(seed + 5) > 0.35 || act < 0.5;
      ctx.fillStyle = hot ? `rgba(200, 60, 40, ${0.3 * fresh})` : `rgba(190, 175, 215, ${0.22 * fresh})`;
      ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
      ctx.fillStyle = hot ? `rgba(240, 140, 92, ${0.85 * fresh})` : `rgba(222, 212, 236, ${0.8 * fresh})`;
      ctx.fillRect(bx - 0.7, by - 0.7, 1.4, 1.4);
    }
    this.restore(ctx);
    ctx.strokeStyle = act > 0.5 ? 'rgba(130, 125, 190, 0.26)' : 'rgba(110, 114, 130, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, TAU);
    ctx.stroke();
  }

  // ── debris band ───────────────────────────────────────────────────────────────────────────────
  drawDebrisBand(ctx, t, rm) {
    this.panel(ctx, 'debris', 'DEBRIS BAND', '#f07a35', '#3e312b', { sub: ['catalog…', 159] });
    this.badge(ctx, 253.5, 422.5, 'LEO', C.orange, { fill: '#2a1408', stroke: '#c0652f' });
    this.text(ctx, 'objects', 2, 463, '#2a2d33', 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.022)';
    for (const y of [457, 498, 538]) ctx.fillRect(38, y, 212, 1);

    this.text(ctx, 'KW ORBIT · 550 km', 107, 469, '#a8d6e8', 8.7, 700);
    ctx.save();
    ctx.beginPath();
    ctx.rect(9, 470, 252, 16);
    ctx.clip();
    this.text(ctx, '↓ crossing traffic from 800 km shell', 107, 481, '#c96a34', 7.6);
    this.restore(ctx);

    const breathe = rm ? 0 : 0.5 + 0.5 * Math.sin(t * TAU / 4);
    ctx.fillStyle = `rgba(110, 185, 215, ${0.13 + 0.04 * breathe})`;
    ctx.fillRect(91.5, 457.5, 10, 120.5);
    ctx.strokeStyle = 'rgba(120, 175, 195, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(91.5, 457.5, 10, 120.5);
    this.scanlines(ctx, 92, 458, 9, 120, 0.12, 3, 0);

    for (let i = 0; i < 36; i++) {
      const x = 39.6 + i * 5.86;
      const flicker = rm ? 0 : Math.round((hash(i * 13 + Math.floor(t * 2)) - 0.5) * 1.6) * (i % 3 === 0 ? 1 : 0);
      const top = BAR_TOPS[i] - flicker;
      const kw = i >= 9 && i <= 11;
      const hot = (i >= 6 && i <= 8) || (i >= 12 && i <= 14);
      ctx.fillStyle = kw ? '#9ad8f0' : hot ? '#ea7c3c' : '#8a4a24';
      ctx.fillRect(x, top, 4, 578 - top);
      this.scanlines(ctx, x, top, 4, 578 - top, kw || hot ? 0.13 : 0.16, 3, 1);
    }

    this.text(ctx, '300 km', 38, 592, '#2d3038', 7.6);
    this.text(ctx, '500 km', 72, 592, '#2d3038', 7.6);
    this.text(ctx, '700 km', 116.5, 592, '#2d3038', 7.6);
    this.text(ctx, '900 km', 165, 592, '#2d3038', 7.6);
    this.text(ctx, '1100 km', 211, 592, '#2d3038', 7.6);

    this.text(ctx, 'IN BAND ±25 km', 20, 606, '#4a4d55', 7);
    this.text(ctx, 'CROSSING / ORBIT', 102, 606, '#4a4d55', 7);
    this.text(ctx, 'BREAKUP FRAGMENTS', 184, 606, '#4a4d55', 7);
    this.text(ctx, '1,486', 20, 619.5, '#9fd6ec', 12.5, 700);
    this.text(ctx, '23', 102, 619.5, '#ef8a4a', 12.5, 700);
    this.text(ctx, '3,612', 184, 619.5, '#ef5f6e', 12.5, 700);
  }

  // ── orbital picture ───────────────────────────────────────────────────────────────────────────
  ensureGlobeData() {
    if (this.landDots) return;
    const W = 180;
    const H = 90;
    const bin = typeof atob === 'function' ? atob(LAND_B64) : '';
    const dots = [];
    for (let r = 0; r < H; r++) {
      const lat = 90 - (r + 0.5) * 2;
      const keepEvery = Math.max(1, Math.round(1 / Math.max(0.2, Math.cos(lat * DEG))));
      for (let c = 0; c < W; c++) {
        if (c % keepEvery) continue;
        const k = r * W + c;
        const byte = bin.charCodeAt(k >> 3) || 0;
        if (!((byte >> (k & 7)) & 1)) continue;
        const lon = -180 + (c + 0.5) * 2;
        dots.push([Math.cos(lat * DEG), Math.sin(lat * DEG), lon * DEG]);
      }
    }
    this.landDots = dots;

    const debris = [];
    for (let k = 0; k < 400; k++) {
      const ring = k < 100;
      const raan = ring ? (2 + (hash(k * 3.1) - 0.5) * 40) * DEG : hash(k * 5.7 + 1) * TAU;
      const inc = ring ? (97 + (hash(k * 2.3) - 0.5) * 30) * DEG : (35 + hash(k * 9.1 + 2) * 70) * DEG;
      const u0 = hash(k * 7.9 + 3) * TAU;
      const rr = (ring ? 1.118 : 1.098) + hash(k * 4.4 + 5) * (ring ? 0.05 : 0.08);
      debris.push({
        raan,
        inc,
        u0,
        rr,
        n: (1.6 * DEG) * Math.pow(GLOBE.orbit / rr, 1.5) * (hash(k * 1.7) > 0.5 ? 1 : -0.94),
        size: 1.1 + hash(k * 6.1 + 7) * 1.1,
        alpha: 0.32 + hash(k * 8.3 + 11) * 0.62,
        hot: hash(k * 3.3 + 13) > 0.9,
        tw: hash(k * 2.9 + 17) * TAU,
      });
    }
    this.debris = debris;
  }

  // World (z = north) → screen, for the fitted orthographic camera.
  project(x, y, z) {
    const ct = Math.cos(GLOBE.tilt);
    const st = Math.sin(GLOBE.tilt);
    const zv = x * ct + z * st;
    const yv = -x * st + z * ct;
    return [GLOBE.cx + GLOBE.R * y, GLOBE.cy - GLOBE.R * yv, zv];
  }

  orbitPoint(raanDeg, uDeg, radius = GLOBE.orbit, inc = GLOBE.inc) {
    const O = raanDeg * DEG;
    const u = uDeg * DEG;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    const ci = Math.cos(inc);
    const x = (Math.cos(O) * cu - Math.sin(O) * su * ci) * radius;
    const y = (Math.sin(O) * cu + Math.cos(O) * su * ci) * radius;
    const z = su * Math.sin(inc) * radius;
    return this.project(x, y, z);
  }

  geoPoint(latDeg, lonDeg, spinDeg, radius = 1) {
    const a = (spinDeg - lonDeg) * DEG;
    const cl = Math.cos(latDeg * DEG);
    return this.project(cl * Math.cos(a) * radius, cl * Math.sin(a) * radius, Math.sin(latDeg * DEG) * radius);
  }

  visible(p) {
    if (p[2] > 0) return true;
    return Math.hypot(p[0] - GLOBE.cx, p[1] - GLOBE.cy) > GLOBE.R;
  }

  drawOrbital(ctx, t, motion, sec, rm) {
    this.ensureGlobeData();
    this.panel(ctx, 'orbital', 'ORBITAL PICTURE', '#7cc4de', null, {
      body: C.bodyOrbit,
      sub: ['KW constellation · 6 planes × 8 · 550 km · 53°', 464],
      subColor: '#474b56',
    });
    const blink = rm ? 1 : (Math.sin(t * TAU * 0.8) > -0.2 ? 1 : 0.35);
    this.text(ctx, 'LIVE', 753, 56, '#c94a5c', 9.5, 700, 'left', 1.3);
    this.glowDot(ctx, 787, 51.5, 6, '230, 70, 90', 0.45 * blink);
    ctx.fillStyle = `rgba(220, 80, 96, ${0.85 * blink})`;
    ctx.beginPath();
    ctx.arc(787, 51.5, 2.6, 0, TAU);
    ctx.fill();

    const legend = [
      [282, '#80c7df', 'KW satellite', 296],
      [369, '#e8773a', 'tracked debris', 384],
      [466, '#8f88d8', 'sensor site', 480],
      [549, '#5cc98a', 'TT&C station', 563],
    ];
    for (const [sx, col, label, tx] of legend) {
      ctx.fillStyle = col;
      ctx.fillRect(sx + 1, 72, 6.5, 6.5);
      this.text(ctx, label, tx, 78.5, '#5b5f69', 8.5);
    }
    const spinDelta = motion * 0.6;
    this.text(ctx, `spin ${Math.round(GLOBE.spinLabel0 + spinDelta) % 360}° · tilt 22°`, 787, 78.5, '#2e3139', 8, 400, 'right');

    ctx.save();
    ctx.beginPath();
    ctx.rect(271, 61, 530, 568);
    ctx.clip();
    this.drawGlobe(ctx, t, motion, spinDelta, rm);
    this.restore(ctx);

    this.text(ctx, 'KW-5A', 284, 583, '#a9d6e8', 17, 700, 'left', 0.6);
    this.text(ctx, 'vs NOAA 16 DEB · 19213', 284, 597, '#d0703a', 9.5);
    this.text(ctx, 'rel. velocity 12.9 km/s · Pc <1e-10', 284, 609.5, '#5d6169', 9);
  }

  drawGlobe(ctx, t, motion, spinDelta, rm) {
    const { cx, cy, R } = GLOBE;
    const earthSpin = GLOBE.earthSpin0 + spinDelta;
    const satRate = 1.6;

    // Halo around the planet.
    let g = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.32);
    g.addColorStop(0, 'rgba(22, 34, 52, 0.55)');
    g.addColorStop(0.18, 'rgba(14, 22, 36, 0.35)');
    g.addColorStop(1, 'rgba(8, 10, 16, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.32, 0, TAU);
    ctx.fill();

    // Planet disk: near-black core, darker rim, cool sheen toward the upper left.
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, '#05080f');
    g.addColorStop(0.62, '#040509');
    g.addColorStop(0.9, '#020308');
    g.addColorStop(1, '#030509');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    g = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.3, 0, cx - R * 0.28, cy - R * 0.3, R * 0.72);
    g.addColorStop(0, 'rgba(36, 58, 104, 0.10)');
    g.addColorStop(1, 'rgba(36, 58, 104, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 140, 190, 0.10)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R - 1, -70 * DEG, 95 * DEG);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(70, 100, 140, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 0.5, 0, TAU);
    ctx.stroke();

    // Dotted continents (front hemisphere only, kept faint like the keyframe), batched by depth bucket.
    const LAND_BUCKETS = 6;
    const buckets = Array.from({ length: LAND_BUCKETS }, () => []);
    const spinRad = earthSpin * DEG;
    const ct = Math.cos(GLOBE.tilt);
    const st = Math.sin(GLOBE.tilt);
    for (const [cl, sl, lon] of this.landDots) {
      const a = spinRad - lon;
      const x = cl * Math.cos(a);
      const zv = x * ct + sl * st;
      if (zv <= 0.04) continue;
      const sx = cx + R * cl * Math.sin(a);
      const sy = cy - R * (-x * st + sl * ct);
      buckets[Math.min(LAND_BUCKETS - 1, Math.floor(zv * LAND_BUCKETS))].push(sx, sy);
    }
    buckets.forEach((pts, b) => {
      if (!pts.length) return;
      ctx.fillStyle = `rgba(70, 118, 160, ${0.05 + 0.13 * ((b + 0.5) / LAND_BUCKETS)})`;
      ctx.beginPath();
      for (let k = 0; k < pts.length; k += 2) ctx.rect(pts[k] - 0.6, pts[k + 1] - 0.6, 1.2, 1.2);
      ctx.fill();
    });

    // Graticule: parallels every 30°, meridians every 30°.
    ctx.strokeStyle = 'rgba(110, 160, 205, 0.085)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const lat of [-60, -30, 0, 30, 60]) {
      let pen = false;
      for (let lon = 0; lon <= 360; lon += 3) {
        const p = this.geoPoint(lat, lon, earthSpin);
        if (p[2] > 0) {
          if (pen) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
          pen = true;
        } else pen = false;
      }
    }
    for (let lon = 0; lon < 360; lon += 30) {
      let pen = false;
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = this.geoPoint(lat, lon, earthSpin);
        if (p[2] > 0) {
          if (pen) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
          pen = true;
        } else pen = false;
      }
    }
    ctx.stroke();

    // Orbit planes: arcs hidden by the planet stay faint; KW-5A's own plane is highlighted.
    const targetPlane = Math.floor(TARGET_SAT / 8);
    const planes = [];
    for (let p = 0; p < 6; p++) {
      const raan = GLOBE.raan0 + p * 60 + spinDelta;
      const pts = [];
      for (let k = 0; k <= 180; k++) pts.push(this.orbitPoint(raan, k * 2));
      planes.push(pts);
    }
    planes.forEach((pts, p) => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = p === targetPlane ? 'rgba(130, 180, 205, 0.1)' : 'rgba(120, 165, 195, 0.055)';
      ctx.beginPath();
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k];
        const b = pts[k + 1];
        if (this.visible(a) && this.visible(b)) continue;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
    });

    // Satellites.
    const sats = [];
    for (let p = 0; p < 6; p++) {
      const raan = GLOBE.raan0 + p * 60 + spinDelta;
      for (let s = 0; s < 8; s++) {
        const u = GLOBE.u0 + s * 45 + p * GLOBE.phase + motion * satRate;
        const pos = this.orbitPoint(raan, u);
        sats.push({ p, s, pos, vis: this.visible(pos) });
      }
    }
    for (const sat of sats) {
      if (sat.vis) continue;
      ctx.fillStyle = 'rgba(120, 150, 172, 0.42)';
      ctx.fillRect(sat.pos[0] - 1.6, sat.pos[1] - 1.6, 3.2, 3.2);
    }

    planes.forEach((pts, p) => {
      const hi = p === targetPlane;
      ctx.lineWidth = hi ? 1.7 : 1;
      ctx.strokeStyle = hi ? 'rgba(150, 204, 226, 0.56)' : 'rgba(140, 186, 210, 0.24)';
      ctx.beginPath();
      let pen = false;
      for (let k = 0; k < pts.length; k++) {
        const a = pts[k];
        const nb = pts[Math.min(k + 1, pts.length - 1)];
        const on = this.visible(a) && this.visible(nb);
        if (on) {
          if (pen) ctx.lineTo(a[0], a[1]);
          else ctx.moveTo(a[0], a[1]);
          pen = true;
        } else if (pen) {
          ctx.lineTo(a[0], a[1]);
          pen = false;
        }
      }
      ctx.stroke();
    });

    // Debris shell + polar breakup ring, batched by brightness bucket.
    const DEB_BUCKETS = 8;
    const debBuckets = Array.from({ length: DEB_BUCKETS }, () => []);
    for (let k = 0; k < this.debris.length; k++) {
      const d = this.debris[k];
      const u = d.u0 + motion * d.n;
      const cu = Math.cos(u);
      const su = Math.sin(u);
      const O = d.raan + spinDelta * DEG;
      const ci = Math.cos(d.inc);
      const x = (Math.cos(O) * cu - Math.sin(O) * su * ci) * d.rr;
      const y = (Math.sin(O) * cu + Math.cos(O) * su * ci) * d.rr;
      const z = su * Math.sin(d.inc) * d.rr;
      const p = this.project(x, y, z);
      if (!this.visible(p)) continue;
      const tw = rm ? 1 : 0.75 + 0.25 * Math.sin(t * 2.1 + d.tw);
      const a = d.alpha * tw * (p[2] < 0 ? 0.75 : 1);
      if (d.hot) this.glowDot(ctx, p[0], p[1], 5, '255, 120, 50', 0.35 * a);
      debBuckets[Math.min(DEB_BUCKETS - 1, Math.floor(a * DEB_BUCKETS))].push(p[0], p[1], d.size);
    }
    debBuckets.forEach((pts, b) => {
      if (!pts.length) return;
      ctx.fillStyle = `rgba(238, 128, 58, ${(b + 0.5) / DEB_BUCKETS})`;
      ctx.beginPath();
      for (let k = 0; k < pts.length; k += 3) ctx.rect(pts[k] - pts[k + 2] / 2, pts[k + 1] - pts[k + 2] / 2, pts[k + 2], pts[k + 2]);
      ctx.fill();
    });

    for (const sat of sats) {
      if (!sat.vis) continue;
      const [x, y, z] = sat.pos;
      const k = 0.8 + 0.2 * clamp(z + 0.4, 0, 1);
      this.glowDot(ctx, x, y, 11, '96, 190, 228', 0.42 * k);
      ctx.fillStyle = `rgba(44, 104, 128, ${0.95 * k})`;
      ctx.fillRect(x - 4.5, y - 4.5, 9, 9);
      const core = ctx.createRadialGradient(x, y, 0, x, y, 4.5);
      core.addColorStop(0, `rgba(150, 214, 236, ${0.9 * k})`);
      core.addColorStop(1, 'rgba(150, 214, 236, 0)');
      ctx.fillStyle = core;
      ctx.fillRect(x - 4.5, y - 4.5, 9, 9);
      ctx.strokeStyle = `rgba(160, 216, 238, ${0.95 * k})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 4.4, y - 4.4, 8.8, 8.8);
    }

    // Ground sites and line-of-sight rays.
    for (const site of SITES) {
      const p = this.geoPoint(site.lat, site.lon, earthSpin);
      if (p[2] <= 0.02) continue;
      const ttc = site.kind === 'ttc';
      const rgb = ttc ? '96, 214, 140' : '160, 150, 240';
      let best = null;
      let bestD = 70;
      for (const sat of sats) {
        if (!sat.vis || sat.pos[2] < 0) continue;
        const d = Math.hypot(sat.pos[0] - p[0], sat.pos[1] - p[1]);
        if (d < bestD) {
          bestD = d;
          best = sat;
        }
      }
      if (best) {
        ctx.strokeStyle = `rgba(${rgb}, 0.32)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(best.pos[0], best.pos[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      this.glowDot(ctx, p[0], p[1], 8, rgb, 0.55);
      ctx.fillStyle = ttc ? '#7fe3a8' : '#bdb6ff';
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.4, 0, TAU);
      ctx.fill();
      this.text(ctx, site.name, p[0] + 5, p[1] + 3, ttc ? '#6cc092' : '#9a95d6', 7, 400);
    }

    // Conjunction geometry: KW-5A reticle, NOAA 16 DEB diamond, miss vector and callout.
    const target = sats[TARGET_SAT].pos;
    const threat = sats[THREAT_SAT].pos;
    const pulse = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * TAU * 0.7);
    ctx.strokeStyle = 'rgba(96, 205, 140, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(target[0], target[1]);
    ctx.lineTo(threat[0], threat[1]);
    ctx.stroke();
    if (!rm) {
      const f = fract(t * 0.45);
      const px = target[0] + (threat[0] - target[0]) * f;
      const py = target[1] + (threat[1] - target[1]) * f;
      this.glowDot(ctx, px, py, 5, '120, 230, 160', 0.5 * Math.sin(f * Math.PI));
    }

    this.glowDot(ctx, threat[0], threat[1], 24, '255, 116, 36', 0.55 + 0.15 * pulse);
    this.glowDot(ctx, threat[0], threat[1], 7, '255, 214, 170', 0.7);
    ctx.strokeStyle = '#f2903e';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(threat[0], threat[1] - 9.5);
    ctx.lineTo(threat[0] + 9.5, threat[1]);
    ctx.lineTo(threat[0], threat[1] + 9.5);
    ctx.lineTo(threat[0] - 9.5, threat[1]);
    ctx.closePath();
    ctx.stroke();

    const [rx, ry] = target;
    this.glowDot(ctx, rx, ry, 24, '60, 200, 120', 0.32 + 0.1 * pulse);
    ctx.strokeStyle = '#7fd8a8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(rx, ry, 10, 0, TAU);
    ctx.moveTo(rx, ry - 18);
    ctx.lineTo(rx, ry - 11.5);
    ctx.moveTo(rx, ry + 11.5);
    ctx.lineTo(rx, ry + 19);
    ctx.moveTo(rx - 17.5, ry);
    ctx.lineTo(rx - 11.5, ry);
    ctx.moveTo(rx + 11.5, ry);
    ctx.lineTo(rx + 17.5, ry);
    ctx.stroke();

    const mx = (target[0] + threat[0]) / 2;
    const my = (target[1] + threat[1]) / 2 - 12;
    const tcaLeft = Math.max(0, 48 - Math.floor(t));
    const label = `1835 m · T-${mmss(tcaLeft)}`;
    this.slantPath(ctx, mx - 50.5, my - 7.5, 101, 15.5, 3);
    ctx.fillStyle = 'rgba(10, 36, 24, 0.92)';
    ctx.fill();
    ctx.strokeStyle = '#6cc797';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    this.text(ctx, label, mx, my + 4.6, '#82dca9', 9.5, 700, 'center');
  }

  // ── conjunctions ──────────────────────────────────────────────────────────────────────────────
  drawConjunctions(ctx, t, sec, rm) {
    this.panel(ctx, 'conj', 'CONJUNCTIONS', '#f07a35', '#3e2f2a');
    this.badge(ctx, 1064.5, 42.5, '9 IN QUEUE', C.orange, { fill: '#2a1408', stroke: '#c0652f' });

    CONJ.forEach((c, i) => {
      const top = Math.round(68 + i * 55.125);
      const h = 49.5;
      const remaining = Math.max(0, c.tca - sec);
      const done = c.state === 'BURN DONE';
      const req = c.state === 'MANEUVER REQ';
      const watch = c.state === 'WATCH';

      if (done) {
        ctx.fillStyle = '#0f241b';
        ctx.fillRect(816, top, 251, h);
        const glow = rm ? 0.6 : 0.5 + 0.2 * Math.sin(t * TAU * 0.4);
        ctx.strokeStyle = `rgba(120, 205, 160, ${glow})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(816.5, top + 0.5, 250, h - 1);
        ctx.fillStyle = '#8fd6a8';
        ctx.fillRect(816, top, 3, h);
      } else if (req) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(816, top, 251, h);
        ctx.clip();
        ctx.fillStyle = '#170d0f';
        ctx.fillRect(816, top, 251, h);
        ctx.strokeStyle = '#2b131a';
        ctx.lineWidth = 5;
        const shift = rm ? 0 : (t * 6) % 10;
        ctx.beginPath();
        for (let x = 790 + shift; x < 1080 + h; x += 10) {
          ctx.moveTo(x, top + h);
          ctx.lineTo(x + h, top);
        }
        ctx.stroke();
        this.restore(ctx);
        ctx.fillStyle = '#d35359';
        ctx.fillRect(816, top, 3, h);
      } else {
        ctx.fillStyle = watch ? '#171310' : '#0d0e12';
        ctx.fillRect(816, top, 251, h);
        ctx.fillStyle = watch ? '#f4c77e' : '#6d7380';
        ctx.fillRect(816, top, 3, h);
        if (!watch) this.scanlines(ctx, 816, top, 3, h, 0.45, 3, 2);
      }

      const urgent = remaining < 120;
      this.text(ctx, `T-${mmss(remaining)}`, 826, top + 17, urgent ? '#e2505a' : '#e6e8ec', 15, 700);
      this.text(ctx, c.sat, 918, top + 16, '#9ccbe0', 12, 700, 'left', 0.2);
      this.text(ctx, c.deb, 826, top + 31, '#c8783a', 8.5);
      this.text(ctx, `miss ${c.miss} m`, 826, top + 45.3, '#d8dadf', 9.2, 700);
      this.text(ctx, `σ ${c.sigma} m`, 918, top + 45.3, done ? '#41574d' : '#454a53', 9);
      const pcColor = done ? '#5fcf8a' : req ? '#e2505a' : watch ? '#efc274' : '#666b76';
      this.text(ctx, `Pc ${c.pc}`, 1058, top + 45.3, pcColor, 9.5, 700, 'right');

      const by = top + 9;
      const bopt = { size: 6.8, ls: 0.1, h: 12.5, slant: 3.4, baselinePad: 3.4 };
      if (done) {
        this.badge(ctx, 1058.5, by, 'BURN DONE', '#47b874', { ...bopt, solid: true, textColor: '#0c2a17' });
      } else if (req) {
        this.badge(ctx, 1058.5, by, 'MANEUVER REQ', '#e2454f', { ...bopt, solid: true, textColor: '#4c0a10' });
      } else if (watch) {
        this.badge(ctx, 1058.5, by, 'WATCH', '#efc274', { ...bopt, fill: '#2c210f', stroke: '#a8873f' });
      } else {
        this.badge(ctx, 1058.5, by, 'MONITOR', '#5d626e', { ...bopt, fill: '#14161c', stroke: '#474c57' });
      }
    });

    this.text(ctx, 'thresholds · Pc ≥ 1e-4 maneuver · ≥ 1e-5 watch · HBR 10 m', 812, 622, '#272a31', 7.7);
  }

  // ── maneuver plan ─────────────────────────────────────────────────────────────────────────────
  drawManeuver(ctx, t, rm) {
    this.panel(ctx, 'maneuver', 'MANEUVER PLAN', '#5fcf8a', '#3f524c', { sub: ['KW-5A', 180] });
    this.badge(ctx, 352.5, 642.5, 'BURN CASE', C.orange, { fill: '#2a1408', stroke: '#c0652f' });

    const hdr = [['OPTION', 20], ['Δv m/s', 104], ['NEW MISS', 168], ['FUEL g', 244], ['Pc AFTER', 304]];
    for (const [label, x] of hdr) this.text(ctx, label, x, 680, '#44484f', 9);

    const rows = [
      ['T-150 s', '0.137', '1,366 m', '8.8', '<1e-10'],
      ['T-120 s', '0.196', '1,836 m', '12.5', '<1e-10'],
      ['T-90 s', '0.284', '2,540 m', '18.2', '<1e-10'],
    ];
    ctx.fillStyle = '#0e1f18';
    ctx.fillRect(13, 701, 341, 19);
    ctx.fillStyle = '#74cd98';
    ctx.fillRect(13, 702, 3, 17);
    rows.forEach((r, i) => {
      const y = 696.6 + i * 18.2;
      const sel = i === 1;
      const base = sel ? '#e3ece7' : '#6c7079';
      this.text(ctx, r[0], 21, y, base, 10, sel ? 700 : 400);
      this.text(ctx, r[1], 104, y, sel ? '#6fd69a' : '#6c7079', 10, sel ? 700 : 400);
      this.text(ctx, r[2], 168, y, sel ? '#c8d6d0' : '#5d616a', 10, sel ? 700 : 400);
      this.text(ctx, r[3], 244, y, sel ? '#d6e0db' : '#5d616a', 10, sel ? 700 : 400);
      this.text(ctx, r[4], 348, y, '#62d391', 10, 700, 'right');
    });

    ctx.fillStyle = '#05060a';
    ctx.fillRect(18, 763, 322, 97);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (const y of [763, 796, 829, 860]) ctx.fillRect(18, y, 322, 1);
    this.text(ctx, 'miss', 26, 772, '#2b2e35', 7.5);

    ctx.strokeStyle = 'rgba(200, 160, 70, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(47, 837.5);
    ctx.lineTo(338, 837.5);
    ctx.stroke();
    ctx.setLineDash([]);
    this.text(ctx, '2 km keep-out', 287, 832.5, '#c9a24e', 7.6);

    ctx.strokeStyle = '#5d6a66';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(320.5, 763);
    ctx.lineTo(320.5, 860);
    ctx.stroke();
    this.text(ctx, 'now', 323, 772, '#7b8189', 7.5);

    ctx.strokeStyle = '#43b07f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(47, 768);
    ctx.lineTo(338, 845.3);
    ctx.stroke();

    const pulse = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * TAU * 0.6);
    this.glowDot(ctx, 240, 819.3, 13 + 3 * pulse, '90, 230, 150', 0.55);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(240, 819.3, 3.4, 0, TAU);
    ctx.fill();
    this.text(ctx, 'SELECTED · T-120 s', 250, 813, '#7fd6a2', 8.5, 700, 'left', 0.4);

    this.text(ctx, 'burn earlier ←', 48, 872, '#2b2e35', 7.6);
    this.text(ctx, '→ later', 339.5, 872, '#2b2e35', 7.6, 400, 'right');

    this.text(ctx, 'SPACECRAFT', 20, 895.5, '#383b42', 9);
    this.text(ctx, 'fuel 3.43 kg', 20, 910.5, '#d8dadf', 10, 700);
    this.text(ctx, 'batt 86%', 188, 910.5, '#d8dadf', 10, 700);
    ctx.fillStyle = '#1b1f25';
    ctx.fillRect(20, 915, 155, 4);
    ctx.fillRect(188, 915, 153, 4);
    ctx.fillStyle = '#6bd493';
    ctx.fillRect(20, 915, 135.5, 4);
    ctx.fillStyle = '#9ddff5';
    ctx.fillRect(188, 915, 130, 4);
    this.text(ctx, '536 burns of 0.1 m/s remaining · attitude err 0.95″', 19, 933, '#3c3f46', 8.5);

    this.slantPath(ctx, 146, 937, 200, 17, 4);
    ctx.fillStyle = '#0e2a1c';
    ctx.fill();
    ctx.strokeStyle = '#5fbf8a';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const verify = rm ? 1 : 0.82 + 0.18 * Math.sin(t * TAU * 0.5);
    this.text(ctx, 'BURN COMPLETE · verifying new orbit', 246, 949.5, rgba('#72d69c', verify), 9, 700, 'center', 0.3);
  }

  // ── Pc evolution ──────────────────────────────────────────────────────────────────────────────
  drawPc(ctx, t, rm) {
    this.panel(ctx, 'pc', 'Pc EVOLUTION', '#f04a52', '#3e2930', { sub: ['collision proba…', 529] });
    this.badge(ctx, 712.5, 642.5, 'TCA 13:52:48', C.red, { fill: '#2a0d12', stroke: '#c23f4b' });

    ctx.fillStyle = '#160a0e';
    ctx.fillRect(413, 677, 291, 48);
    ctx.fillStyle = '#1e1117';
    ctx.fillRect(413, 677, 291, 1);
    ctx.fillStyle = '#5a1a22';
    ctx.fillRect(413, 724.5, 291, 1.5);
    ctx.fillStyle = '#110f0c';
    ctx.fillRect(413, 726, 291, 22);
    ctx.fillStyle = '#4a3a22';
    ctx.fillRect(413, 748, 291, 1.2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (const y of [772, 820, 844]) ctx.fillRect(413, y, 291, 1);
    for (const x of [413.5, 484.5, 554.5, 624, 694.5]) ctx.fillRect(x, 677, 1, 186);

    const yl = [['1e-2', 682], ['1e-4', 730], ['1e-6', 777], ['1e-8', 825], ['1e-10', 848]];
    for (const [s, y] of yl) this.text(ctx, s, 410.5, y, '#2b2e35', 8, 400, 'right');
    const xl = [['-10:00', 413.5], ['-7:30', 484.5], ['-5:00', 554.5], ['-2:30', 624], ['TCA', 694.5]];
    for (const [s, x] of xl) this.text(ctx, s, x, 880, '#2b2e35', 8, 400, 'center');

    ctx.strokeStyle = 'rgba(205, 112, 62, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(582.5, 678);
    ctx.lineTo(582.5, 868);
    ctx.stroke();
    this.text(ctx, 'PLAN', 585, 701, '#d27b44', 9, 700);
    ctx.strokeStyle = 'rgba(80, 200, 120, 0.75)';
    ctx.beginPath();
    ctx.moveTo(637.5, 678);
    ctx.lineTo(637.5, 868);
    ctx.stroke();
    this.text(ctx, 'BURN', 640, 689, '#62c98a', 8.6, 700);

    this.text(ctx, 'MANEUVER ≥ 1e-4', 699, 722.5, '#d4505d', 8.6, 700, 'right');
    this.text(ctx, 'WATCH ≥ 1e-5', 703, 745.5, '#e2bb5c', 8.6, 700, 'right');

    // Pc history (log scale, 24 px per decade), the σ envelope of the last CDMs, and the post-burn floor.
    const nowX = 669 + (t / 60) * 28.1;
    ctx.fillStyle = 'rgba(120, 100, 200, 0.16)';
    ctx.fillRect(563, 704, 50, 13);
    ctx.fillRect(612, 711, 26, 14);
    const curve = [[413, 709], [503, 709], [510, 705], [557, 705], [563, 709], [612, 709], [618, 716], [638, 716], [640.5, 843], [nowX, 843]];
    ctx.save();
    ctx.shadowColor = 'rgba(150, 120, 240, 0.75)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#a99ce2';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    curve.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    this.restore(ctx);
    ctx.strokeStyle = 'rgba(150, 140, 220, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX + 6, 843);
    ctx.lineTo(698, 843);
    ctx.stroke();
    ctx.setLineDash([]);

    this.text(ctx, '<1e-10', 625, 838, '#e3e5ea', 9.5, 700);
    const pulse = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * TAU * 0.8);
    this.glowDot(ctx, nowX, 843, 13 + 2 * pulse, '170, 150, 255', 0.6);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(nowX, 843, 3.2, 0, TAU);
    ctx.fill();

    const ticks = [613.5, 668];
    for (let k = 0; k < 3; k++) if (t >= 10 + k * 8) ticks.push(669 + ((10 + k * 8) / 60) * 28.1);
    ctx.fillStyle = '#8c88b4';
    for (const x of ticks) ctx.fillRect(x - 1, 860, 2, 6);

    const labels = [['Pc NOW', 379], ['MISS', 448], ['σ COMBINED', 515], ['OBS USED', 584], ['REL V', 651]];
    for (const [s, x] of labels) this.text(ctx, s, x, 921, '#3a3e46', 8);
    const obsUsed = 18 + ticks.length - 2;
    this.text(ctx, '<1e-10', 380, 938.5, '#6fd49a', 12.5, 700);
    this.text(ctx, '1,835 m', 448, 938.5, '#d8dadf', 12.5, 700);
    this.text(ctx, '105 m', 515, 938.5, '#9d97e0', 12.5, 700);
    this.text(ctx, String(obsUsed), 584, 938.5, '#d8dadf', 12.5, 700);
    this.text(ctx, '12.9 km/s', 652, 938.5, '#ef8a4a', 12.5, 700);
  }

  // ── ground link ───────────────────────────────────────────────────────────────────────────────
  drawGround(ctx, t, sec, rm) {
    this.panel(ctx, 'ground', 'GROUND LINK', '#5fcf8a', '#3e4f47', { sub: ['TT&C passes · next 10…', 879] });
    this.badge(ctx, 1064.5, 642.5, 'KW-5A', C.cyan, { fill: '#0c1c24', stroke: '#5f93a8' });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let k = 0; k < 6; k++) ctx.fillRect(Math.round(838 + 29.2 * k) - 0.5, 680, 1, 122);

    const stations = [
      ['SVALBARD', '78°N', 867],
      ['FAIRBANKS', '65°N', 899],
      ['HARTEBEESTHOEK', '26°S', 0],
      ['PUNTA ARENAS', '53°S', 895],
    ];
    const drift = (t / 120) * 29.2;
    stations.forEach(([name, lat, end], i) => {
      const y = 693 + i * 30;
      this.text(ctx, name, 740, y, '#cbced4', 9, 700, 'left', 0.2);
      this.text(ctx, lat, 740, y + 9, '#26292f', 7);
      if (end) {
        const x1 = end - drift;
        ctx.save();
        ctx.shadowColor = 'rgba(80, 230, 140, 0.45)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#57e08c';
        ctx.fillRect(837, y - 9, x1 - 837, 14);
        this.restore(ctx);
        this.scanlines(ctx, 837, y - 9, x1 - 837, 14, 0.14, 3, 1);
        ctx.fillStyle = 'rgba(0, 40, 20, 0.35)';
        for (let gx = 866.8 - drift; gx < x1 - 1; gx += 29.2) if (gx > 838) ctx.fillRect(gx, y - 9, 1, 14);
        this.badge(ctx, 0, y - 11, 'IN CONTACT', C.green, {
          left: 994,
          size: 7.3,
          ls: 0.45,
          h: 13,
          slant: 3,
          baselinePad: 3.2,
          fill: '#0d2419',
          stroke: '#4f9a6c',
          lineWidth: 1,
        });
      }
    });
    const axis = [['now', 838], ['+2m', 868], ['+4m', 896], ['+6m', 925], ['+8m', 954], ['+10m', 984]];
    for (const [s, x] of axis) this.text(ctx, s, x, 811, '#2c2f36', 7.5, 400, 'center');

    this.text(ctx, 'COMMAND QUEUE', 740, 826, '#383b42', 8.8);
    const tlm = clamp(0.597 + t * 0.0105, 0, 1);
    const cmds = [
      ['BURN SEQ', 'KW-5A · Δv 0.196 m/s', 'ACKED', 1],
      ['ATT SLEW', 'KW-5A · prograde · 14 s', 'ACKED', 1],
      ['TLM DUMP', 'fleet · 48 sats · 2.1 MB', 'STREAMING', tlm],
    ];
    cmds.forEach(([name, detail, status, frac], i) => {
      const y = 843 + i * 22;
      this.text(ctx, name, 740, y, '#d5d8dd', 9.6, 700);
      this.text(ctx, detail, 814, y, '#50545d', 8.5);
      const stream = status === 'STREAMING';
      this.text(ctx, status, 1060, y, stream ? '#8cc6da' : '#5cc282', 7.7, 700, 'right');
      ctx.fillStyle = '#14171e';
      ctx.fillRect(740, y + 4, 320, 3);
      ctx.fillStyle = stream ? '#9fd8ee' : '#66b07c';
      ctx.fillRect(740, y + 4, 320 * frac, 3);
    });

    const step = rm ? 0 : Math.floor(t / 2);
    const jitter = (seed, amp) => (step === 0 ? 0 : Math.round((hash(seed + step * 3.7) - 0.5) * 2 * amp));
    const down = (4.6 + jitter(11, 2) / 10).toFixed(1);
    const rssi = -93 + jitter(23, 2);
    const lat = 34 + jitter(37, 3);
    const tele = [['UPLINK', 740, '2.1 kbps', '#6fd49a'], ['DOWNLINK', 821, `${down} Mbps`, '#6fd49a'], ['RSSI', 901, `${rssi} dBm`, '#d8dadf'], ['LATENCY', 986, `${lat} ms`, '#d8dadf']];
    for (const [label, x, value, color] of tele) {
      this.text(ctx, label, x, 917, '#383b42', 7.8);
      this.text(ctx, value, x, 933.5, color, 12.5, 700);
    }
  }

  // ── event log ─────────────────────────────────────────────────────────────────────────────────
  drawEventLog(ctx, t, rm) {
    this.panel(ctx, 'event', 'EVENT LOG', '#c5c7cc', '#56585e', {
      sub: ['CDM · track · plan · uplink · burn · clear', 137],
      subColor: '#4b4f5a',
    });

    const lines = LOG.map(l => [...l]);
    let lastAt = -Infinity;
    for (const [at, tag, msg] of LOG_LIVE) {
      if (at > t) break;
      lines.push([hms(SIM_T0 + at), tag, msg]);
      lastAt = at;
    }
    const k = rm ? 1 : clamp((t - lastAt) / 0.45, 0, 1);
    const slide = (1 - easeOutCubic(k)) * 18;
    const visible = lines.slice(-16);
    const count = visible.length;

    ctx.save();
    ctx.beginPath();
    ctx.rect(9, 1010, 525, 281);
    ctx.clip();
    visible.forEach(([ts, tag, msg], idx) => {
      const fromBottom = count - 1 - idx;
      const y = 1284 - fromBottom * 18 + slide;
      if (y < 1012 || y > 1300) return;
      const fadeTop = clamp((y - 1018) / 14, 0, 1);
      const latest = fromBottom === 0;
      const hl = latest ? (rm ? 1 : smoothstep(0, 0.35, t - Math.max(lastAt, -1))) : 0;
      const prevHl = !latest && fromBottom === 1 && lastAt > -Infinity ? 1 - smoothstep(0, 0.35, t - lastAt) : 0;
      const h = Math.max(hl, prevHl, latest && lastAt === -Infinity ? 1 : 0);
      ctx.globalAlpha = fadeTop;
      if (h > 0) {
        ctx.fillStyle = `rgba(30, 30, 58, ${0.62 * h})`;
        ctx.fillRect(9, y - 16, 525, 22);
        ctx.fillStyle = `rgba(123, 116, 201, ${h})`;
        ctx.fillRect(9, y - 13, 3, 16);
      }
      const col = TAGS[tag] || C.lavender;
      this.text(ctx, ts, 20, y, '#373a41', 9.5);
      this.slantPath(ctx, 77, y - 12.5, 23, 13, 3);
      ctx.fillStyle = h > 0.5 && tag === 'TRK' ? rgba('#8f88d8', 0.85 * h) : rgba(col, 0.16);
      ctx.fill();
      ctx.strokeStyle = rgba(col, 0.85);
      ctx.lineWidth = 1;
      ctx.stroke();
      this.text(ctx, tag, 88.5, y - 2.6, h > 0.5 && tag === 'TRK' ? '#1b1838' : col, 6.8, 700, 'center');
      this.text(ctx, msg, 116, y - 1, h > 0.5 ? '#a9acb4' : '#80838b', 9.5);
      ctx.globalAlpha = 1;
    });
    this.restore(ctx);
  }

  // ── fleet state ───────────────────────────────────────────────────────────────────────────────
  drawFleet(ctx, t, rm) {
    this.panel(ctx, 'fleet', 'FLEET STATE', '#7cc4de', '#4b5860', {
      sub: ['48 spacecraft · fuel · mode', 695],
      subColor: '#474b56',
    });
    this.badge(ctx, 1064.5, 973.5, '40 NOMINAL · 8 IN CONJ', C.cyan, { fill: '#0c1c24', stroke: '#5f93a8', h: 15.5 });

    // Drawn in passes (shapes, then each text style) so the font only changes a handful of times.
    const letters = 'ABCDEFGH';
    const cells = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 8; c++) {
        const id = `${r + 1}${letters[c]}`;
        const conj = id === '5A';
        const watch = FLEET_WATCH.has(id);
        cells.push({ r, c, id, conj, watch, x: 574 + c * 61, y: 1002 + r * 42, fuel: FLEET_FUEL[r][c], status: conj ? 'CONJ' : watch ? 'WATCH' : 'NOM' });
      }
    }
    const statusW = {};
    for (const s of ['CONJ', 'WATCH', 'NOM']) statusW[s] = this.textWidth(ctx, s, 6.4, 700);

    ctx.lineWidth = 1;
    for (const { r, c, conj, watch, x, y, fuel, status } of cells) {
      if (conj) {
        const glow = rm ? 0.5 : 0.5 + 0.5 * Math.sin(t * TAU * 0.5);
        this.glowDot(ctx, x + 28, y + 18, 40, '80, 200, 130', 0.1 + 0.08 * glow);
      }
      ctx.fillStyle = conj ? '#1a432b' : watch ? '#2b281a' : '#0f1820';
      ctx.fillRect(x, y, 56, 36);
      ctx.strokeStyle = conj ? '#58a874' : watch ? '#6e5732' : '#3a4851';
      ctx.strokeRect(x + 0.5, y + 0.5, 55, 35);
      ctx.fillStyle = conj ? 'rgba(29, 74, 49, 0.7)' : watch ? 'rgba(58, 45, 20, 0.7)' : 'rgba(22, 44, 55, 0.55)';
      ctx.fillRect(x + 49 - statusW[status], y + 7, statusW[status] + 4, 9);
      ctx.fillStyle = conj ? '#21412f' : '#1d272c';
      ctx.fillRect(x + 5, y + 20, 45, 3);
      ctx.fillStyle = '#8cc3d3';
      ctx.fillRect(x + 5, y + 20, 45 * clamp(fuel / 3.7, 0, 1), 3);
      ctx.fillStyle = '#5db37f';
      ctx.fillRect(x + 5, y + 27, 45 * (0.84 + hash(r * 8 + c + 0.5) * 0.15), 2);
    }
    for (let r = 0; r < 6; r++) this.text(ctx, `P${r + 1}`, 552, 1025 + r * 42, '#2a2e35', 8);
    for (const { id, x, y } of cells) this.text(ctx, `KW-${id}`, x + 5, y + 14, '#cdd0d6', 8.5, 700);
    for (const { conj, watch, x, y, status } of cells) {
      this.text(ctx, status, x + 51, y + 14, conj ? '#6fd49a' : watch ? '#e3b25e' : '#6f9fb2', 6.4, 700, 'right');
    }
    for (const { x, y, fuel } of cells) this.text(ctx, `${fuel.toFixed(2)} kg`, x + 5, y + 35.5, '#56626c', 6.6);

    const legend = [[555, '#80c4dc', 'nominal', 567], [615, '#d8a850', 'in conjunction queue', 627], [738, '#4fbf7a', 'post-burn', 750], [806, '#d84a50', 'maneuver active', 818]];
    for (const [sx, col, label, tx] of legend) {
      ctx.fillStyle = col;
      ctx.fillRect(sx, 1277, 8, 8);
      this.scanlines(ctx, sx, 1277, 8, 8, 0.18, 3, 0);
      this.text(ctx, label, tx, 1285, '#4a4e57', 8.5);
    }
  }
}
