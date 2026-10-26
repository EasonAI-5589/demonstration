import { BAUHAUS_TRACK } from './bauhaus-track.js';

const lerp = (a, b, k) => a + (b - a) * k;
const INK = '#191a18';
const BLUE = '#1f6aa5';
const CODE = [
  'redX = map(sin(t*0.3),-1,1,50,350);',
  'rect(redX,120,200,300);',
  'blueY = map(sin(t*0.5),-1,1,50,650);',
  'ellipse(120,blueY,140,140);',
  'yellowX = map(cos(t*0.4),-1,1,200,450);',
  'yellowY = map(sin(t*0.4+1),-1,1,300,600);',
  'rotate(radians(t*30));',
  'triangle(0,-65,-65,65,65,65);',
  'barW = map(sin(t*0.6),-1,1,100,400);',
  'rect(50,520,barW,30);',
  'lineX = map(cos(t*0.7),-1,1,300,500);',
  'line(lineX,100,lineX,700);',
  'smallX = map(sin(t*0.9),-1,1,20,480);',
  'smallY = map(cos(t*0.8),-1,1,200,750);',
  'rect(smallX,smallY,40,40);',
];

/** Native vector recreation driven by geometry measured in the 75-frame reference. */
export class BauhausPrimaryScene {
  constructor() {
    this.width = BAUHAUS_TRACK.width;
    this.height = BAUHAUS_TRACK.height;
    this.duration = BAUHAUS_TRACK.duration;
  }

  stateAt(elapsed) {
    const t = Math.max(0, Math.min(this.duration, Number(elapsed) || 0));
    const samples = BAUHAUS_TRACK.samples;
    const i = Math.min(samples.length - 1, Math.floor(t / 0.03));
    const a = samples[i], b = samples[Math.min(i + 1, samples.length - 1)];
    const k = b.t > a.t ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 0;
    return {
      t, redX: lerp(a.redX, b.redX, k), blueY: lerp(a.blueY, b.blueY, k),
      lineX: lerp(a.lineX, b.lineX, k), barWidth: lerp(a.barWidth, b.barWidth, k),
      square: a.square.map((v, j) => lerp(v, b.square[j], k)),
      triangle: a.triangle.map((p, j) => p.map((v, q) => lerp(v, b.triangle[j][q], k))),
    };
  }

  text(ctx, str, x, y, size, color = INK, weight = 400, family = 'Arial, sans-serif') {
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  render(ctx, state) {
    // Explicit scrubbing still reveals the measured pose under reduced motion.
    const s = this.stateAt(state.reducedMotion && state.playing ? 0 : state.elapsed);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fffef4';
    ctx.fillRect(0, 0, this.width, this.height);
    // Fixed procedural paper grain, independent of time or render order.
    ctx.fillStyle = 'rgba(63,70,55,.045)';
    for (let i = 0; i < 1150; i++) {
      const x = ((i * 341.719) % this.width);
      const y = ((i * i * 13.371 + i * 17.3) % this.height);
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.strokeStyle = 'rgba(31,106,165,.25)';
    ctx.lineWidth = 0.65;
    ctx.setLineDash([1, 3]);
    for (const y of [54, 80, 160, 240, 268, 321, 347, 427, 454, 507, 535, 615, 695]) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(479, y); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(479, 54); ctx.lineTo(479, 702); ctx.stroke();

    ctx.fillStyle = '#ce5c47';
    ctx.fillRect(s.redX, 108, 180, 270);
    ctx.fillStyle = '#3e7eb0';
    ctx.beginPath(); ctx.arc(108, s.blueY, 63, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e9b847';
    ctx.beginPath();
    s.triangle.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillRect(45, 467, s.barWidth, 28);
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(s.lineX + 0.5, 90); ctx.lineTo(s.lineX + 0.5, 630); ctx.stroke();
    ctx.fillStyle = BLUE;
    ctx.fillRect(s.square[0], s.square[1], 36, 36);

    this.text(ctx, 'Mechanical Rhythm', 23, 55, 40, BLUE, 700);
    this.text(ctx, 'of Primary Colors', 23, 105, 40, BLUE, 700);
    ctx.fillStyle = '#ce5c47';
    ctx.beginPath(); ctx.arc(36, 36, 9, 0, Math.PI * 2); ctx.fill();
    this.text(ctx, 'Course: Open Source Programming | Instructor: ZHANG Fan', 23, 153, 10.5);
    this.text(ctx, 'Core Code', 493, 99, 32, INK, 700);
    CODE.forEach((line, i) => this.text(ctx, line, 515, 126 + i * 21.4, 13, '#6f7167', 400, 'Consolas, monospace'));
    this.text(ctx, '—— The above code drives the animation on the left poster', 515, 471, 12, '#73746b');
    [
      'Design Concept: Inspired by Bauhaus geometric abstraction and primary colors,',
      'the dynamic composition expresses rational order and mechanical rhythm.',
      'Red, yellow, and blue blocks move across the grid, while lines cut through space,',
      'embodying the design philosophy: form follows function.',
    ].forEach((line, i) => this.text(ctx, line, 515, 514 + i * 18, 12, '#73746b'));
    this.text(ctx, 'Student: Tian Yuze · 田玉泽 | Open Source Programming', 23, 665, 10.5, '#85867b', 400, 'Consolas, sans-serif');
    this.text(ctx, 'Vector reconstruction | measured 75-frame motion study', 23, 683, 10.5, '#85867b', 400, 'Consolas, sans-serif');
    this.text(ctx, 'Mechanical Rhythm of Primary Colors · original study / 2026', 515, 683, 10.5, '#73746b');
    ctx.restore();
  }
}
