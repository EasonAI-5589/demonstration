// Scene 04: STANFORD AI LAB / DISCOVERY ARCHITECTURE (Opus 5.5 + GPT-6.1 Sol Torus Connectome)
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const FLAME_ROW1 = [
  ['ast.diff', 390, 95, '#52525b'],
  ['sandbox.run', 490, 120, '#065f46'],
  ['kernel.bench', 615, 130, '#3f3f46'],
  ['assert.shape', 750, 145, '#52525b'],
];
const FLAME_ROW2 = [
  ['cypher.query', 110, 130, '#3f3f46'],
  ['map_elites.hop', 245, 120, '#78350f'],
  ['mcts.select', 370, 105, '#78350f'],
  ['sol.propose', 480, 115, '#1e3a8a'],
  ['eval.isolate', 600, 120, '#1e3a8a'],
  ['meta.distill', 725, 110, '#3f3f46'],
  ['sota.verify', 840, 125, '#065f46'],
];
const FLAME_ROW3 = [
  ['neo4j.graph_kv', 16, 125, '#27272a'],
  ['sol.sample_deck', 146, 195, '#1e3a8a'],
  ['opus.search_plan', 346, 140, '#78350f'],
  ['sandbox.container_barrier', 491, 200, '#0f766e'],
  ['meta.lesson_extract', 696, 155, '#3f3f46'],
  ['opus.guidance_sync', 856, 206, '#78350f'],
];

export class StanfordTorusScene {
  constructor() {
    this.duration = 24;
  }

  font(ctx, size = 10, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#e4e4e7', size = 10, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const progress = clamp(t / this.duration, 0, 1);

    ctx.fillStyle = '#07080a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 1. Header Bar
    this.text(ctx, '| STANFORD AI LAB / DISCOVERY ARCHITECTURE', 14, 22, '#f4f4f5', 12, 700);
    this.text(ctx, `GRAPH neo4j | NODES ${(14280 + Math.floor(t * 12)).toLocaleString()} | CYPHER-EDGES ${(68400 + Math.floor(t * 45)).toLocaleString()} | SESSIONS 100`, WIDTH - 14, 22, '#a1a1aa', 10, 600, 'right');

    // 2. Top Cognitive Stack Flamegraph (y = 32..142)
    ctx.fillStyle = '#0d0f13';
    ctx.fillRect(10, 32, WIDTH - 20, 112);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(10.5, 32.5, WIDTH - 21, 111);
    this.text(ctx, 'AGENT COGNITIVE STACK | 3 420 ITERATIONS | FLAME', 20, 48, '#a1a1aa', 9.5, 700);
    this.text(ctx, 'cypher/eval 65.6 %', WIDTH - 20, 48, '#38bdf8', 9.5, 700, 'right');

    const drawFlameRow = (row, y) => {
      for (const [label, x, w, bg] of row) {
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, w, 21);
        ctx.strokeStyle = '#52525b';
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 20);
        const txtCol = bg === '#1e3a8a' ? '#38bdf8' : bg === '#78350f' ? '#fbbf24' : bg === '#065f46' || bg === '#0f766e' ? '#34d399' : '#e4e4e7';
        this.text(ctx, label, x + w / 2, y + 14, txtCol, 9.5, 700, 'center');
      }
    };
    drawFlameRow(FLAME_ROW1, 56);
    drawFlameRow(FLAME_ROW2, 81);
    drawFlameRow(FLAME_ROW3, 106);

    this.text(ctx, 'AGENTDISCOVER | OPUS 5.5 PLANNER + GPT-6.1 SOL PROPOSER | WAVE 32 DEG | HACKS BLOCKED 404', 14, 158, '#a1a1aa', 8.8, 600);
    this.text(ctx, 'CONNECTOME R 120-480 | STRANDS 11 988 | ZERO CONTEXT BLEED', WIDTH - 14, 158, '#a1a1aa', 8.8, 600, 'right');

    // 3. Main 3D Torus Connectome Stage (x = 10, y = 166, w = 772, h = 768)
    ctx.fillStyle = '#050608';
    ctx.fillRect(10, 166, 772, 768);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(10.5, 166.5, 771, 767);

    // Degree ticks along left border
    ['0 DEG', '85 DEG', '169 DEG', '254 DEG', '339 DEG'].forEach((deg, idx) => {
      this.text(ctx, deg, 24, 248 + idx * 142, '#71717a', 8.5, 600);
    });

    this.drawTorusConnectome(ctx, t, state.reducedMotion);

    // 4. Right Telemetry Column (x = 790, y = 166, w = 280, h = 768)
    this.drawRightTelemetry(ctx, t, progress);

    // 5. Bottom Token Stream & 3 Analytical Panels (y = 942..1340)
    this.drawBottomAnalytics(ctx, t, progress);
  }

  drawTorusConnectome(ctx, t, reducedMotion) {
    const cx = 415, cy = 535;
    const R = 165, r = 68;
    const rotZ = reducedMotion ? 0.4 : t * 0.28;
    const tiltX = 0.56, tiltY = -0.32;

    const project = (u, v, extraR = 0) => {
      const rr = r + extraR;
      const x0 = (R + rr * Math.cos(v)) * Math.cos(u);
      const y0 = (R + rr * Math.cos(v)) * Math.sin(u);
      const z0 = rr * Math.sin(v);
      // Rotate around Z then tilt X/Y
      const xr = x0 * Math.cos(rotZ) - y0 * Math.sin(rotZ);
      const yr = x0 * Math.sin(rotZ) + y0 * Math.cos(rotZ);
      const px = xr * Math.cos(tiltY) + z0 * Math.sin(tiltY);
      const py = yr * Math.cos(tiltX) - z0 * Math.sin(tiltX);
      const pz = yr * Math.sin(tiltX) + z0 * Math.cos(tiltX);
      const scale = 1 + pz / 900;
      return { x: cx + px * scale, y: cy + py * scale, z: pz };
    };

    // Outer radial spikes (amber on top-left, white/cyan with pearl tips on right/bottom)
    const spikeCount = 340;
    for (let i = 0; i < spikeCount; i++) {
      const u = (i / spikeCount) * Math.PI * 2;
      const v = ((i * 7) % 24) / 24 * Math.PI * 2;
      const base = project(u, v, 8);
      const spikeLen = 35 + rand(i + 13) * 95 + Math.sin(u * 4 + t * 1.5) * 18;
      const tip = project(u, v, 8 + spikeLen);
      const isWarm = Math.sin(u + 0.8) > 0.15;
      ctx.strokeStyle = isWarm ? 'rgba(217, 119, 6, 0.45)' : 'rgba(228, 228, 231, 0.55)';
      ctx.lineWidth = isWarm ? 1.0 : 1.15;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();

      if (!isWarm && i % 2 === 0) {
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flowing connectome strands along the torus body
    for (let s = 0; s < 130; s++) {
      const vOff = (s / 130) * Math.PI * 2;
      const uStart = rand(s * 5) * Math.PI * 2;
      const col = s % 4 === 0 ? 'rgba(251, 191, 36, 0.55)' : s % 3 === 0 ? 'rgba(56, 189, 248, 0.52)' : 'rgba(96, 165, 250, 0.32)';
      ctx.strokeStyle = col;
      ctx.lineWidth = s % 4 === 0 ? 1.3 : 0.85;
      ctx.beginPath();
      for (let step = 0; step <= 28; step++) {
        const u = uStart + (step / 28) * 2.2;
        const v = vOff + (step / 28) * 1.4;
        const p = project(u, v, 0);
        step === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Red blocked-hack markers on torus surface
    for (let h = 0; h < 9; h++) {
      const p = project(h * 0.7 + t * 0.1, h * 1.1, 4);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    // Highlighted Candidate Node + Yellow Callout Box
    const target = project(2.35, 0.6, 85);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(target.x, target.y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(target.x, target.y, 3, 0, Math.PI * 2); ctx.fill();

    const boxX = 28, boxY = 678, boxW = 248, boxH = 44;
    ctx.beginPath();
    ctx.moveTo(boxX + boxW, boxY + 22);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ca8a04';
    ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
    this.text(ctx, 'CANDIDATE cand-0428 | SHA-256 0x8F | SOTA 0.994', boxX + 8, boxY + 17, '#fef08a', 8.5, 700);
    this.text(ctx, 'OPUS PLAN: CYPHER MCTS HOP | GPT-6.1 SOL CODE-GEN', boxX + 8, boxY + 34, '#d4d4d8', 8.2);
  }

  drawRightTelemetry(ctx, t, progress) {
    const rx = 790, rw = 280;
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(rx, 166, rw, 768);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(rx + 0.5, 166.5, rw - 1, 767);

    // 1. DISCOVERY LOAD - 90 S
    this.text(ctx, 'DISCOVERY LOAD - 90 S', rx + 10, 184, '#a1a1aa', 9, 700);
    this.text(ctx, '101.0', rx + rw - 10, 184, '#fbbf24', 10, 700, 'right');
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x < 256; x += 4) {
      const sq = Math.sin(x * 0.18 - t * 3) > 0.2 ? -14 : 0;
      const y = 212 + sq;
      x === 0 ? ctx.moveTo(rx + 12 + x, y) : ctx.lineTo(rx + 12 + x, y);
    }
    ctx.stroke();
    this.text(ctx, 'CYPHER QUERIES / S', rx + 10, 234, '#71717a', 8);
    this.text(ctx, '281', rx + rw - 10, 234, '#38bdf8', 9, 700, 'right');
    this.text(ctx, 'HACKS BLOCKED / S', rx + 10, 252, '#71717a', 8);
    this.text(ctx, '3.8', rx + rw - 10, 252, '#f43f5e', 9, 700, 'right');

    // 2. MODEL COMPUTE SPLIT | 2 HISTOGRAM
    this.text(ctx, 'MODEL COMPUTE SPLIT | 2 HISTOGRAM', rx + 10, 392, '#a1a1aa', 9, 700);
    this.text(ctx, 'OPUS 5.5: 38%', rx + 10, 408, '#f59e0b', 8.5, 700);
    this.text(ctx, 'GPT-6.1 SOL: 62%', rx + rw - 10, 408, '#3b82f6', 8.5, 700, 'right');
    for (let i = 0; i < 18; i++) {
      const isOpus = i < 7;
      const bh = 12 + rand(i + Math.floor(t * 2)) * 28;
      ctx.fillStyle = isOpus ? '#f59e0b' : '#2563eb';
      ctx.fillRect(rx + 12 + i * 14, 448 - bh, 10, bh);
    }

    // 3. CYCLE STATE | SYNCHRONIZER
    this.text(ctx, 'CYCLE STATE | SYNCHRONIZER', rx + 10, 476, '#a1a1aa', 9, 700);
    const states = [
      ['01 SOL PROPOSE', 0.85, 'ACTIVE', '#38bdf8'],
      ['02 OPUS CYPHER', 0.52, 'READY', '#a1a1aa'],
      ['03 ISOLATED EVAL', 0.68, 'ARMED', '#e4e4e7'],
      ['04 META DISTILL', 0.90, 'WAIT', '#a1a1aa'],
    ];
    states.forEach(([lbl, w, st, col], idx) => {
      const y = 496 + idx * 18;
      this.text(ctx, lbl, rx + 10, y, '#d4d4d8', 8.5);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(rx + 115, y - 6, 95, 5);
      ctx.fillStyle = col;
      ctx.fillRect(rx + 115, y - 6, 95 * w, 5);
      this.text(ctx, st, rx + rw - 10, y, col, 8.5, 700, 'right');
    });

    // 4. TELEMETRY READOUT
    this.text(ctx, 'TELEMETRY READOUT', rx + 10, 584, '#a1a1aa', 9, 700);
    const readouts = [
      ['YAW / PITCH', '49.0 / 18.5 DEG', '#e4e4e7'],
      ['IDEA NODES', '14 280', '#e4e4e7'],
      ['CYPHER EDGES', '68 400', '#e4e4e7'],
      ['HACKS BLOCKED', '404', '#f43f5e'],
      ['SOTA GAIN', '+28.4%', '#34d399'],
      ['CYCLE / FPS', `#${144 + Math.floor(t)} | 60.0`, '#e4e4e7'],
    ];
    readouts.forEach(([k, v, col], idx) => {
      const y = 602 + idx * 16;
      this.text(ctx, k, rx + 10, y, '#71717a', 8.5);
      this.text(ctx, v, rx + rw - 10, y, col, 8.5, 700, 'right');
    });

    // 5. ISOLATED SANDBOX PODS | 32 PODS
    this.text(ctx, 'ISOLATED SANDBOX PODS | 32 PODS', rx + 10, 714, '#a1a1aa', 9, 700);
    this.text(ctx, 'ACTIVE: 31/32 | RUN: APPTAINER | LEAK: 0.0%', rx + 10, 728, '#d4d4d8', 8.2);
    const podCols = ['#0284c7', '#0d9488', '#d97706', '#2563eb'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        ctx.fillStyle = podCols[(r + c + Math.floor(t)) % podCols.length];
        ctx.fillRect(rx + 10 + c * 32.5, 736 + r * 12, 28, 8);
      }
    }

    // 6. DISPATCH QUEUE | LIVE COMMITS
    this.text(ctx, 'DISPATCH QUEUE | LIVE COMMITS', rx + 10, 804, '#a1a1aa', 9, 700);
    const commits = [
      ['> sol.code   -> sandbox.run', '+0.4ms', '#d4d4d8'],
      ['> eval.bench -> score.valid', '+1.1ms', '#d4d4d8'],
      ['> isolate.chk-> leak.none', 'PASSED', '#34d399'],
      ['> meta.lesson-> graph.edge', '#14284', '#f59e0b'],
    ];
    commits.forEach(([cmd, right, col], idx) => {
      const y = 822 + idx * 17;
      this.text(ctx, cmd, rx + 10, y, '#d4d4d8', 8.5);
      this.text(ctx, right, rx + rw - 10, y, col, 8.5, 700, 'right');
    });

    this.text(ctx, 'SYSTEM BUFFER', rx + 10, 916, '#71717a', 8.2);
    this.text(ctx, '99.8 % VERIFIED', rx + rw - 10, 916, '#34d399', 8.2, 700, 'right');
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(rx + 88 + i * 5.2, 908, 3.8, 7);
    }
  }

  drawBottomAnalytics(ctx, t, progress) {
    // Token Stream Bar (y = 942..1012)
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(10, 942, WIDTH - 20, 68);
    ctx.strokeStyle = '#27272a';
    ctx.strokeRect(10.5, 942.5, WIDTH - 21, 67);
    this.text(ctx, 'MODEL TOKEN FLOW & COMPUTE SPEND | 30 MIN | STREAM', 22, 958, '#a1a1aa', 9, 700);
    this.text(ctx, '3.56 B TOK / MIN', WIDTH - 22, 958, '#f59e0b', 11, 700, 'right');

    for (const [col, amp, phase] of [['#38bdf8', 11, 0], ['#f59e0b', 9, 1.4], ['#34d399', 7, 2.8]]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 22; x <= WIDTH - 22; x += 8) {
        const y = 982 + Math.sin(x * 0.012 - t * 2 + phase) * amp * Math.sin(x * 0.003);
        x === 22 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Bottom 3 Cards (y = 1018..1326)
    const cards = [
      [10, 300, 'DISCOVERY MERGES BY DOMAIN'],
      [318, 424, 'BENCHMARK METRICS | BEFORE - AFTER'],
      [750, 320, 'EVALUATOR REJECTIONS | PARETO'],
    ];
    for (const [x, w, title] of cards) {
      ctx.fillStyle = '#0b0d11';
      ctx.fillRect(x, 1018, w, 306);
      ctx.strokeStyle = '#27272a';
      ctx.strokeRect(x + 0.5, 1018.5, w - 1, 305);
      this.text(ctx, title, x + 12, 1036, '#a1a1aa', 9, 700);
    }

    // Card 1: Polar Rose Chart
    const pcx = 160, pcy = 1180;
    for (const r of [35, 65, 95]) {
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(pcx, pcy, r, 0, Math.PI * 2); ctx.stroke();
    }
    for (let s = 0; s < 12; s++) {
      const a0 = (s / 12) * Math.PI * 2;
      const rad = 42 + rand(s + 3) * 52;
      ctx.fillStyle = s % 3 === 0 ? 'rgba(245, 158, 11, 0.65)' : 'rgba(14, 165, 233, 0.45)';
      ctx.beginPath();
      ctx.moveTo(pcx, pcy);
      ctx.arc(pcx, pcy, rad, a0, a0 + 0.42);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#090a0f';
    ctx.beginPath(); ctx.arc(pcx, pcy, 22, 0, Math.PI * 2); ctx.fill();
    this.text(ctx, '14278', pcx, pcy + 4, '#fbbf24', 9.5, 700, 'center');
    this.text(ctx, 'KERNEL', pcx, 1072, '#a1a1aa', 8.5, 700, 'center');
    this.text(ctx, 'MATH', pcx, 1296, '#a1a1aa', 8.5, 700, 'center');
    this.text(ctx, 'SYSTEMS', 42, pcy + 4, '#a1a1aa', 8.5, 700);
    this.text(ctx, 'BIO', 268, pcy + 4, '#a1a1aa', 8.5, 700, 'right');

    // Card 2: Benchmark Metrics Before-After Dumbbell
    const metrics = [
      ['ahc-heuristics', 0.35, 0.65, '-70.2%', '#f59e0b'],
      ['kernel-builder', 0.40, 0.72, '-59.6%', '#f59e0b'],
      ['math-extremal', 0.42, 0.68, '-45.7%', '#f59e0b'],
      ['reward-leakage', 0.16, 0.44, '-93.8%', '#f43f5e'],
      ['model-spend', 0.38, 0.70, '-68.7%', '#f59e0b'],
      ['sota-winrate', 0.44, 0.76, '+28.4%', '#34d399'],
    ];
    metrics.forEach(([name, x1, x2, delta, col], idx) => {
      const y = 1074 + idx * 38;
      this.text(ctx, name, 332, y, '#d4d4d8', 9.5);
      const px1 = 430 + x1 * 220;
      const px2 = 430 + x2 * 220;
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px1, y - 3); ctx.lineTo(px2, y - 3); ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(px1, y - 3, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a1a1aa';
      ctx.beginPath(); ctx.arc(px2, y - 3, 4.5, 0, Math.PI * 2); ctx.stroke();
      this.text(ctx, delta, 728, y, col, 9.5, 700, 'right');
    });

    // Card 3: Evaluator Rejections Pareto
    const bars = [125, 68, 42, 24, 15, 9, 5];
    bars.forEach((bh, idx) => {
      const bx = 772 + idx * 38;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(bx, 1255 - bh, 24, bh);
    });
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    [0.42, 0.68, 0.82, 0.90, 0.95, 0.98, 1.0].forEach((p, idx) => {
      const x = 784 + idx * 38;
      const y = 1255 - p * 165;
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    this.text(ctx, 'SOURCE: STANFORD AI LAB & AGENTDISCOVER | DUAL-ENGINE CONNECTOME | OPUS 5.5 + GPT-6.1 SOL', 14, 1341, '#71717a', 8.5);
    this.text(ctx, 'FRAME 60.0 FPS | SYNTHETIC TELEMETRY | 1080x1350 TERMINAL CANVAS', WIDTH - 14, 1341, '#71717a', 8.5, 'right');
  }
}
