// Scene 02: REA · BYTES IN. SOURCE OUT. (Dual-Ring Disassembler vs Decompiler Handoff)
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const LEFT_LABELS = ['mk-31 redo', 'd-0412', 'mk-52 ok', 'q03 12.9', 'mk-64 draft', 'mk-07 draft', 'mk-12 ok', 'I draft'];
const RIGHT_LABELS = ['ck-11 pass', 'ck-03 pass', 'ck-02 pass', 'v12 08.1', 'ck-16 pass', 'd-0412 ok', 'ck-07 bounce', 'I pass'];
const HANDOFF_ROWS = [
  ['d-0417', 'mk-14 → ck-03', 'PASS', 0.92],
  ['d-0418', 'mk-31 → ck-09', 'WAIT', 0.54],
  ['d-0419', 'mk-07 → ck-11', 'PASS', 0.88],
  ['d-0420', 'mk-52 → ck-07', 'PASS', 0.96],
  ['d-0421', 'mk-40 → ck-02', 'PASS', 0.91],
  ['d-0422', 'mk-12 → ck-15', 'REDO', 0.43],
  ['d-0423', 'mk-60 → ck-05', 'PASS', 0.89],
  ['d-0412', 'mk-19 → ck-12', 'PASS', 0.84],
  ['d-0413', 'mk-51 → ck-04', 'PASS', 0.95],
];
const CODE_LINES = [
  '// nothing ships unchecked',
  '// dual arc · maker + checker',
  'import { ring, gap } from "orbit"',
  'const mk = ring("L", { agents: 64 })',
  'const ck = ring("R", { agents: 16 })',
  'async function draft(task) {',
  '  return gap.send(d)',
  '}',
  'async function check(d) {',
  '  const ok = await ck.verify(d)',
  '  if (!ok) return gap.bounce(d)',
  '  return ship(d)',
  '}',
  'for (const t of queue) {',
  '  ck.align(mk.wave)',
  '  spawn(draft, t)',
  '}',
  'gap.on("draft", check)',
  'gap.on("bounce", d => mk.redo(d))',
];

export class ReaDecompilerScene {
  constructor() {
    this.duration = 24;
  }

  font(ctx, size = 11, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#18181b', size = 11, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const progress = clamp(t / this.duration, 0, 1);
    const lifted = Math.floor(progress * 1840);
    const decompiled = Math.floor(progress * 1390);
    const flagged = Math.floor(progress * 395);
    const syncPct = Math.round(clamp(progress * 74, 0, 74));
    const phaseGap = (0.48 - progress * 0.31 + Math.sin(t * 1.7) * 0.02).toFixed(2);
    const phaseName = progress < 0.18 ? 'loading' : progress < 0.72 ? 'linking' : 'verified';

    // Warm paper background
    ctx.fillStyle = '#f7f6f2';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Top telemetry bar
    ctx.fillStyle = '#efeee8';
    ctx.fillRect(0, 0, WIDTH, 36);
    ctx.strokeStyle = '#dcdad2';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 36.5); ctx.lineTo(WIDTH, 36.5); ctx.stroke();

    this.text(ctx, 'REA', 16, 23, '#18181b', 13, 700);
    const topMetrics = [
      ['RUN', 'rea-lab-01', '#27272a', 155],
      ['LIFTED', lifted.toLocaleString(), '#c2410c', 260],
      ['DECOMPILED', decompiled.toLocaleString(), '#0f766e', 340],
      ['FLAGGED', flagged.toLocaleString(), '#db2777', 425],
      ['SYNC', `${syncPct}%`, '#18181b', 495],
      ['CAM', `×${(0.8 + progress * 0.55).toFixed(2)}`, '#0284c7', 555],
      ['STATE', phaseName, '#18181b', 620],
      ['SIM', 'illustrative', '#71717a', 705],
    ];
    for (const [k, v, col, x] of topMetrics) {
      this.text(ctx, k, x, 13, '#8e8d87', 8.5, 600);
      this.text(ctx, v, x, 27, col, 11.5, 700);
    }
    this.text(ctx, 'REA · reverse engineering', WIDTH - 16, 23, '#27272a', 12, 700, 'right');

    // Upper Dual-Arc Arena
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 37, WIDTH, 830);
    ctx.clip();

    const leftCx = -215, leftCy = 445, arcR = 525;
    const rightCx = WIDTH + 215, rightCy = 445;

    // 1. Left & Right Dense Neural Webs inside the rings
    for (let i = 0; i < 360; i++) {
      const a1 = (rand(i * 3 + 1) - 0.5) * 1.35;
      const a2 = (rand(i * 7 + 2) - 0.5) * 1.35;
      const r1 = 120 + rand(i * 11 + 3) * (arcR - 135);
      const r2 = 220 + rand(i * 13 + 5) * (arcR - 230);
      const sway = state.reducedMotion ? 0 : Math.sin(t * 0.9 + i) * 6;

      // Left warm web
      ctx.beginPath();
      ctx.moveTo(leftCx + Math.cos(a1) * r1, leftCy + Math.sin(a1) * r1);
      ctx.quadraticCurveTo(
        leftCx + Math.cos((a1 + a2) * 0.5) * 340 + sway,
        leftCy + Math.sin((a1 + a2) * 0.5) * 340 - sway,
        leftCx + Math.cos(a2) * r2,
        leftCy + Math.sin(a2) * r2
      );
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(217, 72, 24, 0.24)' : 'rgba(138, 52, 24, 0.16)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Right cool web
      const b1 = Math.PI + a1;
      const b2 = Math.PI + a2;
      ctx.beginPath();
      ctx.moveTo(rightCx + Math.cos(b1) * r1, rightCy + Math.sin(b1) * r1);
      ctx.quadraticCurveTo(
        rightCx + Math.cos((b1 + b2) * 0.5) * 340 - sway,
        rightCy + Math.sin((b1 + b2) * 0.5) * 340 + sway,
        rightCx + Math.cos(b2) * r2,
        rightCy + Math.sin(b2) * r2
      );
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(14, 165, 233, 0.25)' : 'rgba(15, 76, 129, 0.16)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // 2. Radial histogram spikes & track labels along Left and Right Arcs
    const spikeCount = 210;
    for (let i = 0; i < spikeCount; i++) {
      const u = (i / (spikeCount - 1) - 0.5) * 1.36;
      const waveL = Math.sin(u * 7 + t * 2.2) * 0.35 + Math.cos(u * 13 - t * 1.4) * 0.25;
      const centerBoostL = Math.exp(-((u - 0.08) ** 2) / 0.045) * (0.55 + 0.35 * Math.sin(t * 1.5));
      const lenL = clamp((0.18 + rand(i + 19) * 0.35 + Math.max(0, waveL) * 0.4 + centerBoostL) * (0.45 + progress * 0.65), 0.06, 1.15) * 165;

      const x0L = leftCx + Math.cos(u) * (arcR + 48);
      const y0L = leftCy + Math.sin(u) * (arcR + 48);
      const x1L = leftCx + Math.cos(u) * (arcR + 48 + lenL);
      const y1L = leftCy + Math.sin(u) * (arcR + 48 + lenL);

      ctx.strokeStyle = lenL > 110 ? '#d95f18' : lenL > 65 ? '#853512' : '#291a12';
      ctx.lineWidth = 1.85;
      ctx.beginPath(); ctx.moveTo(x0L, y0L); ctx.lineTo(x1L, y1L); ctx.stroke();

      // Right spike (pointing left toward center)
      const ur = Math.PI - u;
      const waveR = Math.sin(u * 6 - t * 2.0) * 0.35 + Math.cos(u * 11 + t * 1.6) * 0.25;
      const centerBoostR = Math.exp(-((u + 0.06) ** 2) / 0.05) * (0.5 + 0.35 * Math.cos(t * 1.3));
      const lenR = clamp((0.16 + rand(i + 91) * 0.34 + Math.max(0, waveR) * 0.38 + centerBoostR) * (0.45 + progress * 0.65), 0.06, 1.1) * 160;

      const x0R = rightCx + Math.cos(ur) * (arcR + 48);
      const y0R = rightCy + Math.sin(ur) * (arcR + 48);
      const x1R = rightCx + Math.cos(ur) * (arcR + 48 + lenR);
      const y1R = rightCy + Math.sin(ur) * (arcR + 48 + lenR);

      ctx.strokeStyle = lenR > 105 ? '#06b6d4' : lenR > 60 ? '#1d4ed8' : '#0f2942';
      ctx.lineWidth = 1.85;
      ctx.beginPath(); ctx.moveTo(x0R, y0R); ctx.lineTo(x1R, y1R); ctx.stroke();
    }

    // 3. Double ring tracks + rotated labels
    for (const [cx, cy, isRight] of [[leftCx, leftCy, false], [rightCx, rightCy, true]]) {
      for (const dr of [0, 48]) {
        ctx.beginPath();
        ctx.arc(cx, cy, arcR + dr, isRight ? Math.PI - 0.72 : -0.72, isRight ? Math.PI + 0.72 : 0.72);
        ctx.strokeStyle = '#78756e';
        ctx.lineWidth = dr === 0 ? 1.1 : 1.4;
        ctx.stroke();
      }
      // Track labels inside the 48px band
      const labels = isRight ? RIGHT_LABELS : LEFT_LABELS;
      for (let k = 0; k < 44; k++) {
        const u = ((k / 43) - 0.5) * 1.34 + (state.reducedMotion ? 0 : (t * 0.018 * (isRight ? -1 : 1)) % 0.03);
        const angle = isRight ? Math.PI - u : u;
        const tx = cx + Math.cos(angle) * (arcR + 24);
        const ty = cy + Math.sin(angle) * (arcR + 24);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(isRight ? angle - Math.PI : angle);
        const lbl = labels[k % labels.length];
        const bold = lbl.startsWith('I ');
        this.text(ctx, lbl, 0, 3, bold ? '#18181b' : '#57534e', bold ? 9.5 : 8.5, bold ? 700 : 400, 'center');
        ctx.restore();
      }
    }

    // 4. Orbiting Agent Pearls on Left and Right Webs
    for (let i = 0; i < 12; i++) {
      const aL = -0.35 + i * 0.045 + Math.sin(t * 0.8 + i) * 0.02;
      const rL = 160 + i * 28;
      const pxL = leftCx + Math.cos(aL) * rL;
      const pyL = leftCy + Math.sin(aL) * rL;
      ctx.fillStyle = 'rgba(225, 29, 72, 0.25)';
      ctx.beginPath(); ctx.arc(pxL, pyL, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pxL, pyL, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      const aR = Math.PI - 0.32 + i * 0.042 + Math.cos(t * 0.8 + i) * 0.02;
      const rR = 165 + i * 27;
      const pxR = rightCx + Math.cos(aR) * rR;
      const pyR = rightCy + Math.sin(aR) * rR;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.beginPath(); ctx.arc(pxR, pyR, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pxR, pyR, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    // 5. Cross-Gap Handoff Particles & Center Diamond
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = '#a8a29e';
    ctx.beginPath(); ctx.moveTo(WIDTH / 2, 55); ctx.lineTo(WIDTH / 2, 740); ctx.stroke();
    ctx.setLineDash([]);

    for (let p = 0; p < 18; p++) {
      const cycle = fract(t * 0.42 + p * 0.13);
      const y = 95 + ((p * 37) % 580) + Math.sin(cycle * Math.PI * 2 + p) * 14;
      const x = 355 + cycle * 370;
      const isBounce = p % 5 === 0;
      const col = isBounce ? '#db2777' : '#7c3aed';
      const grad = ctx.createLinearGradient(x - 28, y, x, y);
      grad.addColorStop(0, 'rgba(219, 39, 119, 0)');
      grad.addColorStop(1, col);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 26, y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    }

    // Center HANDOFF Diamond
    const cx = WIDTH / 2, cy = 365;
    this.text(ctx, 'HANDOFF', cx, cy - 26, '#18181b', 10.5, 700, 'center');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.reducedMotion ? Math.PI / 4 : Math.PI / 4 + Math.sin(t * 1.8) * 0.22);
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.2;
    ctx.fillRect(-13, -13, 26, 26);
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();
    this.text(ctx, `Δφ ${phaseGap}`, cx, cy + 34, '#18181b', 10.5, 700, 'center');

    // Floating DISASM / DECOMP Badges
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#d6d3cd';
    ctx.lineWidth = 1;
    ctx.fillRect(16, 152, 148, 54);
    ctx.strokeRect(16, 152, 148, 54);
    this.text(ctx, 'DISASM', 28, 176, '#18181b', 19, 700);
    this.text(ctx, '64 agents · lifting', 28, 195, '#57534e', 10);

    ctx.fillRect(WIDTH - 178, 560, 162, 54);
    ctx.strokeRect(WIDTH - 178, 560, 162, 54);
    this.text(ctx, 'DECOMP', WIDTH - 164, 584, '#18181b', 19, 700);
    this.text(ctx, '16 agents · decompiling', WIDTH - 164, 603, '#57534e', 10);

    // Translucent Handoff Ledger Overlay Card (appears as linking progresses)
    if (progress > 0.12) {
      const cardX = 225, cardY = 445, cardW = 630, cardH = 265;
      ctx.fillStyle = 'rgba(247, 246, 242, 0.84)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = '#c7c4bc';
      ctx.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);
      this.text(ctx, 'handoff  ·  disasm → decomp', cardX + 16, cardY + 24, '#18181b', 13, 700);
      this.text(ctx, 'functions cross the gap · verify on arrival', cardX + 16, cardY + 40, '#78716c', 10);

      HANDOFF_ROWS.forEach(([fnId, route, status, baseP], idx) => {
        const ry = cardY + 64 + idx * 21.5;
        const p = clamp(baseP * (0.5 + progress * 0.6), 0.15, 1);
        this.text(ctx, fnId, cardX + 16, ry, '#18181b', 10.5, 700);
        this.text(ctx, route, cardX + 95, ry, '#57534e', 10);
        const stCol = status === 'PASS' ? '#0f766e' : status === 'REDO' ? '#db2777' : '#b45309';
        this.text(ctx, status, cardX + 225, ry, stCol, 10, 700);
        ctx.fillStyle = '#e5e4de';
        ctx.fillRect(cardX + 295, ry - 7, 310, 5);
        ctx.fillStyle = stCol;
        ctx.fillRect(cardX + 295, ry - 7, 310 * p, 5);
      });
    }

    // Bottom Hero Title inside Upper Stage
    ctx.fillStyle = 'rgba(247, 246, 242, 0.92)';
    ctx.fillRect(52, 745, 650, 66);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(58, 752, 4, 50);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(62, 752, 2, 50);
    this.text(ctx, 'REA. BYTES IN. SOURCE OUT.', 76, 779, '#18181b', 31, 700);
    this.text(ctx, 'disassembler on the left  ·  decompiler on the right', 76, 801, '#57534e', 13);
    ctx.restore();

    // Bottom 6-Panel Terminal Console
    this.drawBottomConsole(ctx, t, progress, lifted, decompiled, flagged, syncPct, phaseGap, phaseName);
  }

  drawBottomConsole(ctx, t, progress, lifted, decompiled, flagged, syncPct, phaseGap, phaseName) {
    const topY = 868;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, topY, WIDTH, HEIGHT - topY);
    ctx.strokeStyle = '#d6d3cd';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, topY + 0.5); ctx.lineTo(WIDTH, topY + 0.5); ctx.stroke();

    // Terminal window bar
    ['#ef4444', '#f59e0b', '#10b981'].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(18 + i * 15, topY + 18, 4.5, 0, Math.PI * 2); ctx.fill();
    });
    this.text(ctx, 'rea@lab', 72, topY + 22, '#18181b', 11, 700);
    this.text(ctx, '~ % run rea --disasm 64 --decomp 16', 145, topY + 22, '#57534e', 11);
    this.text(ctx, `state: ${phaseName}`, 640, topY + 22, '#18181b', 11, 700);

    // 6 columns layout: [x, w, title, rightSub]
    const cols = [
      [8, 150, 'disasm', '64 agents'],
      [164, 150, 'decomp', '16 agents'],
      [320, 150, 'handoff', 'gap'],
      [476, 260, 'code', 'rea.ts · live'],
      [742, 160, 'mesh', 'sphere'],
      [908, 164, 'sync', 'SIM'],
    ];

    const panelY = topY + 34, panelH = 434;
    for (const [x, w, title, sub] of cols) {
      ctx.fillStyle = '#fcfbf9';
      ctx.fillRect(x, panelY, w, panelH);
      ctx.strokeStyle = '#e5e3dc';
      ctx.strokeRect(x + 0.5, panelY + 0.5, w - 1, panelH - 1);
      this.text(ctx, `▪ ${title}`, x + 8, panelY + 18, '#18181b', 10.5, 700);
      this.text(ctx, sub, x + w - 8, panelY + 18, '#78716c', 9.5, 400, 'right');
    }

    // Col 1: disasm
    const c1 = 8;
    for (let q = 0; q < 7; q++) {
      const y = panelY + 42 + q * 20;
      this.text(ctx, `q${q + 1}`, c1 + 8, y + 7, '#78716c', 9);
      const bw = (0.28 + fract(Math.sin(q * 3.1 + t * 0.6) * 0.5 + 0.5) * 0.68) * 108;
      ctx.fillStyle = q % 2 === 0 ? '#dc2626' : '#b91c1c';
      ctx.fillRect(c1 + 26, y, bw, 8);
    }
    this.text(ctx, 'lifted', c1 + 8, panelY + 210, '#78716c', 9.5);
    this.text(ctx, lifted.toLocaleString(), c1 + 8, panelY + 242, '#c2410c', 26, 700);
    this.text(ctx, 'heat', c1 + 8, panelY + 285, '#78716c', 9.5);
    const heatCols = ['#291d18', '#7c2d12', '#c2410c', '#f59e0b', '#fca5a5', '#f3e8ff', '#fde68a'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        ctx.fillStyle = heatCols[Math.floor(rand(r * 8 + c + Math.floor(t * 2)) * heatCols.length)];
        ctx.fillRect(c1 + 8 + c * 16.5, panelY + 296 + r * 18, 13, 13);
      }
    }
    this.text(ctx, `redo ${flagged}`, c1 + 8, panelY + 418, '#57534e', 9.5);

    // Col 2: decomp
    const c2 = 164;
    for (let col = 0; col < 12; col++) {
      const blocks = 2 + Math.floor(rand(col * 7 + Math.floor(t * 1.5)) * 8);
      for (let b = 0; b < blocks; b++) {
        ctx.fillStyle = b >= blocks - 2 ? '#2563eb' : '#14532d';
        ctx.fillRect(c2 + 10 + col * 11, panelY + 150 - b * 11, 8.5, 8.5);
      }
    }
    this.text(ctx, 'decompiled', c2 + 8, panelY + 225, '#78716c', 9.5);
    this.text(ctx, decompiled.toLocaleString(), c2 + 8, panelY + 258, '#0f766e', 26, 700);
    const decompBars = [['verify', 0.82, '#14532d'], ['align', 0.48, '#2563eb'], ['ship', 0.64, '#7c3aed'], ['bounce', 0.35, '#db2777']];
    decompBars.forEach(([lbl, ratio, col], idx) => {
      const y = panelY + 315 + idx * 24;
      this.text(ctx, lbl, c2 + 8, y, '#18181b', 9.5);
      ctx.fillStyle = col;
      ctx.fillRect(c2 + 52, y - 7, 84 * ratio, 7);
    });

    // Col 3: handoff
    const c3 = 320;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 6; c++) {
        const idx = r * 6 + c;
        const active = idx < Math.floor(progress * 42);
        ctx.fillStyle = !active ? '#e5e3dc' : idx % 5 === 0 ? '#db2777' : idx % 2 === 0 ? '#0f766e' : '#18181b';
        ctx.beginPath();
        ctx.arc(c3 + 22 + c * 21, panelY + 46 + r * 21, 5.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    this.text(ctx, 'flag rate', c3 + 8, panelY + 275, '#78716c', 9.5);
    const flagRate = (38.0 - progress * 16.5).toFixed(1);
    this.text(ctx, `${flagRate}%`, c3 + 8, panelY + 310, '#db2777', 26, 700);
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i < 10 ? '#db2777' : '#f9a8d4';
      ctx.fillRect(c3 + 8 + i * 7, panelY + 330, 4.5, 12);
    }
    this.text(ctx, `in flight ${14 + Math.floor(Math.sin(t * 2) * 6 + 6)}`, c3 + 8, panelY + 418, '#57534e', 9.5);

    // Col 4: code rea.ts · live
    const c4 = 476;
    const activeLine = Math.floor(t * 2.5) % CODE_LINES.length;
    CODE_LINES.forEach((line, idx) => {
      const y = panelY + 42 + idx * 20;
      if (idx === activeLine) {
        ctx.fillStyle = 'rgba(219, 39, 119, 0.10)';
        ctx.fillRect(c4 + 2, y - 12, 256, 17);
      }
      const isComment = line.startsWith('//');
      const col = isComment ? '#9ca3af' : idx === activeLine ? '#be185d' : '#27272a';
      this.text(ctx, line, c4 + 10, y, col, 9.5, idx === activeLine ? 700 : 400);
    });

    // Col 5: mesh sphere
    const c5 = 742;
    const scx = c5 + 80, scy = panelY + 125, sr = 58;
    for (let i = 0; i < 96; i++) {
      const yy = 1 - (i + 0.5) / 96 * 2;
      const ring = Math.sqrt(1 - yy * yy);
      const a = i * 2.39996 + t * 0.7;
      const xx = Math.cos(a) * ring;
      const zz = Math.sin(a) * ring;
      if (zz < -0.2) continue;
      ctx.fillStyle = i % 7 === 0 ? '#7c3aed' : i % 5 === 0 ? '#0f766e' : '#18181b';
      ctx.beginPath();
      ctx.arc(scx + xx * sr, scy + yy * sr, zz > 0.3 ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
    this.text(ctx, 'phase gap', c5 + 8, panelY + 265, '#78716c', 9.5);
    this.text(ctx, `Δ ${phaseGap}`, c5 + 8, panelY + 300, '#7c3aed', 24, 700);
    this.text(ctx, 'aligned', c5 + 8, panelY + 322, '#18181b', 9.5, 700);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(c5 + 8, panelY + 332, 130 * (1 - Number(phaseGap)), 6);
    this.text(ctx, 'disasm  8 waves', c5 + 8, panelY + 388, '#57534e', 9.5);
    this.text(ctx, 'decomp  8 waves', c5 + 8, panelY + 408, '#57534e', 9.5);

    // Col 6: sync SIM
    const c6 = 908;
    this.text(ctx, 'in sync', c6 + 8, panelY + 42, '#78716c', 9.5);
    this.text(ctx, `${syncPct}%`, c6 + 8, panelY + 76, '#18181b', 26, 700);
    // Dual sine waves
    for (const [phaseOff, col] of [[0, '#c2410c'], [Number(phaseGap) * 3.2, '#0f766e']]) {
      ctx.beginPath();
      for (let x = 0; x <= 146; x += 2) {
        const y = panelY + 145 + Math.sin(x * 0.095 - t * 3.2 + phaseOff) * 28;
        x === 0 ? ctx.moveTo(c6 + 9 + x, y) : ctx.lineTo(c6 + 9 + x, y);
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    this.text(ctx, 'crossings', c6 + 8, panelY + 245, '#78716c', 9.5);
    this.text(ctx, Math.floor(progress * 1790).toLocaleString(), c6 + 8, panelY + 278, '#18181b', 22, 700);
    const totals = [['lifted', lifted], ['decompiled', decompiled], ['flagged', flagged]];
    totals.forEach(([k, v], i) => {
      const y = panelY + 355 + i * 22;
      this.text(ctx, k, c6 + 8, y, '#57534e', 9.5);
      this.text(ctx, v.toLocaleString(), c6 + 154, y, '#18181b', 9.5, 700, 'right');
    });
  }
}
