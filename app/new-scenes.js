import { BauhausPrimaryScene } from './scenes/bauhaus-primary.js';
import { MirrorArrayScene } from './scenes/mirror-array.js';
import { GridRhythmScene } from './scenes/grid-rhythm.js';
import { DigitalOrganismScene } from './scenes/digital-organism.js';
import { PoseidonFountainScene } from './scenes/poseidon-fountain.js';
import { ProgressiveDiagramScene } from './scenes/progressive-diagram.js';
import { EwmWorldScene, EwmHoloScene, EwmCityScene, EwmTracksScene } from './scenes/ewm-fx.js';
import { EwmStackScene } from './scenes/ewm-stack.js';

const EWM_CREDIT = 'EWM Challenge · NTU GIFTS & Nanyang Business School（站点 adamleopold.github.io/ewm-challenge）';
const EWM_BADGE = 'REA 源码取证 · Canvas 2D 移植';

const definitions = [
  ['bauhaus-primary', '07 · 包豪斯机械构成', BauhausPrimaryScene, '田玉泽 · 湖北美术学院', '75 个实测几何锚点，字形与纸张纹理重建。'],
  ['mirror-array', '08 · 翻转镜阵', MirrorArrayScene, 'Random International · SFUED 介绍', '摄影中的房间、人物及反射以矢量近似重建。'],
  ['grid-rhythm', '09 · 波浪网格', GridRhythmScene, '解薇霓 · 湖北美术学院', '保留原作海报、网格与代码栏；相位按观测重建。'],
  ['digital-organism', '10 · 数字有机体', DigitalOrganismScene, '盛海波 · 湖北美术学院', '依据轮廓与色板重建；原作噪声种子不可得。'],
  ['poseidon-fountain', '11 · 音乐粒子喷泉', PoseidonFountainScene, '张楚宜 · 上海纽约大学', '依据无声 GIF 重建喷流与圆环；不含原始音轨。'],
  ['progressive-diagram', '12 · 图表逐笔生成', ProgressiveDiagramScene, '歸藏的 AI 工具箱', '重建原片 LLM 训练章节及滚动过程，本地演示不调用模型。'],
  ['ewm-world', '13 · EWM 世界模型地球', EwmWorldScene, EWM_CREDIT, '移植 fx.js worldFX：1100 点斐波那契球、30 条智能体弧线、12 个呼吸图标；随机数改为种子哈希。', EWM_BADGE],
  ['ewm-holo', '14 · EWM K线与流动性曲面', EwmHoloScene, EWM_CREDIT, '移植 holoFX（quiet）：K 线、5 期均线、26 条流动性曲线与气泡；鼠标在曲面上抬起凸起。', EWM_BADGE],
  ['ewm-city', '15 · EWM 城市推演', EwmCityScene, EWM_CREDIT, '移植 cityFX（quiet）：11×11 街区、30 个智能体与情景脉冲；页面上的产品截图与聊天面板未重建。', EWM_BADGE],
  ['ewm-tracks', '16 · EWM 赛道三联屏', EwmTracksScene, EWM_CREDIT, '赛道选择页三联斜切面板：交易终端 + K 线、Track 2 健康因子清算线、倒挂城市；背景视频未重建。', EWM_BADGE],
  ['ewm-stack', '17 · EWM 经济世界模型分层', EwmStackScene, EWM_CREDIT, '移植 stack3d.js 的 14 个相机关键帧与 L1–L4 显隐曲线；时间轴代替滚动进度，Kenney GLB 模型以低多边形方块近似。', EWM_BADGE],
];
export const NEW_SCENES = Object.fromEntries(definitions.map(([id, label, Scene, creator, note, badge = '原片测量与矢量重建']) => {
  const instance = new Scene();
  return [id, { id, label, heading: label, badge: `${instance.width}×${instance.height} · ${badge}`,
    instance, width: instance.width, height: instance.height, duration: instance.duration,
    refManifest: `/assets/references/${id}/manifest.json`, evidence: [['作者 / 来源', creator], ['复现说明', note]] }];
}));

export function nearestReferenceFrame(frames, elapsed) {
  if (!frames?.length) return null;
  const time = Number(elapsed) || 0;
  let best = frames[0];
  for (const frame of frames) if (Math.abs(frame.time - time) < Math.abs(best.time - time)) best = frame;
  return best;
}
