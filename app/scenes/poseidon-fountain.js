const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);

export class PoseidonFountainScene {
  constructor() { this.width = 1080; this.height = 609; this.duration = 2; }
  stateAt(elapsed, reducedMotion = false) {
    const time = clamp(Number(elapsed) || 0, 0, this.duration), t = reducedMotion ? .6 : time;
    // The reference has no audio track. This envelope follows its visible ring
    // expansion and is not presented as recovered musical or physical data.
    return { time, t, phase: t / this.duration, pulse: clamp((t - 1.27) / .69), height: 55 + 3 * Math.cos(t * TAU / 2) };
  }
  render(ctx, state = {}) {
    const s = this.stateAt(state.elapsed, state.reducedMotion);
    ctx.save(); ctx.scale(3, 3);
    const bg = ctx.createRadialGradient(170, 139, 9, 174, 126, 238);
    bg.addColorStop(0, '#050814'); bg.addColorStop(1, '#03060c'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 360, 203);
    const cx = 166, cy = 151;
    // Particle age is analytic and seeded: seeking backwards cannot retain
    // simulation history from a later timestamp.
    const emitters = Array.from({ length: 10 }, (_, k) => ({ k, angle: k / 10 * TAU })).sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle));
    for (const { k, angle } of emitters) {
      const x0 = cx + Math.cos(angle) * 47, y0 = cy + Math.sin(angle) * 12;
      for (let n = 0; n < 55; n++) {
        const seed = k * 113 + n, age = fract(n / 55 + s.phase * 2 + hash(seed + 92) * .08);
        const height = s.height * (.85 + hash(k + 37) * .18);
        const y = y0 - 4 * age * (1 - age) * height, x = x0 + Math.sin(age * Math.PI) * (hash(seed + 54) - .5) * 3.4;
        const alpha = .35 + hash(seed + 15) * .6, white = hash(seed + 22) > .82;
        ctx.fillStyle = white ? `rgba(207,194,255,${alpha})` : `rgba(124,103,255,${alpha})`;
        const radius = .55 + hash(seed + 29) * .65; ctx.fillRect(x, y, radius, radius * (1.2 + age * 1.6));
        if (white && age > .4 && age < .7) { ctx.fillStyle = 'rgba(87,58,255,.14)'; ctx.fillRect(x - 1, y - 1, 2.4, 2.4); }
      }
    }
    for (let n = 0; n < 104; n++) {
      const a = n / 104 * TAU, blink = .35 + .35 * Math.sin(a * 7 + s.t * TAU);
      ctx.fillStyle = `rgba(131,106,255,${blink})`; ctx.fillRect(cx + Math.cos(a) * 53, cy + Math.sin(a) * 13, .8, .65);
    }
    // Small outer white jets are visible in the GIF, but their exact emitters
    // are unresolved at 360×203. These fixed samples preserve the silhouette.
    for (let k = 0; k < 18; k++) {
      const angle = k / 18 * TAU;
      for (let j = 0; j < 5; j++) {
        const age = fract(j / 5 + s.phase * 2 + hash(k + 57)), radius = 69 + age * 4;
        const x = cx + Math.cos(angle) * radius, y = cy + 4 + Math.sin(angle) * 17 - Math.sin(age * Math.PI) * (9 + hash(k) * 8);
        ctx.fillStyle = `rgba(195,209,214,${.25 + hash(k * 19 + j) * .58})`; ctx.fillRect(x, y, .65, 1.6);
      }
    }
    if (s.pulse > 0) for (let ring = 0; ring < 4; ring++) {
      const radius = 5 + s.pulse * 42 - ring * 3.1;
      if (radius <= 1) continue;
      for (let n = 0; n < 130; n++) {
        const a = n / 130 * TAU; ctx.fillStyle = `rgba(209,210,255,${.6 - ring * .1})`;
        ctx.fillRect(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * .255, .72, .7);
      }
    }
    ctx.restore();
  }
}
