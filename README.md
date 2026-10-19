# Cyber Motion Lab · 赛博遥测与动态可视化复刻实验室

一个基于 **「人找灵感 → REA 拆帧/逆向测量 → 原生 Canvas 2D 确定性重建 → Emil 动效手感打磨 → 左右同屏对比验收」** 闭环工作流的交互式可视化画廊。

**零前端框架依赖（Pure ES Modules + HTML5 Canvas 2D）**，支持时间轴任意拖拽回放、速度调节（0.5×–4×）、全屏沉浸模式，以及一键开启 **「左：复刻交互 Canvas · 右：原片参考关键帧」** 同屏对比验收。

---

## 已收录的 6 大交互式可视化场景（7 种预设）

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
git clone https://github.com/EasonAI-5589/cyber-motion-lab.git
cd cyber-motion-lab
npm start
```

浏览器打开 **http://127.0.0.1:4318** ：
- 顶部导航栏一键切换 **01–06 全部场景**；
- 点击右上角 **「原片对比」** 按钮可同屏展开小红书原帖关键帧与复刻参数对比；
- 快捷键：`Space` 播放/暂停，`R` 重播，`C` 切换原片对比，`F` 全屏沉浸，`←` / `→` 逐帧微调时间轴。

---

## 内置复刻工作流（Human → REA → Canvas → Emil Polish）

详见 [`AGENTS.md`](AGENTS.md) 与 [`notes/xhs-sources.md`](notes/xhs-sources.md)：

1. **人找灵感（Human Discovery）**：在小红书点赞/收藏目标动效笔记，通过 `$xiaohongshu-local` 安全提取笔记元数据与参考帧；
2. **证据提取（`workflow/extract-evidence.mjs` + `$reverse-engineer-anything`）**：自动抽帧、提取主色板（Hex Palette）、测量面板网格坐标与时间轴状态跳变点；
3. **确定性重建与动效打磨（`$animate` + `$emil-design-eng`）**：在 `app/scenes/` 下编写纯函数式 Canvas 2D 渲染器，确保任意时间点 $t$ 可逆拖拽；
4. **同屏验收（Side-by-Side Verification）**：开启画廊内置的「原片对比」抽屉，核对布局、色板、数值演进与帧率预算。
