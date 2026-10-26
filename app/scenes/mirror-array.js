const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);

// Source corner measurements, in the original 640×360 recording.
const PANEL = [[111, 21], [491, 76], [491, 269], [111, 323]];
const project = (u, v) => [mix(mix(111, 491, u), mix(111, 491, u), v), mix(mix(21, 76, u), mix(323, 269, u), v)];
function polygon(ctx, points, fill) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}
function person(ctx, x, y, scale, reflection = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  const shirt = ctx.createLinearGradient(-35, 0, 40, 140);
  shirt.addColorStop(0, reflection ? '#222528' : '#111419'); shirt.addColorStop(1, '#030608');
  ctx.fillStyle = shirt;
  ctx.beginPath(); ctx.moveTo(-27, 34); ctx.bezierCurveTo(-50, 42, -58, 95, -62, 161);
  ctx.lineTo(69, 161); ctx.bezierCurveTo(60, 98, 54, 42, 30, 33);
  ctx.bezierCurveTo(13, 48, -11, 46, -27, 34); ctx.fill();
  ctx.fillStyle = '#b5977c';
  ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-13, 27); ctx.lineTo(-27, 34);
  ctx.bezierCurveTo(-11, 54, 13, 56, 30, 33); ctx.lineTo(10, 22); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
  const skin = ctx.createLinearGradient(-24, -30, 17, 14);
  skin.addColorStop(0, '#bda085'); skin.addColorStop(.6, '#d0b79a'); skin.addColorStop(1, '#816953');
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.moveTo(-21, -32); ctx.bezierCurveTo(-35, -21, -30, -9, -35, -3);
  ctx.lineTo(-28, 0); ctx.bezierCurveTo(-26, 16, -5, 25, 14, 6); ctx.lineTo(22, -20); ctx.closePath(); ctx.fill();
  const hair = ctx.createRadialGradient(-3, -24, 4, 1, -20, 34);
  hair.addColorStop(0, '#3d332a'); hair.addColorStop(.55, '#211c17'); hair.addColorStop(1, '#0c0d0d');
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -24, 28, 28, -.16, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(23, -36, 14, 13, -.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(171,139,103,.18)'; ctx.lineWidth = .7;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(2, -23, 17 + i * 1.1, 3.5, 5.8); ctx.stroke(); }
  ctx.restore();
}
export class MirrorArrayScene {
  constructor() { this.width = 1080; this.height = 608; this.duration = 5.61; }
  stateAt(elapsed, reducedMotion = false, pointer = null) {
    const t = clamp(Number(elapsed) || 0, 0, this.duration);
    const p = reducedMotion ? .42 : t / this.duration;
    const px = pointer && Number.isFinite(pointer.x) ? clamp(pointer.x > 1 ? pointer.x / this.width : pointer.x) : null;
    return { t, phase: p, visitorX: mix(565, 555, smooth(.05, .85, p)), front: px ?? mix(.04, .62, smooth(.18, .95, p)) };
  }
  render(ctx, state = {}) {
    const s = this.stateAt(state.elapsed, state.reducedMotion, state.pointer);
    ctx.save(); ctx.scale(this.width / 640, this.height / 360);
    const wall = ctx.createLinearGradient(0, 0, 640, 210);
    wall.addColorStop(0, '#d3d1cc'); wall.addColorStop(.3, '#e8e6df'); wall.addColorStop(.83, '#faf9f4'); wall.addColorStop(1, '#d9dfe2');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, 640, 360);
    polygon(ctx, [[0, 347], [640, 294], [640, 360], [0, 360]], '#d9d8d3');
    ctx.fillStyle = '#eef3f5'; ctx.fillRect(606, 0, 34, 329); ctx.fillStyle = '#b6bec1'; ctx.fillRect(603, 0, 4, 329);
    ctx.fillStyle = '#fdfefb'; ctx.fillRect(612, 0, 22, 326); ctx.fillStyle = '#bcbfbd'; ctx.fillRect(596, 306, 44, 5);
    ctx.save(); ctx.shadowColor = 'rgba(24,25,24,.45)'; ctx.shadowBlur = 13; ctx.shadowOffsetX = -7; ctx.shadowOffsetY = 8;
    polygon(ctx, [[100, 13], [497, 68], [497, 276], [100, 336]], '#242627'); ctx.restore();
    polygon(ctx, [[101, 16], [110, 21], [110, 324], [101, 332]], '#131718');
    // The room and visitor are vectors. Reflection fields and hinge angles are
    // inferred from footage; they are not recovered optical or sensor data.
    for (let row = 0; row < 9; row++) for (let col = 0; col < 21; col++) {
      const u = (col + .5) / 21;
      const wave = smooth(u - .13, u + .1, s.front) * (.7 + .3 * Math.sin(row * .63 + s.phase * 2.4));
      const tilt = .025 + wave * .66, half = (1 - .3 * Math.sin(tilt)) / 42;
      const points = [project(u - half, row / 9 + .006), project(u + half, row / 9 + .006), project(u + half, (row + 1) / 9 - .006), project(u - half, (row + 1) / 9 - .006)];
      points[0][0] -= wave * 2; points[1][0] -= wave * 2;
      points[2][0] += wave * 2; points[3][0] += wave * 2;
      ctx.save(); polygon(ctx, points); ctx.clip();
      const shade = Math.round(174 + 12 * hash(col * 79 + row) - wave * 19);
      ctx.fillStyle = `rgb(${shade},${shade + 1},${shade - 3})`; ctx.fillRect(105, 20, 390, 310);
      const windowX = 173 + wave * 31;
      ctx.fillStyle = '#f8faf7'; ctx.fillRect(windowX, 5, 69, 315);
      ctx.fillStyle = '#e0e6e4'; ctx.fillRect(windowX + 20, 5, 6, 315);
      ctx.fillStyle = '#aeb7b9'; ctx.fillRect(windowX + 52, 5, 4, 315);
      ctx.fillStyle = '#434747'; ctx.fillRect(315, 132, 51, 70); ctx.fillStyle = '#626866'; ctx.fillRect(321, 136, 39, 61);
      for (let k = 0; k < 12; k++) { ctx.fillStyle = k % 3 ? '#d0cebc' : '#3b3f3d'; ctx.fillRect(322 + k % 4 * 10, 139 + Math.floor(k / 4) * 20, 3, 3); }
      ctx.globalAlpha = smooth(.12, .7, s.phase); person(ctx, 111 + s.phase * 93 + wave * 4, 186, .48, true); ctx.globalAlpha = 1;
      if (wave > .1) { const edge = points[0]; ctx.fillStyle = `rgba(7,12,14,${wave * .92})`; ctx.fillRect(edge[0], edge[1] - 4, 2.4 + wave * 4, 44); }
      ctx.restore(); ctx.strokeStyle = '#303636'; ctx.lineWidth = .65; polygon(ctx, points); ctx.stroke();
    }
    ctx.strokeStyle = '#555957'; ctx.lineWidth = 1.2; polygon(ctx, PANEL); ctx.stroke();
    person(ctx, s.visitorX, 139 + Math.sin(s.phase * Math.PI) * 1.8, 1.17);
    ctx.restore();
  }
}
