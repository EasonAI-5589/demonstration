// Scene 05: SUBS → LOCAL // $300/mo in subscriptions → $0/mo is the target (JEV Dome + REA + Opus 5.5)
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const CALL_CHAIN = [
  'ui.click("export")',
  'ExportDialog.open',
  'export_pdf()',
  'layout.paginate',
  'render_page()',
  'font.embed()',
  'image.compress',
  'pdf.write()',
  'fs.save()',
  'toast("done")',
];

const ARC_FEATURES = [
  'vector export 9x/wk',
  'site audit 4x/wk',
  'auto captions 12x/wk',
  'post queue 21x/wk',
  'drip emails 3x/wk',
  'pdf merge 6x/wk',
  'team seats 0x/wk',
  'invoice pdf 2x/wk',
  'screen capture 8x/wk',
  'vpn tunnel daily',
  'batch upscale 5x/wk',
  'keyword gaps 3x/wk',
  'cloud backup daily',
  'speaker labels 7x/wk',
  'autofill vault daily',
  'layer masks 11x/wk',
  'ai credits 0x/wk',
  'link page 1x/wk',
  'note sync 14x/wk',
  'brand kit 4x/wk',
];

const SUBSCRIPTIONS = [
  { name: 'design suite', price: 55, action: 'rebuild', col: '#facc15' },
  { name: 'seo crawler', price: 49, action: 'rebuild', col: '#facc15' },
  { name: 'transcription', price: 30, action: 'rebuild', col: '#facc15' },
  { name: 'social scheduler', price: 29, action: 'rebuild', col: '#facc15' },
  { name: 'email scheduler', price: 25, action: 'rebuild', col: '#38bdf8' },
  { name: 'pdf editor', price: 20, action: 'rebuild', col: '#f472b6' },
  { name: 'invoice app', price: 19, action: 'rebuild', col: '#c084fc' },
  { name: 'screen recorder', price: 15, action: 'rebuild', col: '#2dd4bf' },
  { name: 'image upscaler', price: 12, action: 'rebuild', col: '#f472b6' },
  { name: 'vpn', price: 12, action: 'keep', col: '#64748b' },
  { name: 'note sync', price: 10, action: 'rebuild', col: '#a855f7' },
  { name: 'cloud storage', price: 10, action: 'keep', col: '#64748b' },
  { name: 'link-in-bio', price: 9, action: 'rebuild', col: '#ec4899' },
  { name: 'password manager', price: 5, action: 'keep', col: '#64748b' },
];

export class SubsTeardownScene {
  constructor() {
    this.duration = 20;
  }

  font(ctx, size = 10.5, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#f5d0fe', size = 10.5, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const progress = clamp(t / this.duration, 0, 1);
    const rebuiltCount = Math.min(11, Math.floor(progress * 13));
    let currentBill = 300;
    let rebuiltDone = 0;
    for (const s of SUBSCRIPTIONS) {
      if (s.action === 'rebuild' && rebuiltDone < rebuiltCount) {
        currentBill -= s.price;
        rebuiltDone++;
      }
    }

    // Deep Violet Background
    const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGrad.addColorStop(0, '#13071e');
    bgGrad.addColorStop(0.6, '#190b28');
    bgGrad.addColorStop(1, '#100619');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 1. Top Telemetry Bar
    ctx.fillStyle = '#180926';
    ctx.fillRect(0, 0, WIDTH, 36);
    this.text(ctx, 'SUBS  →  LOCAL', 16, 23, '#f5d0fe', 13, 700);
    const topMetrics = [
      ['RUN', 'teardown-01', '#e9d5ff', 260],
      ['SIGNALS', Math.floor(5316 + progress * 3624).toLocaleString(), '#f472b6', 350],
      ['JEV CALLS', Math.floor(3346 + progress * 5594).toLocaleString(), '#c084fc', 425],
      ['REA TRACES', Math.floor(progress * 1284).toLocaleString(), '#38bdf8', 505],
      ['OPUS BUILDS', String(rebuiltCount), '#4ade80', 595],
      ['API $', `$${(0.05 + progress * 5.44).toFixed(2)}`, '#38bdf8', 685],
      ['BILL /MO', `$${currentBill}`, '#facc15', 755],
      ['STATE', progress < 0.35 ? 'filtering' : 'building', '#f5d0fe', 835],
    ];
    for (const [k, v, col, x] of topMetrics) {
      this.text(ctx, k, x, 13, '#7e5794', 8, 600);
      this.text(ctx, v, x, 27, col, 11.5, 700);
    }
    ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
    ctx.strokeStyle = '#f43f5e';
    ctx.fillRect(970, 8, 94, 20);
    ctx.strokeRect(970.5, 8.5, 93, 19);
    this.text(ctx, 'DEMO DATA', 1017, 22, '#fda4af', 9, 700, 'center');

    // 2. Hero Title
    this.text(ctx, progress < 0.35 ? '02 JEV FILTERS' : '04 OPUS BUILDS', 16, 62, '#f43f5e', 13, 700);
    this.text(ctx, '$300/mo in subscriptions → $0/mo is the target', 16, 89, '#faf5ff', 22, 700);
    this.text(ctx, 'sonnet researches · jev filters · rea maps · opus 5.5 builds', 16, 108, '#a88beb', 11);
    this.text(ctx, 'DEMO DATA · SIMULATED NUMBERS · AUTHORIZED SOFTWARE ONLY', 16, 123, '#7e5794', 9.2, 600);

    // 3. Left Call Chain & Glowing Magenta JEV FILTER Dome (`cx = -65, cy = 485, r = 560`)
    const domeCx = -65, domeCy = 485, domeR = 560;

    // Radial rays inside the dome
    for (let i = 0; i < 64; i++) {
      const a = ((i / 63) - 0.5) * 1.18;
      const xEnd = domeCx + Math.cos(a) * domeR;
      const yEnd = domeCy + Math.sin(a) * domeR;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.14)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(domeCx + 80, domeCy);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();
    }

    // Left vertical Call Chain (REA trace)
    this.text(ctx, 'call chain · pdf export', 22, 222, '#d8b4fe', 10, 700);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.beginPath(); ctx.moveTo(35, 240); ctx.lineTo(35, 765); ctx.stroke();
    CALL_CHAIN.forEach((fn, idx) => {
      const y = 242 + idx * 58;
      const active = Math.floor(t * 3) % CALL_CHAIN.length === idx;
      ctx.fillStyle = active ? '#facc15' : '#a855f7';
      ctx.beginPath(); ctx.arc(35, y, 4.2, 0, Math.PI * 2); ctx.fill();
      this.text(ctx, fn, 46, y + 4, active ? '#fef08a' : '#e9d5ff', 10, active ? 700 : 400);
    });

    // Glowing Magenta Arc
    ctx.save();
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(domeCx, domeCy, domeR, -0.64, 0.64);
    ctx.stroke();
    ctx.restore();

    // Feature labels rotated along the inner rim of the dome arc
    ARC_FEATURES.forEach((feat, idx) => {
      const a = ((idx / (ARC_FEATURES.length - 1)) - 0.5) * 1.18;
      const tx = domeCx + Math.cos(a) * (domeR - 14);
      const ty = domeCy + Math.sin(a) * (domeR - 14);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(a);
      this.text(ctx, feat, 0, 3, '#f5d0fe', 10, 600, 'right');
      ctx.restore();
    });

    // 4. Horizontal Neon Laser Rays & Right-Side Subscription Targets
    let doneCounter = 0;
    SUBSCRIPTIONS.forEach((sub, idx) => {
      const y = 232 + idx * 42.5;
      const a = Math.asin(clamp((y - domeCy) / domeR, -0.95, 0.95));
      const startX = domeCx + Math.cos(a) * domeR;
      const isRebuilt = sub.action === 'rebuild' && doneCounter < rebuiltCount;
      if (sub.action === 'rebuild') doneCounter++;

      // Secondary horizontal hairlines around each main beam
      for (let m = -2; m <= 2; m++) {
        const my = y + m * 6;
        const beamLen = sub.action === 'keep' ? 180 + rand(idx * 9 + m) * 140 : WIDTH - 20 - startX;
        ctx.strokeStyle = isRebuilt ? 'rgba(250, 204, 21, 0.32)' : sub.action === 'keep' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(236, 72, 153, 0.32)';
        ctx.lineWidth = m === 0 ? 2.1 : 0.85;
        ctx.beginPath();
        ctx.moveTo(startX, my);
        ctx.lineTo(startX + beamLen, my);
        ctx.stroke();
      }

      // Travelling diamond nodes along active beams
      if (sub.action === 'rebuild') {
        for (let d = 0; d < 4; d++) {
          const px = startX + 40 + fract(t * 0.35 + d * 0.25 + idx * 0.07) * (880 - startX);
          ctx.fillStyle = isRebuilt ? '#fef08a' : sub.col;
          ctx.fillRect(px - 2.5, y - 2.5, 5, 5);
        }
      }

      this.text(ctx, sub.action === 'keep' ? 'keep' : 'local', startX + 18, y - 4, sub.action === 'keep' ? '#94a3b8' : '#f472b6', 9, 600);

      // Right-hand subscription label
      const labelTxt = isRebuilt
        ? `${sub.name}  $${sub.price} → $0`
        : sub.action === 'keep'
          ? `${sub.name}  $${sub.price} · keep`
          : `${sub.name}  $${sub.price}`;
      const labelCol = isRebuilt ? '#fde047' : sub.action === 'keep' ? '#94a3b8' : '#f5d0fe';
      ctx.fillStyle = 'rgba(19, 7, 30, 0.85)';
      ctx.fillRect(855, y - 12, 212, 20);
      this.text(ctx, labelTxt, 1060, y + 3, labelCol, 11, 700, 'right');
    });

    // CLAUDE OPUS 5.5 Circular Builder Ring
    const ocx = 708, ocy = 682, or = 54;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath(); ctx.arc(ocx, ocy, or, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ocx, ocy, or, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(ocx, ocy, or + 6, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2); ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.fillRect(ocx - 66, ocy - 82, 132, 22);
    ctx.strokeRect(ocx - 66, ocy - 82, 132, 22);
    this.text(ctx, 'CLAUDE OPUS 5.5', ocx, ocy - 67, '#e0f2fe', 10.5, 700, 'center');
    this.text(ctx, `building ${rebuiltCount}/11 · tests vs observed`, ocx, ocy + 78, '#7dd3fc', 9.5, 600, 'center');

    // Bottom 6-Panel Terminal Console
    this.drawBottomConsole(ctx, t, progress, rebuiltCount, currentBill);
  }

  drawBottomConsole(ctx, t, progress, rebuiltCount, currentBill) {
    const topY = 852;
    ctx.fillStyle = '#12071c';
    ctx.fillRect(0, topY, WIDTH, HEIGHT - topY);
    ctx.strokeStyle = '#3b1d54';
    ctx.beginPath(); ctx.moveTo(0, topY + 0.5); ctx.lineTo(WIDTH, topY + 0.5); ctx.stroke();

    this.text(ctx, '■ jev@desk  ~ % run teardown --bill 300 --rea authorized --opus 5.5 --demo', 16, topY + 22, '#d8b4fe', 10.5, 700);
    this.text(ctx, `state: ${progress < 0.35 ? 'filtering' : 'building'}`, 640, topY + 22, '#f472b6', 10.5, 700);

    const cols = [
      [8, 168, 'claude sonnet', ''],
      [182, 168, 'jev', 'every feature'],
      [356, 168, 'rea', 'authorized'],
      [530, 184, 'code', 'teardown.py · live'],
      [720, 168, 'claude opus 5.5', ''],
      [894, 178, 'bill', 'usd/mo · demo'],
    ];
    const py = topY + 34, ph = 454;
    for (const [x, w, title, sub] of cols) {
      ctx.fillStyle = '#170924';
      ctx.fillRect(x, py, w, ph);
      ctx.strokeStyle = '#311547';
      ctx.strokeRect(x + 0.5, py + 0.5, w - 1, ph - 1);
      this.text(ctx, `▪ ${title}`, x + 8, py + 18, '#f5d0fe', 10.5, 700);
      if (sub) this.text(ctx, sub, x + w - 8, py + 18, '#9366b4', 9, 400, 'right');
    }

    // Col 1: claude sonnet
    const sBars = [['pricing pages', 0.85], ['reviews', 0.68], ['complaints', 0.52], ['changelogs', 0.44], ['docs', 0.30], ['your billing', 0.18]];
    sBars.forEach(([lbl, r], idx) => {
      const y = py + 44 + idx * 20;
      this.text(ctx, lbl, 16, y, '#c4b5fd', 9.2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(98, y - 7, 68 * r, 6);
    });
    this.text(ctx, 'signals in flight', 16, py + 235, '#9366b4', 9.5);
    this.text(ctx, Math.max(0, Math.floor((1 - progress) * 1970)).toLocaleString(), 16, py + 272, '#f472b6', 28, 700);
    this.text(ctx, 'your 14 subs', 16, py + 345, '#9366b4', 9.5);
    for (let i = 0; i < 14; i++) {
      const r = Math.floor(i / 7), c = i % 7;
      ctx.fillStyle = i < rebuiltCount ? '#facc15' : '#ec4899';
      ctx.fillRect(16 + c * 21, py + 358 + r * 22, 16, 16);
    }

    // Col 2: jev
    for (let i = 0; i < 16; i++) {
      const bh = 18 + rand(i + 5) * 48;
      ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#ec4899';
      ctx.fillRect(192 + i * 9.2, py + 115 - bh, 6.5, bh);
    }
    this.text(ctx, 'kept signals', 190, py + 185, '#9366b4', 9.5);
    this.text(ctx, Math.floor(602 + progress * 2166).toLocaleString(), 190, py + 220, '#f472b6', 26, 700);
    this.text(ctx, '/ 8 940', 292, py + 220, '#9366b4', 10);
    this.text(ctx, 'runs local          79%', 190, py + 268, '#e9d5ff', 9.5);
    this.text(ctx, 'one person          64%', 190, py + 292, '#e9d5ff', 9.5);
    this.text(ctx, '3 subs: keep paying  DEMO', 190, py + 432, '#9366b4', 9);

    // Col 3: rea
    const nodes = [[440, py + 52], [402, py + 86], [440, py + 86], [478, py + 86], [388, py + 128], [422, py + 128], [458, py + 128], [492, py + 128], [440, py + 172]];
    const edges = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 8], [5, 8], [6, 8], [7, 8]];
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    for (const [a, b] of edges) {
      ctx.beginPath(); ctx.moveTo(nodes[a][0], nodes[a][1]); ctx.lineTo(nodes[b][0], nodes[b][1]); ctx.stroke();
    }
    nodes.forEach(([nx, ny], idx) => {
      ctx.fillStyle = idx === 0 ? '#facc15' : '#a855f7';
      ctx.beginPath(); ctx.arc(nx, ny, 4.2, 0, Math.PI * 2); ctx.fill();
    });
    const reaRows = [['modules', 41], ['functions', 312], ['ui events', 88], ['data flows', 27]];
    reaRows.forEach(([k, v], i) => {
      const y = py + 245 + i * 20;
      this.text(ctx, k, 366, y, '#9366b4', 9.5);
      this.text(ctx, String(Math.floor(v * progress)), 514, y, '#f5d0fe', 9.5, 700, 'right');
    });
    this.text(ctx, 'findings w/ evidence', 366, py + 372, '#9366b4', 9.5);
    this.text(ctx, Math.floor(progress * 1284).toLocaleString(), 366, py + 408, '#38bdf8', 26, 700);

    // Col 4: code teardown.py
    const pyLines = [
      'subs = sonnet.research(bill)',
      'for f in subs.used():',
      '  v = jev.decide(f)',
      '  if v == "rebuild":',
      '    queue.append(f)',
      '',
      'for f in queue:',
      '  ev = rea.trace(f.app)',
      '  f.spec = ev.chain()',
      '',
      'for f in queue:',
      '  code = opus.build(f.spec)',
      '  t = tests.observed(ev)',
      '  assert t.run(code).ok',
      'bill = 300 - saved()',
    ];
    const activePy = Math.floor(t * 2.2) % pyLines.length;
    pyLines.forEach((l, idx) => {
      const y = py + 44 + idx * 24;
      if (idx === activePy && l) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
        ctx.fillRect(534, y - 12, 176, 17);
      }
      this.text(ctx, l, 538, y, idx === activePy ? '#f472b6' : '#d8b4fe', 9.2, idx === activePy ? 700 : 400);
    });

    // Col 5: claude opus 5.5
    this.text(ctx, 'tests passing', 728, py + 215, '#9366b4', 9.5);
    this.text(ctx, String(Math.floor(progress * 190)), 728, py + 250, '#38bdf8', 26, 700);
    this.text(ctx, '/ 190', 835, py + 250, '#9366b4', 10);
    ['> vector export', '> site audit', '> auto captions', '> post queue', '> drip emails'].forEach((item, idx) => {
      const y = py + 295 + idx * 22;
      this.text(ctx, item, 728, y, '#e9d5ff', 9.2);
      this.text(ctx, 'pass', 878, y, '#facc15', 9.2, 700, 'right');
    });

    // Col 6: bill
    this.text(ctx, 'monthly', 902, py + 42, '#9366b4', 9.5);
    this.text(ctx, `$${currentBill}`, 902, py + 82, '#facc15', 34, 700);
    this.text(ctx, 'target $0', 1062, py + 82, '#f43f5e', 9.5, 700, 'right');

    // Step-down bill chart
    ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(902, py + 115);
    ctx.lineTo(902 + 160 * progress, py + 115 + (300 - currentBill) * 0.22);
    ctx.lineTo(902 + 160 * progress, py + 185);
    ctx.lineTo(902, py + 185);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    this.text(ctx, `rebuilt           $${300 - currentBill}`, 902, py + 248, '#facc15', 9.5, 700);
    this.text(ctx, `keep              $${currentBill}`, 902, py + 272, '#94a3b8', 9.5);
    this.text(ctx, 'this run cost', 902, py + 365, '#9366b4', 9.5);
    this.text(ctx, `$${(0.05 + progress * 5.44).toFixed(2)}`, 902, py + 398, '#f472b6', 22, 700);
    this.text(ctx, 'one time, not monthly', 902, py + 432, '#9366b4', 9);
  }
}
