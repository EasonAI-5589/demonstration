const WIDTH = 804;
const HEIGHT = 720;
const DURATION = 6.9;
const FONT = '"Segoe UI", "Microsoft YaHei", Arial, sans-serif';
const INK = '#262926';
const MUTED = '#929992';
const LAVENDER = ['#eeeffd', '#cfd4ef', '#424d87'];
const MINT = ['#e5fbf2', '#b3e7d1', '#286c58'];
const GOLD = ['#fff9e3', '#eadf9b', '#8c7136'];
const PINK = ['#fbe8f2', '#e5bfd4', '#86576d'];
const BLUE = ['#e5f4fb', '#afd7e8', '#376e86'];
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = x => { const n = clamp(x); return n * n * (3 - 2 * n); };
const reveal = (time, start, span = 0.12) => smooth((time - start) / span);

// Section boundaries were read from the 69 decoded source frames (100 ms each).
// The original generated markup is unavailable; all between-frame motion is reconstructed.
const SECTIONS = [
  { id: 'architecture', name: '整体架构', start: 0.8, end: 2.2 },
  { id: 'data', name: '训练数据流程', start: 2.2, end: 3.3 },
  { id: 'loop', name: '训练循环', start: 3.3, end: 4.6 },
  { id: 'stages', name: '训练阶段', start: 4.6, end: 6.0 },
  { id: 'loss', name: '损失函数与优化', start: 6.0, end: 6.6 },
  { id: 'summary', name: '总结', start: 6.6, end: DURATION },
];

function text(ctx, value, x, y, size = 11, color = INK, weight = 400, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  ctx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, radius = 10) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

function card(ctx, { x, y, w, h, title, sub = '', palette = LAVENDER, alpha = 1, size = 11 }) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = palette[0];
  ctx.strokeStyle = palette[1];
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill(); ctx.stroke();
  text(ctx, title, x + w / 2, y + h / 2 + (sub ? -6 : 4), size, palette[2], 600, 'center');
  if (sub) text(ctx, sub, x + w / 2, y + h / 2 + 14, 9, '#777e78', 400, 'center');
  ctx.restore();
}

function edge(ctx, points, progress = 1, color = '#7f8a8a', arrow = true) {
  if (progress <= 0) return;
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let remaining = lengths.reduce((a, b) => a + b, 0) * clamp(progress);
  let end = points[0], direction = [1, 0];
  ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(...points[0]);
  for (let i = 0; i < lengths.length && remaining > 0; i++) {
    const p = points[i], q = points[i + 1];
    const k = Math.min(1, remaining / Math.max(0.001, lengths[i]));
    end = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    direction = [q[0] - p[0], q[1] - p[1]];
    ctx.lineTo(...end); remaining -= lengths[i];
  }
  ctx.stroke();
  if (arrow) {
    const a = Math.atan2(direction[1], direction[0]);
    ctx.fillStyle = color; ctx.beginPath();ctx.moveTo(...end);
    ctx.lineTo(end[0] - Math.cos(a - 0.45) * 7, end[1] - Math.sin(a - 0.45) * 7);
    ctx.lineTo(end[0] - Math.cos(a + 0.45) * 7, end[1] - Math.sin(a + 0.45) * 7);
    ctx.closePath();ctx.fill();
  }
}

function heading(ctx, value, y) { text(ctx, value, 126, y, 16, INK, 650); }
function bullets(ctx, lines, x, y, gap = 21) {
  lines.forEach((line, i) => text(ctx, `•  ${line}`, x, y + i * gap, 10.5, '#444c47'));
}

export class ProgressiveDiagramScene {
  constructor() {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.duration = DURATION;
  }

  stateAt(elapsed, reducedMotion = false) {
    const time = clamp(Number.isFinite(Number(elapsed)) ? Number(elapsed) : 0, 0, DURATION);
    let index = -1;
    SECTIONS.forEach((section, i) => { if (time >= section.start) index = i; });
    const section = SECTIONS[index];
    return { time, index, section: section?.id ?? 'intro', local: section ? time - section.start : time, reducedMotion: Boolean(reducedMotion) };
  }

  render(ctx, state = {}) {
    const s = this.stateAt(state.elapsed, state.reducedMotion);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
    const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    background.addColorStop(0, '#9bc8e9'); background.addColorStop(0.4, '#d3e4ec'); background.addColorStop(1, '#9babb1');
    ctx.fillStyle = background;ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.shadowColor = '#34454a60';ctx.shadowBlur = 24;ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fefefe';roundRect(ctx, 31, 33, 742, 655, 8);ctx.fill();
    ctx.shadowBlur = 0;ctx.shadowOffsetY = 0;
    text(ctx, 'New Chat', 43, 55, 10.5, '#505750', 600);
    text(ctx, '♢  /  生成式 UI 测试', 98, 55, 9, '#b3b7b1');
    text(ctx, '⌘    ◇', 722, 55, 12, '#9ca59d');

    ctx.save();
    ctx.beginPath();ctx.rect(67, 70, 675, 492);ctx.clip();
    if (s.index < 0) this.drawIntro(ctx, s);
    else {
      // Preserve the recorded scroll narrative while replacing scroll-dependent DOM with pure time.
      const enter = s.reducedMotion ? 1 : reveal(s.local, 0, 0.13);
      ctx.translate(0, (1 - enter) * 18);
      ctx.globalAlpha = enter;
      const methods = ['drawArchitecture', 'drawData', 'drawLoop', 'drawStages', 'drawLoss', 'drawSummary'];
      this[methods[s.index]](ctx, s.local, s.reducedMotion);
    }
    ctx.restore();
    if (s.index >= 0) {
      text(ctx, s.time >= DURATION - 0.05 ? '可视化已完成' : '正在渲染可视化', 129, 548, 9, '#b0b6b0');
      text(ctx, `${Math.round(16 + s.time * 4)}s`, 214, 548, 9, '#b0b6b0');
    }
    this.drawComposer(ctx, s);
    ctx.restore();
  }

  drawIntro(ctx, s) {
    ctx.fillStyle = '#e9eae7';ctx.beginPath();ctx.arc(402, 332, 25, 0, Math.PI * 2);ctx.fill();
    text(ctx, '✺', 402, 344, 32, '#8a9187', 400, 'center');
    text(ctx, 'Claude Chat', 402, 379, 12, '#575e56', 500, 'center');
    text(ctx, '开始与 CodePilot 对话，让想法逐步变成可交互的图形。', 402, 399, 9, '#a8afa6', 400, 'center');
    if (s.time > 0.65) {
      ctx.fillStyle = '#171a17';roundRect(ctx, 505, 78, 176, 33, 10);ctx.fill();
      text(ctx, '帮我可视化的解释 LLM 训练过程', 593, 99, 9, '#f5f7f3', 400, 'center');
    }
  }

  drawArchitecture(ctx, t, rm) {
    ctx.fillStyle = '#171a17';roundRect(ctx, 505, 78, 176, 33, 10);ctx.fill();
    text(ctx, '帮我可视化的解释 LLM 训练过程', 593, 99, 9, '#f5f7f3', 400, 'center');
    text(ctx, '我来为你创建一个可视化的 LLM 训练过程解释。我会分几个部分来讲解。', 126, 158, 10, '#535953');
    heading(ctx, '1. LLM 整体架构', 199);
    const show = n => rm ? Number(t >= n) : reveal(t, n);
    card(ctx, { x: 163, y: 426, w: 77, h: 61, title: '输入层', sub: 'Token 化', alpha: show(0.08) });
    card(ctx, { x: 277, y: 426, w: 76, h: 61, title: '嵌入层', sub: '向量化', alpha: show(0.17) });
    card(ctx, { x: 390, y: 246, w: 90, h: 241, title: '', palette: MINT, alpha: show(0.29) });
    ctx.save();ctx.globalAlpha *= show(0.29);
    text(ctx, 'Transformer', 435, 267, 10, '#286c58', 600, 'center');text(ctx, 'N 层堆叠', 435, 284, 9, '#347862', 400, 'center');ctx.restore();
    ['自注意力', '前馈网络', 'LayerNorm'].forEach((title, i) => card(ctx, { x: 401, y: 299 + i * 53, w: 68, h: 38, title, palette: ['#d1f5e7', '#94d3ba', '#3c7f67'], size: 9, alpha: show(0.39 + i * 0.08) }));
    card(ctx, { x: 518, y: 426, w: 76, h: 61, title: '输出层', sub: '概率分布', palette: GOLD, alpha: show(0.61) });
    edge(ctx, [[240, 456], [277, 456]], show(0.25));
    edge(ctx, [[353, 456], [390, 367]], show(0.58));
    edge(ctx, [[480, 367], [518, 456]], show(0.71));
  }

  drawData(ctx, t, rm) {
    text(ctx, '核心组件说明：', 126, 100, 10, '#383f39', 600);
    bullets(ctx, ['输入层：将文本分割成 Token（词片段）', '嵌入层：将 Token 转换为向量', 'Transformer：通过注意力机制理解上下文', '输出层：预测下一个 Token 的概率分布'], 126, 125, 18);
    heading(ctx, '2. 训练数据流程', 231);
    const labels = ['海量文本数据', '数据清洗', 'Tokenization', '批次构造', '批次'];
    const subs = ['书籍 / 网页 / 代码', '去重与过滤', 'Text → Token IDs', '序列长度与采样', 'Batch'];
    const pals = [LAVENDER, MINT, GOLD, ['#f1e8fa', '#d7bfe7', '#78558e'], PINK];
    labels.forEach((title, i) => {
      const a = rm ? Number(t >= i * 0.10) : reveal(t, 0.05 + i * 0.10);
      card(ctx, { x: 128 + i * 110, y: 402, w: 86, h: 68, title, sub: subs[i], palette: pals[i], size: 9.5, alpha: a });
      if (i > 0) edge(ctx, [[104 + i * 110, 437], [128 + i * 110, 437]], reveal(t, i * 0.10 + 0.15));
    });
  }

  drawLoop(ctx, t, rm) {
    heading(ctx, '3. 训练循环（核心过程）', 145);
    text(ctx, '训练目标：预测下一个 Token', 402, 183, 11, '#40483f', 550, 'center');
    const show = n => rm ? Number(t >= n) : reveal(t, n);
    card(ctx, { x: 126, y: 218, w: 453, h: 38, title: '输入序列 [词块] [词块] → 预测下一个', size: 10, alpha: show(0.05) });
    card(ctx, { x: 126, y: 262, w: 453, h: 29, title: '目标答案 [词]', size: 9, palette: MINT, alpha: show(0.13) });
    const data = [
      { x: 126, y: 309, title: '1. 前向传播', sub: '计算预测值', palette: GOLD },
      { x: 297, y: 309, title: '2. 损失计算', sub: '预测 − 目标', palette: ['#f1e8fa', '#d7bfe7', '#78558e'] },
      { x: 468, y: 309, title: '3. 反向传播', sub: '求梯度', palette: PINK },
      { x: 211, y: 405, title: '5. 继续训练', sub: '下一个 Batch', palette: BLUE },
      { x: 382, y: 405, title: '4. 参数更新', sub: 'Optimizer', palette: MINT },
    ];
    data.forEach((item, i) => card(ctx, { ...item, w: 137, h: 65, alpha: show(0.22 + i * 0.10) }));
    edge(ctx, [[263, 342], [297, 342]], show(0.42));edge(ctx, [[434, 342], [468, 342]], show(0.52));
    edge(ctx, [[537, 374], [537, 438], [519, 438]], show(0.66));
    edge(ctx, [[382, 438], [348, 438]], show(0.73));
    edge(ctx, [[211, 438], [106, 438], [106, 342], [126, 342]], show(0.84));
  }

  drawStages(ctx, t, rm) {
    heading(ctx, '4. 训练阶段详解', 145);
    const rows = [
      { y: 193, title: '阶段 1：预训练（Pre-training）', sub: '海量无标注文本 · 学习语言模式与知识', percent: '70%', palette: LAVENDER },
      { y: 302, title: '阶段 2：监督微调（SFT）', sub: '高质量指令数据 · 学习回答问题', percent: '20%', palette: MINT },
      { y: 411, title: '阶段 3：RLHF（人类反馈强化学习）', sub: '偏好与奖励信号 · 对齐人类需求', percent: '10%', palette: GOLD },
    ];
    rows.forEach((row, i) => {
      const a = rm ? Number(t >= i * 0.20) : reveal(t, 0.04 + i * 0.20);
      ctx.save();ctx.globalAlpha *= a;
      ctx.fillStyle = row.palette[0];ctx.strokeStyle = row.palette[1];ctx.lineWidth = 1;
      roundRect(ctx, 137, row.y, 453, 87, 9);ctx.fill();ctx.stroke();
      text(ctx, row.title, 156, row.y + 27, 11, row.palette[2], 650);
      text(ctx, row.sub, 156, row.y + 48, 9.5, '#66736a');
      text(ctx, row.percent, 558, row.y + 39, 22, row.palette[2], 650, 'right');
      text(ctx, '示例算力比例', 559, row.y + 58, 8, '#9ba79c', 400, 'right');
      ctx.fillStyle = row.palette[2];ctx.beginPath();ctx.arc(123, row.y + 41, 8, 0, Math.PI * 2);ctx.fill();
      text(ctx, String(i + 1), 123, row.y + 44, 8, '#fff', 600, 'center');ctx.restore();
      if (i > 0) edge(ctx, [[123, row.y - 22], [123, row.y + 30]], a, '#aeb8ae', false);
    });
  }

  drawLoss(ctx, t, rm) {
    heading(ctx, '5. 损失函数与优化', 162);
    const a = rm ? 1 : reveal(t, 0.04);
    ctx.save();ctx.globalAlpha *= a;
    card(ctx, { x: 126, y: 218, w: 176, h: 105, title: '', palette: LAVENDER });
    text(ctx, '交叉熵损失函数', 143, 243, 11, '#424d87', 600);
    text(ctx, 'Loss = −Σ y · log(p)', 143, 268, 10, '#6c7291');
    text(ctx, '目标：让正确 Token 的概率更高', 143, 289, 9, '#80887d');
    ctx.strokeStyle = '#d9dfdd';ctx.lineWidth = 1;
    for (let i = 1; i <= 6; i++) {ctx.beginPath();ctx.ellipse(419, 387, 25 + i * 22, 9 + i * 12, -0.14, 0, Math.PI * 2);ctx.stroke();}
    const p = rm ? 1 : reveal(t, 0.12, 0.36);
    edge(ctx, [[536, 313], [500, 337], [472, 343], [454, 367], [431, 374], [419, 387]], p, '#b87b72', false);
    [[536,313],[500,337],[472,343],[454,367],[431,374],[419,387]].forEach((point, i) => {
      if (p < i / 6) return;ctx.fillStyle = i === 5 ? '#4d9b7b' : '#bb8a81';ctx.beginPath();ctx.arc(...point, i === 5 ? 5 : 3, 0, Math.PI * 2);ctx.fill();
    });
    text(ctx, '梯度下降方向', 541, 308, 9, '#b87b72');text(ctx, '最小损失', 419, 418, 9, '#4c957b', 400, 'center');
    ctx.restore();
  }

  drawSummary(ctx, t, rm) {
    heading(ctx, '总结', 162);
    const x = 126, y = 195, widths = [82, 170, 122, 145];
    const rows = [
      ['阶段', '核心任务', '数据规模', '计算成本'],
      ['预训练', '学习语言模式', 'TB 级', '最高（70%）'],
      ['SFT', '学习指令格式', '10K–100K', '中等（20%）'],
      ['RLHF', '对齐人类偏好', '数万条', '较低（10%）'],
    ];
    rows.forEach((row, r) => {
      ctx.save();ctx.globalAlpha *= rm ? 1 : reveal(t, r * 0.025, 0.05);
      let cx = x;row.forEach((value, c) => {ctx.fillStyle = r === 0 ? '#f1f3f0' : '#fcfdfb';ctx.fillRect(cx, y + r * 33, widths[c], 33);ctx.strokeStyle = '#e5e8e2';ctx.lineWidth = 0.7;ctx.strokeRect(cx, y + r * 33, widths[c], 33);text(ctx, value, cx + 9, y + r * 33 + 21, 9.5, '#4a514b', r === 0 ? 600 : 400);cx += widths[c];});ctx.restore();
    });
    text(ctx, '关键概念：', 126, 360, 10.5, INK, 600);
    bullets(ctx, ['自回归训练：预测下一个 Token', '大规模训练：在海量数据中积累模式', '梯度下降：通过损失信号逐步更新参数', '参数、数据与计算共同决定训练过程'], 126, 385, 25);
    text(ctx, '每个图形随内容逐步出现，最终形成可以交互的解释。', 126, 507, 10, '#727b70');
  }

  drawComposer(ctx, s) {
    ctx.fillStyle = '#fdfefd';ctx.strokeStyle = '#e6e8e2';ctx.lineWidth = 1;
    roundRect(ctx, 45, 580, 718, 74, 16);ctx.fill();ctx.stroke();
    text(ctx, s.index < 0 ? '帮我可视化的解释 LLM 训练过程' : 'Message Claude...', 55, 605, 10, s.index < 0 ? '#444d43' : '#a2aaa0');
    text(ctx, '+    ◇    ›_     Kimi K2.5⌄', 61, 636, 11, '#b0b7ac');
    ctx.fillStyle = '#1769ff';ctx.beginPath();ctx.arc(742, 631, 12, 0, Math.PI * 2);ctx.fill();
    ctx.strokeStyle = '#c7ddff';ctx.lineWidth = 1;ctx.strokeRect(738, 627, 8, 8);
    text(ctx, '设计 Agent    ♧ 默认权限⌄', 54, 674, 9.5, '#a2aaa0');
  }
}
