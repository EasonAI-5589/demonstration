# Demonstration · 赛博遥测与动态可视化复刻实验室

## EWM Challenge 数据可视化（2026-10-26）

用 REA 对 [Economic World Model Challenge](https://adamleopold.github.io/ewm-challenge/) 网页取证：恢复出 `fx.js` 与 `stack3d.js` 源码，并在受控 Chromium 中采集原始帧与滚动进度。页面上的 5 个数据可视化移植为确定性 Canvas 2D 场景，分析与像素差见 [EWM 测量记录](notes/measurements/ewm-challenge.md)。

| 新编号 | ID | 场景 | 时长 | 原始实现 |
| --- | --- | --- | --- | --- |
| 13 | ewm-world | 世界模型地球：点阵球 + 智能体弧线 + 呼吸图标 | 12 s | `worldFX` |
| 14 | ewm-holo | HoloBit K 线、均线与流动性曲面 | 12 s | `holoFX`（quiet） |
| 15 | ewm-city | Agentic City 线框街区与智能体轨迹 | 12 s | `cityFX`（quiet） |
| 16 | ewm-tracks | 赛道选择三联屏：交易终端、健康因子清算线、倒挂城市 | 12 s | `terminalFX` · `holoFX` · `cityFX` |
| 17 | ewm-stack | 经济世界模型 L1–L4 分层与外圈字环（时间轴 = 滚动进度） | 24 s | `stack3d.js`（three.js） |

打开 http://127.0.0.1:4318/?scene=ewm-stack&compare=1 ，拖动时间轴即可按原站的相机关键帧穿过 L1 → L4 → 全景。

## 本轮扩充与 review（2026-10-26）

现有 **17 类场景、18 个预设**。新增场景保留原始 GIF 的画幅与时长，右侧原片关键帧随时间轴切换。来源与重建限制可在对比面板展开；完整来源表见 [微信公众号来源索引](notes/wechat-sources.md)，六份分析见 [测量记录目录](notes/measurements/)。

| 新编号 | ID | 场景 | 时长 |
| --- | --- | --- | --- |
| 07 | bauhaus-primary | 包豪斯三原色机械构成 | 2.25 s |
| 08 | mirror-array | 翻转镜阵 | 5.61 s |
| 09 | grid-rhythm | 波浪网格 | 1.24 s |
| 10 | digital-organism | 数字有机体 | 3.60 s |
| 11 | poseidon-fountain | 音乐粒子喷泉 | 2.00 s |
| 12 | progressive-diagram | 图表逐笔生成 / LLM 训练过程 | 6.90 s |

`npm start` 后打开 http://127.0.0.1:4318/?scene=bauhaus-primary&compare=1 。无需 npm install 或构建。`npm test` 检查渲染、倒序回放、有限数值、参考素材和服务器。

当前工作流为：**知乎 / 微信公众号找灵感 → 用户 review → REA 分析 → Canvas 复现 → 原片对比**。小红书自动化停用，以下旧场景来源仅保留历史记录。新增原始帧及来源在 assets/references/<id>/manifest.json，测量和推断边界在 notes/measurements/。摄影、字体、噪声种子、反射与原始音频存在重建限制，不将像素差比例当作还原度。

`workflow/measure-bauhaus.py <原始GIF路径>` 是可选离线测量工具（Pillow / NumPy / OpenCV）；前端不依赖 Python。原始 GIF / 视频及完整 REA Evidence 保留在仓库外，Git 仅保存压缩参考帧、测量表和矢量实现。旧 extract-evidence.mjs 的图片审计仍使用 macOS sips。

一个基于 **「人找灵感 → REA 拆帧/逆向测量 → 原生 Canvas 2D 确定性重建 → Emil 动效手感打磨 → 左右同屏对比验收」** 闭环工作流的交互式可视化画廊。

**零前端框架依赖（Pure ES Modules + HTML5 Canvas 2D）**，支持时间轴任意拖拽回放、速度调节（0.5×–4×）、全屏沉浸模式，以及一键开启 **「左：复刻交互 Canvas · 右：原片参考关键帧」** 同屏对比验收。

---

## 原有的 6 类交互式可视化场景（7 种预设）

| 编号 | 场景 ID | 标题与视觉风格 | 核心动效与交互亮点 |
| --- | --- | --- | --- |
| **01A** | `spider-inet` | **INFERENCENET SPIDER // EVERY CLAIM, ONE FORK** | 16 腿机械蜘蛛游走扫描计量经济学复现与 Modular RSI 规范，22 根触手抓取词块沿贝塞尔曲线织网，三路分流至 `harness` / `model+RSI` / `verifier` |
| **01B** | `spider-studio` | **PROMPT SPIDER // EVERY WORD, ONE FORK** | `rybinfx` 原版复刻：20.92s 实测轨迹、双拍红芯心跳、自定义中英文 Prompt 实时扫描与阈值调节 |
| **02** | `rea-decompiler` | **REA · BYTES IN. SOURCE OUT.** | 白底高对比双环反编译对抗台：左环 64 Agents `DISASM`（橙红蛛网脉冲）vs 右环 16 Agents `DECOMP`（青蓝蛛网脉冲），中央 `HANDOFF (Δφ)` 菱形交汇与底部 6 联实时面板 |
| **03** | `kessler-orbital` | **KESSLER WATCH // CONJUNCTION DESK** | JEV 低轨星座碰撞规避指挥台：左侧 4 地面雷达极坐标扫描 + 碎片带直方图，中央 3D 旋转线框地球与 48 颗卫星交会锁定，右侧预警队列，底部变轨 $\Delta v$ 与 $P_c$ 概率跳水曲线 |
| **04** | `stanford-torus` | **STANFORD AI LAB / DISCOVERY ARCHITECTURE** | Opus 5.5 + GPT-6.1 Sol 双引擎探索架构：顶部认知栈火焰图，中央 3D 旋转圆环连接组（Torus Connectome）放射千根发光探针，右侧沙箱 Pod 矩阵，底部流带图与 Pareto 曲线 |
| **05** | `subs-teardown` | **SUBS → LOCAL // $300/mo → $0/mo** | 暗紫赛博穹顶：左侧 Sonnet 粒子球体向发光圆弧 `JEV FILTER` 发射信号，激发水平彩色激光束击穿右侧 14 项付费订阅，底部 6 联面板实时追踪月费从 `$300` 降至 `$27` |
| **06** | `jev-isometric` | **Jev · System One 等轴测机械判读仪** | 暖白香槟金精密等轴测（Isometric）机械装置：传送带、四柱校准器、刻度转盘、置信门（`>0.9` 直接执行 / `0.5-0.9` 大模型复核 / `<0.5` 上人工桌）与打孔回执机联动 |

---

## 快速启动

需要 **Node.js 20+**：

```bash
git clone https://github.com/EasonAI-5589/demonstration.git
cd demonstration
npm start
```

浏览器打开 **http://127.0.0.1:4318** ：
- 顶部导航栏一键切换 **01–12 全部场景**（蜘蛛有两个预设）；
- 点击右上角 **「原片对比」** 按钮可展开原始来源关键帧与复刻说明，新增场景的参考帧随时间轴切换；
- 快捷键：`Space` 播放/暂停，`R` 重播，`C` 切换原片对比，`F` 全屏沉浸，`←` / `→` 移动时间轴 0.5 秒。

---

## 内置复刻工作流（Human → REA → Canvas → Emil Polish）

详见 [`AGENTS.md`](AGENTS.md)、[来源索引](notes/wechat-sources.md) 与 [分析记录](notes/measurements/)。[`notes/xhs-sources.md`](notes/xhs-sources.md) 保留旧场景的历史来源，不再作为自动化入口。

1. **找灵感与 review**：从知乎、微信公众号或用户提供的参考中整理候选，由用户选定要复现的动效；小红书自动化停用。
2. **分析原始证据**：使用 `$reverse-engineer-anything` 对可得源码或原始帧回放取证；GIF 解码、几何测量与观察推断分别记录，不将视频画面称为恢复的源代码。
3. **确定性重建**：在 `app/scenes/` 编写 Canvas 2D 场景，在 `app/new-scenes.js` 注册，保留按时间/state 回放、倒序拖动与减弱动态效果支持。
4. **同屏验收**：核对多个时刻的布局、色板与运动，并保留真实参考帧和测量限制。像素差不等同于感知还原度；提交、推送或发布按用户授权执行。
