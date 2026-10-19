import { Renderer as SpiderRenderer } from './spider/renderer.js';
import { referenceRun, stateAt } from './spider/model.js';
import { ReaDecompilerScene } from './scenes/rea-decompiler.js';
import { KesslerOrbitalScene } from './scenes/kessler-orbital.js';
import { StanfordTorusScene } from './scenes/stanford-torus.js';
import { SubsTeardownScene } from './scenes/subs-teardown.js';
import { JevIsometricScene } from './scenes/jev-isometric.js';

const $ = sel => document.querySelector(sel);
const canvas = $('#scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const [studioPrompt, inetPrompt] = await Promise.all([
  fetch('/spider/prompt.txt').then(r => r.text()),
  fetch('/spider/inferencenet-prompt.txt').then(r => r.text()),
]);

const spiderRenderer = new SpiderRenderer(canvas, {
  onSelect(index) {
    selectedTokenIndex = index;
    if (!playing) render();
  },
});

const SCENES = {
  'spider-inet': {
    id: 'spider-inet',
    heading: 'INFERENCENET SPIDER // EVERY CLAIM, ONE FORK · NTU GIFTS / SFF',
    badge: 'Scene 01A · 16 Legs · 22 Tentacles · Econometric & RSI Triage',
    refImg: '/assets/references/01-prompt-spider.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6acde7bd000000001203a044',
    duration: 20.921,
    evidence: [
      ['灵感来源', '唐僧洗头用飘柔_BigTom (6acde7bd000000001203a044) + InferenceNet 定制'],
      ['核心几何', '16 腿机械步态 + 22 根触手三段式（伸出/驻留/卷回）+ 440 根贝塞尔蛛丝'],
      ['分流逻辑', 'p ≥ 0.95 → harness code | p < 0.95 → model+RSI | audit gate → verifier'],
      ['动效曲线', '实测 20.92s 轨迹锚点 + 双拍红芯心跳 + 3D 球面覆盖率投影'],
    ],
  },
  'spider-studio': {
    id: 'spider-studio',
    heading: 'PROMPT SPIDER // EVERY WORD, ONE FORK · RYBINFX RECONSTRUCTION',
    badge: 'Scene 01B · Original Studio Prompt · 175 Forks',
    refImg: '/assets/references/01-prompt-spider.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6acde7bd000000001203a044',
    duration: 20.921,
    evidence: [
      ['灵感来源', '唐僧洗头用飘柔_BigTom (6acde7bd000000001203a044) 复刻 rybinfx'],
      ['色板参数', 'Bg #080909 · Pink #f23c83 · Code #48d7a6 · Model #e18c78 · You #f4cf4d'],
      ['统计锚点', '195 Words · 175 Forks (137 code / 27 sonnet 5.5 / 11 you)'],
      ['底部面板', 'Decision Stream + Confidence Last 40 + Dot Matrix + 3D Sphere'],
    ],
  },
  'rea-decompiler': {
    id: 'rea-decompiler',
    heading: 'REA · BYTES IN. SOURCE OUT. // DISASM 64 ↔ DECOMP 16',
    badge: 'Scene 02 · Dual-Ring Neural Web & Live Handoff Ledger',
    refImg: '/assets/references/02-rea-decompiler.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6ad0ccf400000000180053c3',
    duration: 24,
    instance: new ReaDecompilerScene(),
    evidence: [
      ['灵感来源', '别话的AI觉醒录《程序员都在传的神器：AI直接逆向任何软件》(6ad0ccf400000000180053c3)'],
      ['色板参数', 'Paper #f7f6f2 · Disasm #d95f18 · Decomp #06b6d4 · Handoff #db2777'],
      ['核心几何', '左右对称 R=525 双轨圆环 + 420 根径向脉冲柱 + 720 根环内神经蛛网'],
      ['底部 6 联台', 'disasm 热力图 | decomp 像素柱 | handoff 点阵 | rea.ts 实时高亮 | 3D 球 | 双正弦同步波'],
    ],
  },
  'kessler-orbital': {
    id: 'kessler-orbital',
    heading: 'KESSLER WATCH // CONJUNCTION DESK · JEV LEO ORBITAL AVOIDANCE',
    badge: 'Scene 03 · 3D Globe · 6 Planes × 8 Spacecraft · Pc Step-Drop',
    refImg: '/assets/references/03-kessler-orbital.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6ad4d58c0000000026030df0',
    duration: 32,
    instance: new KesslerOrbitalScene(),
    evidence: [
      ['灵感来源', '古法手戳AI《JEV决策模型预测卫星碰撞系统》(6ad4d58c0000000026030df0)'],
      ['色板参数', 'Space #06080c · Alert #f43f5e · Burn #34d399 · Telemetry #38bdf8 · Debris #ea580c'],
      ['核心几何', '中央 3D 经纬线框地球 + 6 轨道面 × 8 卫星实时公转 + 左侧 4 雷达极坐标扫描盘'],
      ['物理演进', 'T-120s 变轨点火 (Δv 0.196 m/s) 触发碰撞概率 Pc 从 4.7e-4 阶梯跳水至 <1e-10'],
    ],
  },
  'stanford-torus': {
    id: 'stanford-torus',
    heading: 'STANFORD AI LAB / DISCOVERY ARCHITECTURE · OPUS 5.5 + GPT-6.1 SOL',
    badge: 'Scene 04 · 3D Torus Connectome · 14,280 Nodes · Zero Context Bleed',
    refImg: '/assets/references/04-stanford-torus.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6ac57285000000001203d063',
    duration: 24,
    instance: new StanfordTorusScene(),
    evidence: [
      ['灵感来源', 'NASA《再来一个 · Stanford AI Lab Discovery Architecture》(6ac57285000000001203d063)'],
      ['色板参数', 'Void #07080a · Opus Gold #f59e0b · Sol Blue #38bdf8 · Verified #34d399'],
      ['核心几何', '顶部 3 层认知栈火焰图 + 中央 3D 旋转圆环体 (Torus) + 340 根径向发光探针'],
      ['底部面板', '3.56B Tok/min 流带图 + 领域极坐标玫瑰图 + Before/After 哑铃图 + Pareto 曲线'],
    ],
  },
  'subs-teardown': {
    id: 'subs-teardown',
    heading: 'SUBS → LOCAL // $300/MO IN SUBSCRIPTIONS → $0/MO IS THE TARGET',
    badge: 'Scene 05 · Sonnet Researches · JEV Filters · REA Maps · Opus 5.5 Builds',
    refImg: '/assets/references/05-subs-teardown.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6ad1f7c90000000014003bef',
    duration: 20,
    instance: new SubsTeardownScene(),
    evidence: [
      ['灵感来源', '别话的AI觉醒录《夯爆啦！直接让AI来帮你省钱》(6ad1f7c90000000014003bef)'],
      ['色板参数', 'Deep Violet #13071e · Neon Pink #f472b6 · Rebuild Gold #facc15 · Opus Cyan #38bdf8'],
      ['核心几何', '左侧 REA 调用链 + 发光洋红圆弧 JEV FILTER + 14 道水平霓虹激光束 + Opus 建造进度环'],
      ['底部 6 联台', 'Sonnet 信号 | JEV 过滤柱 | REA 依赖树 | teardown.py | Opus 测试 | 月费 $300 → $27 跳水'],
    ],
  },
  'jev-isometric': {
    id: 'jev-isometric',
    heading: 'JEV · SYSTEM ONE DECISION ENGINE // LLM WRITES TOKENS · JEV READS ONCE',
    badge: 'Scene 06 · Isometric Mechanical Rig · Schema & Confidence Gate',
    refImg: '/assets/references/06-jev-isometric.jpg',
    xhsUrl: 'https://www.xiaohongshu.com/explore/6ad4cb85000000002600a102',
    duration: 18,
    instance: new JevIsometricScene(),
    evidence: [
      ['灵感来源', '科技翻译官《Jev：System One 决策模型》(6ad4cb85000000002600a102)'],
      ['色板参数', 'Warm Ivory #fbfaf6 · Champagne Gold #d4b568 · Ink #27272a · Amber Pulse #d99b26'],
      ['核心几何', '精确 30° 等轴测（Isometric）三维投影：传送带标尺、四柱黄铜校准器、龙门扫描头、三路置信门'],
      ['三阶段叙事', '每 6 秒自动切换 Fig 1 (置信门定义) → Fig 2 (退款工单 0.93 直通) → Fig 3 (0.68 边界转大模型)'],
    ],
  },
};

const spiderRuns = {
  'spider-inet': referenceRun(inetPrompt, { preset: 'inferencenet' }),
  'spider-studio': referenceRun(studioPrompt, { preset: 'studio' }),
};

const params = new URLSearchParams(location.search);
let currentSceneId = SCENES[params.get('scene')] ? params.get('scene') : 'spider-inet';
let compareOpen = params.get('compare') === '1';
let elapsed = 0;
let playing = !reducedMotion;
let speed = 1;
let selectedTokenIndex = null;
let lastFrame = null;

function activeScene() {
  return SCENES[currentSceneId];
}

function syncCompareUI() {
  $('#stageGrid').classList.toggle('compare-open', compareOpen);
  $('#referencePane').hidden = !compareOpen;
  $('#compareBtn').classList.toggle('active', compareOpen);
  $('#compareBtn').setAttribute('aria-pressed', String(compareOpen));
}

function syncSceneUI() {
  const s = activeScene();
  document.querySelectorAll('.scene-btn').forEach(btn => {
    const active = btn.dataset.scene === currentSceneId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  $('#sceneHeading').innerHTML = `<i class="pink-dot"></i> ${s.heading}`;
  $('#sceneBadge').textContent = s.badge;
  $('#refImage').src = s.refImg;
  $('#refXhsLink').href = s.xhsUrl;
  $('#timeline').max = String(s.duration);
  $('#frameStatus').textContent = s.id;

  const dl = $('#evidenceList');
  dl.replaceChildren();
  for (const [k, v] of s.evidence) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = k;
    dd.textContent = v;
    dl.append(dt, dd);
  }
}

function render() {
  const s = activeScene();
  if (currentSceneId === 'spider-inet' || currentSceneId === 'spider-studio') {
    const preset = currentSceneId === 'spider-inet' ? 'inferencenet' : 'studio';
    const run = spiderRuns[currentSceneId];
    const st = stateAt(run, elapsed, {
      playing,
      threshold: 0.95,
      selectedIndex: selectedTokenIndex,
      routeFilter: 'all',
      reducedMotion,
      preset,
    });
    spiderRenderer.render(st);
  } else {
    spiderRenderer.resize();
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(spiderRenderer.dpr, 0, 0, spiderRenderer.dpr, 0, 0);
    s.instance.render(ctx, { elapsed, duration: s.duration, reducedMotion, playing });
    ctx.restore();
  }

  $('#timeline').value = String(elapsed);
  $('#timeText').textContent = `${elapsed.toFixed(2).padStart(5, '0')} / ${s.duration.toFixed(2)}`;
  $('#playBtn').textContent = playing ? '暂停' : '播放';
}

function selectScene(sceneId, { resetTime = true } = {}) {
  if (!SCENES[sceneId]) return;
  currentSceneId = sceneId;
  selectedTokenIndex = null;
  if (resetTime) elapsed = 0;
  syncSceneUI();
  render();
}

function seek(val) {
  const s = activeScene();
  elapsed = Math.max(0, Math.min(s.duration, Number(val) || 0));
  render();
}

function tick(now) {
  if (playing && lastFrame !== null) {
    const s = activeScene();
    elapsed += Math.min((now - lastFrame) / 1000, 0.15) * speed;
    if (elapsed >= s.duration) {
      if ($('#loop').checked) elapsed %= s.duration;
      else {
        elapsed = s.duration;
        playing = false;
      }
    }
    render();
  }
  lastFrame = now;
  requestAnimationFrame(tick);
}

document.querySelectorAll('.scene-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playing = true;
    selectScene(btn.dataset.scene);
  });
});

$('#playBtn').addEventListener('click', () => {
  const s = activeScene();
  if (!playing && elapsed >= s.duration) elapsed = 0;
  playing = !playing;
  render();
});

$('#restartBtn').addEventListener('click', () => {
  elapsed = 0;
  playing = true;
  render();
});

$('#timeline').addEventListener('input', e => {
  playing = false;
  seek(e.target.value);
});

$('#speed').addEventListener('change', e => {
  speed = Number(e.target.value) || 1;
});

$('#compareBtn').addEventListener('click', () => {
  compareOpen = !compareOpen;
  syncCompareUI();
});

$('#workflowBtn').addEventListener('click', () => $('#workflowDialog').showModal());
$('#closeWorkflowBtn').addEventListener('click', () => $('#workflowDialog').close());

$('#fullscreenBtn').addEventListener('click', () => {
  document.body.classList.toggle('immersive');
});

document.addEventListener('keydown', e => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName) || $('#workflowDialog').open) return;
  if (e.code === 'Space') {
    e.preventDefault();
    $('#playBtn').click();
  } else if (e.key.toLowerCase() === 'r') {
    $('#restartBtn').click();
  } else if (e.key.toLowerCase() === 'c') {
    $('#compareBtn').click();
  } else if (e.key.toLowerCase() === 'f') {
    $('#fullscreenBtn').click();
  } else if (e.key === 'ArrowRight') {
    playing = false;
    seek(elapsed + 0.5);
  } else if (e.key === 'ArrowLeft') {
    playing = false;
    seek(elapsed - 0.5);
  }
});

window.addEventListener('resize', render);

window.cyberLab = {
  selectScene,
  seek,
  pause: () => { playing = false; render(); },
  play: () => { playing = true; render(); },
  setCompare: open => { compareOpen = Boolean(open); syncCompareUI(); },
  getState: () => ({ scene: currentSceneId, elapsed, duration: activeScene().duration, compareOpen, playing }),
};

syncCompareUI();
syncSceneUI();
render();
requestAnimationFrame(tick);
