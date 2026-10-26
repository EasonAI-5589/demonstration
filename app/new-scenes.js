import { BauhausPrimaryScene } from './scenes/bauhaus-primary.js';
import { MirrorArrayScene } from './scenes/mirror-array.js';
import { GridRhythmScene } from './scenes/grid-rhythm.js';
import { DigitalOrganismScene } from './scenes/digital-organism.js';
import { PoseidonFountainScene } from './scenes/poseidon-fountain.js';
import { ProgressiveDiagramScene } from './scenes/progressive-diagram.js';

const definitions = [
  ['bauhaus-primary', '07 · 包豪斯机械构成', BauhausPrimaryScene, '田玉泽 · 湖北美术学院', '75 个实测几何锚点，字形与纸张纹理重建。'],
  ['mirror-array', '08 · 翻转镜阵', MirrorArrayScene, 'Random International · SFUED 介绍', '摄影中的房间、人物及反射以矢量近似重建。'],
  ['grid-rhythm', '09 · 波浪网格', GridRhythmScene, '解薇霓 · 湖北美术学院', '保留原作海报、网格与代码栏；相位按观测重建。'],
  ['digital-organism', '10 · 数字有机体', DigitalOrganismScene, '盛海波 · 湖北美术学院', '依据轮廓与色板重建；原作噪声种子不可得。'],
  ['poseidon-fountain', '11 · 音乐粒子喷泉', PoseidonFountainScene, '张楚宜 · 上海纽约大学', '依据无声 GIF 重建喷流与圆环；不含原始音轨。'],
  ['progressive-diagram', '12 · 图表逐笔生成', ProgressiveDiagramScene, '歸藏的 AI 工具箱', '重建原片 LLM 训练章节及滚动过程，本地演示不调用模型。'],
];
export const NEW_SCENES = Object.fromEntries(definitions.map(([id, label, Scene, creator, note]) => {
  const instance = new Scene();
  return [id, { id, label, heading: label, badge: `${instance.width}×${instance.height} · 原片测量与矢量重建`,
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
