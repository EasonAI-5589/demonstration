// Scene 06: Jev · System One Isometric Mechanical Schema Reader (Warm Ivory & Champagne Gold)
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const CASES = [
  {
    fig: 'Fig 1 · 高频的小判断',
    hudTitle: '置信门',
    hudValue: '> 0.9',
    hudRows: [['> 0.9', '直接执行'], ['0.5 - 0.9', '大模型复核'], ['< 0.5', '上人工桌']],
    caption: '不生成一个字，只给出带校准概率的、类型化的判断。事先规定好答案的形状（schema）。',
    leftFoot: 'STATE + 3 TYPED QUESTIONS',
    rightFoot: 'schema locks the answer shape',
    routeIdx: 0,
  },
  {
    fig: 'Fig 2 · 案例一：退款工单',
    hudTitle: 'noul · 是/否',
    hudValue: '0.93',
    hudRows: [['P(yes)', '0.93'], ['判断', '是'], ['动作', '直接退款']],
    caption: 'Jev 同时回答三个问题：是不是退款请求？0.93，是。置信度 > 0.9，直接走自动账单通道。',
    leftFoot: 'NOUL 0.93 > GATE 0.9',
    rightFoot: 'routed to billing · no human',
    routeIdx: 0,
  },
  {
    fig: 'Fig 3 · 案例二：边界争议',
    hudTitle: 'noul · 是/否',
    hudValue: '0.68',
    hudRows: [['P(yes)', '0.68'], ['判断', '待复核'], ['动作', '转大模型']],
    caption: '当校准概率落在 0.5–0.9 之间（0.68），Jev 不强行拍板，而是触发中间通道交由大模型复核。',
    leftFoot: '0.5 ≤ NOUL 0.68 ≤ 0.9',
    rightFoot: 'escalated to frontier LLM',
    routeIdx: 1,
  },
];

export class JevIsometricScene {
  constructor() {
    this.duration = 18;
  }

  font(ctx, size = 12, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#27272a', size = 12, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  // Isometric projection: (u, v) on platform, z = height upward
  iso(u, v, z = 0) {
    const originX = 490;
    const originY = 420;
    const sx = (u - v) * 0.866;
    const sy = (u + v) * 0.5 - z;
    return { x: originX + sx, y: originY + sy };
  }

  drawIsoBox(ctx, u, v, z, du, dv, dz, topCol = '#fbfaf7', leftCol = '#eceae2', rightCol = '#dfdcd0', strokeCol = '#8c887d') {
    const p000 = this.iso(u, v, z);
    const p100 = this.iso(u + du, v, z);
    const p110 = this.iso(u + du, v + dv, z);
    const p010 = this.iso(u, v + dv, z);

    const p001 = this.iso(u, v, z + dz);
    const p101 = this.iso(u + du, v, z + dz);
    const p111 = this.iso(u + du, v + dv, z + dz);
    const p011 = this.iso(u, v + dv, z + dz);

    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = strokeCol;

    // Top face
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.moveTo(p001.x, p001.y); ctx.lineTo(p101.x, p101.y);
    ctx.lineTo(p111.x, p111.y); ctx.lineTo(p011.x, p011.y);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Front-left face (v = v + dv)
    ctx.fillStyle = leftCol;
    ctx.beginPath();
    ctx.moveTo(p010.x, p010.y); ctx.lineTo(p110.x, p110.y);
    ctx.lineTo(p111.x, p111.y); ctx.lineTo(p011.x, p011.y);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Front-right face (u = u + du)
    ctx.fillStyle = rightCol;
    ctx.beginPath();
    ctx.moveTo(p100.x, p100.y); ctx.lineTo(p110.x, p110.y);
    ctx.lineTo(p111.x, p111.y); ctx.lineTo(p101.x, p101.y);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  drawIsoCylinder(ctx, u, v, z, radius, height, topCol = '#ead7a7', bodyCol = '#d0b472', strokeCol = '#8a733e') {
    const bot = this.iso(u, v, z);
    const top = this.iso(u, v, z + height);
    const rx = radius * 0.88, ry = radius * 0.5;

    ctx.fillStyle = bodyCol;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(top.x - rx, top.y);
    ctx.lineTo(bot.x - rx, bot.y);
    ctx.ellipse(bot.x, bot.y, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(top.x + rx, top.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.ellipse(top.x, top.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const caseIdx = Math.floor((t / 6) % CASES.length);
    const currentCase = CASES[caseIdx];
    const localT = (t % 6) / 6;

    // Warm Ivory Studio Background
    const bg = ctx.createRadialGradient(WIDTH / 2, 540, 80, WIDTH / 2, 540, 760);
    bg.addColorStop(0, '#fbfaf6');
    bg.addColorStop(1, '#efede6');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Top-left Legend & Top-right Stage Title
    this.text(ctx, currentCase.fig, 32, 48, '#27272a', 15, 700);
    const legend = [
      ['#27272a', 'the answer'],
      ['#cda958', 'calibration'],
      ['#a1a1aa', 'the old way'],
    ];
    legend.forEach(([col, lbl], i) => {
      const y = 78 + i * 24;
      ctx.fillStyle = col;
      ctx.fillRect(32, y - 8, 16, 3);
      ctx.fillRect(32, y - 3, 16, 3);
      this.text(ctx, lbl, 56, y, '#52525b', 12);
    });
    this.text(ctx, 'TYPE-SAFE SYSTEM ONE DECISION ENGINE', WIDTH - 32, 48, '#71717a', 12, 700, 'right');

    // --- Isometric Mechanical Decision Rig ---
    // 1. Main Base Slab
    this.drawIsoBox(ctx, -160, -80, 0, 520, 320, 18, '#f9f8f3', '#e7e5dc', '#dad7cb', '#9ca3af');

    // 2. Rear Calibration Compute Tower
    this.drawIsoBox(ctx, -140, -60, 18, 130, 110, 145, '#f8f7f2', '#eceae1', '#dedbd0', '#8c887d');
    // Cooling vents on tower front-left
    for (let i = 0; i < 8; i++) {
      const p1 = this.iso(-125 + i * 12, 51, 35);
      const p2 = this.iso(-125 + i * 12, 51, 95);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    // 3. Left Input Drum & Abacus Bar
    this.drawIsoBox(ctx, -135, 115, 18, 145, 55, 10, '#f3ebd3', '#e2d2a6', '#cbb67e', '#8a733e');
    this.drawIsoCylinder(ctx, -85, 75, 28, 34, 38, '#f6eed8', '#dfca92', '#8a733e');

    // 4. Central Linear Conveyor Track + Moving Golden Carrier
    this.drawIsoBox(ctx, -40, 25, 18, 330, 72, 26, '#f6f5f0', '#e6e4db', '#d6d3c7', '#8c887d');
    // Track ruler ticks
    for (let k = 0; k < 28; k++) {
      const pA = this.iso(-25 + k * 11, 97, 36);
      const pB = this.iso(-25 + k * 11, 97, 22);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
    }

    // Moving Golden Schema Plate along conveyor
    const plateU = -15 + clamp(localT * 1.25, 0, 1) * 245;
    this.drawIsoBox(ctx, plateU, 36, 46, 56, 48, 8, '#f6e7be', '#e2c780', '#cca952', '#8a6d29');

    // 5. Four Brass Calibration Cylinders (1 -> 2)
    for (let c = 0; c < 4; c++) {
      const cu = 68 + c * 32;
      const lift = state.reducedMotion ? 0 : Math.max(0, Math.sin(t * 4 - c * 0.9)) * 14;
      this.drawIsoCylinder(ctx, cu, 56, 44, 15, 52 + lift, '#f5e6bc', '#d4b568', '#806424');
    }

    // 6. Overhead Gantry Scanner Bridge
    this.drawIsoBox(ctx, 118, -35, 18, 22, 18, 125, '#f6f5f0', '#e5e3da', '#d5d2c6', '#8c887d');
    this.drawIsoBox(ctx, 118, -35, 132, 22, 108, 16, '#fbfaf7', '#ebe9e0', '#dcd9cd', '#8c887d');
    this.drawIsoCylinder(ctx, 129, 55, 105, 12, 26, '#f6e7be', '#d4b568', '#806424');

    // Glowing Amber Calibration Pulse when carrier passes gantry
    const scannerCenter = this.iso(129, 55, 86);
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    ctx.fillStyle = `rgba(217, 155, 38, ${0.16 + pulse * 0.14})`;
    ctx.beginPath(); ctx.arc(scannerCenter.x, scannerCenter.y, 32 + pulse * 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d99b26';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(scannerCenter.x, scannerCenter.y, 26, 0, Math.PI * 2); ctx.stroke();

    // 7. Circular Dial Gauge (3)
    this.drawIsoCylinder(ctx, 232, 62, 44, 42, 12, '#fbfaf7', '#e5e3da', '#8c887d');
    const dialTop = this.iso(232, 62, 57);
    const needleAngle = -0.8 + currentCase.routeIdx * 0.9 + Math.sin(t * 2) * 0.08;
    ctx.strokeStyle = '#806424';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dialTop.x, dialTop.y);
    ctx.lineTo(dialTop.x + Math.cos(needleAngle) * 26, dialTop.y + Math.sin(needleAngle) * 14);
    ctx.stroke();

    // 8. Front 3-Way Confidence Gate Switches & Right Ticket Printer
    this.drawIsoBox(ctx, 185, 125, 18, 98, 72, 28, '#f8f7f2', '#e7e5dc', '#d5d2c6', '#8c887d');
    for (let g = 0; g < 3; g++) {
      const isSelected = g === currentCase.routeIdx;
      this.drawIsoCylinder(
        ctx,
        204 + g * 28,
        155,
        46,
        10,
        isSelected ? 28 : 14,
        isSelected ? '#f6e2a4' : '#f3f2ed',
        isSelected ? '#d4b052' : '#d6d3c7',
        '#806424'
      );
    }

    // Right Ticket Printer & Verified Stack
    this.drawIsoBox(ctx, 285, -15, 18, 65, 65, 32, '#f8f7f2', '#e7e5dc', '#d5d2c6', '#8c887d');
    this.drawIsoBox(ctx, 295, -5, 50, 42, 6, 46, '#ffffff', '#f3f2ee', '#e5e4dc', '#9ca3af');

    // --- Left Floating HUD Card (Confidence Gate / Noul Output) ---
    const hx = 36, hy = 260, hw = 210, hh = 185;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fillRect(hx, hy, hw, hh);
    ctx.strokeStyle = '#caa656';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1);

    this.text(ctx, currentCase.hudTitle, hx + 16, hy + 28, '#8a733e', 12, 600);
    this.text(ctx, currentCase.hudValue, hx + 16, hy + 68, '#18181b', 34, 700);
    ctx.strokeStyle = '#e5e4dc';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hx + 16, hy + 84); ctx.lineTo(hx + hw - 16, hy + 84); ctx.stroke();

    currentCase.hudRows.forEach(([k, v], idx) => {
      const y = hy + 110 + idx * 26;
      this.text(ctx, k, hx + 16, y, '#52525b', 12, 600);
      this.text(ctx, v, hx + hw - 16, y, idx === currentCase.routeIdx ? '#9a6e18' : '#27272a', 12, 700, 'right');
    });

    // --- Bottom Latency Comparison & Narrative Card ---
    const bx = 140, by = 895, bw = 800, bh = 115;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#d6d3c7';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    this.text(ctx, currentCase.caption, WIDTH / 2, by + 52, '#18181b', 17, 600, 'center');
    this.text(ctx, 'PROSE ANSWER: 70–500 MS (AUTOREGRESSIVE TOKENS)   vs   JEV: SINGLE PASS TYPED PROBABILITY', WIDTH / 2, by + 88, '#8a733e', 11.5, 700, 'center');

    // Bottom Comparison Telemetry Strip (y = 1045..1285)
    const tx = 140, ty = 1045, tw = 800, th = 220;
    ctx.fillStyle = '#f6f5f0';
    ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = '#dcd9cd';
    ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, th - 1);

    this.text(ctx, '▪ SYSTEM ONE ROUTING BENCHMARK · 10,000 DECISIONS / MIN', tx + 20, ty + 30, '#27272a', 12, 700);
    const bars = [
      ['> 0.9 直接代码执行 (Direct Action)', 0.76, '#b48a2e', '7,620 calls · 4 ms'],
      ['0.5–0.9 大模型复核 (LLM Escalation)', 0.18, '#52525b', '1,810 calls · 320 ms'],
      ['< 0.5 人工审批桌 (Human Desk)', 0.06, '#a1a1aa', '570 calls · manual'],
    ];
    bars.forEach(([lbl, ratio, col, rightTxt], idx) => {
      const y = ty + 74 + idx * 48;
      this.text(ctx, lbl, tx + 20, y, '#27272a', 12, 600);
      ctx.fillStyle = '#e5e3da';
      ctx.fillRect(tx + 290, y - 11, 320, 14);
      ctx.fillStyle = col;
      ctx.fillRect(tx + 290, y - 11, 320 * ratio, 14);
      this.text(ctx, rightTxt, tx + tw - 20, y, '#52525b', 11.5, 700, 'right');
    });

    this.text(ctx, currentCase.leftFoot, 32, 1322, '#71717a', 12, 700);
    this.text(ctx, currentCase.rightFoot, WIDTH - 32, 1322, '#71717a', 12, 700, 'right');
  }
}
