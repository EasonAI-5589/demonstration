# 新增场景的微信公众号来源

获取日期：2026-10-26。下列来源正文及原始动效已读取；文章发布日期未逐一核实。来源字段是作者归属与复现依据，不表示取得原始项目文件或媒体再授权。小红书自动化停用，旧场景来源见 [历史记录](xhs-sources.md)。

| 场景 | 作者 / 来源归属 | 原文与章节 | 参考帧 | REA 与测量记录 |
| --- | --- | --- | ---: | --- |
| 07 · 包豪斯三原色机械构成 | 田玉泽，湖北美术学院课程作品 | [《2024级艺术与科技〈开源编程基础〉课程小结》第 08 项](https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w) | 26 | [包豪斯记录](measurements/bauhaus-primary.md) |
| 08 · 翻转镜阵 | Random International（SFUED 文中归属，原始作品名待核实） | [SFUED《3分钟带你了解互动编程艺术》](https://mp.weixin.qq.com/s/h3__deLDCtVYr_IS8m_NWg) | 17 | [镜阵记录](measurements/mirror-array.md) |
| 09 · Grid Rhythm 波浪网格 | 解薇霓，湖北美术学院课程作品 | [课程小结第 03 项](https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w) | 24 | [网格记录](measurements/grid-rhythm.md) |
| 10 · 数字有机体 | 盛海波，湖北美术学院课程作品 | [课程小结第 10 项](https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w) | 24 | [有机体记录](measurements/digital-organism.md) |
| 11 · 波塞冬之声 / 音乐粒子喷泉 | 张楚宜，上海纽约大学 IMA | [《聚焦｜光影秘境 无限可能》](https://mp.weixin.qq.com/s/wyB-VpXgcPd78laDY9Tetg) | 25 | [喷泉记录](measurements/poseidon-fountain.md) |
| 12 · 图表逐笔生成 | 歸藏的 AI 工具箱，CodePilot 演示 | [《我复刻了 Claude 刚发布的生成式 UI 交互！》](https://mp.weixin.qq.com/s/3IQIs6zP5jfdTwmT5LUJ6g) | 24 | [逐笔生成记录](measurements/progressive-diagram.md) |

合计 140 张真实原始 GIF 解码参考帧。各场景的 `assets/references/<scene-id>/manifest.json` 保存原文链接、作者、原始媒体 SHA-256、尺寸、片段时长和逐张参考帧的时间戳；`frames[].src` 指向实际入库的压缩 JPG/WebP。原始大 GIF、完整浏览器采集载荷和临时分析网页保留在仓库外。

六份分析记录分别列出实际 REA Evidence IDs、受控回放或静态分析范围、像素差诊断，以及普通图像测量和观察推断的边界。原片不同时间的像素差仅说明画面发生变化，不能换算成复现还原度。摄影纹理、噪声种子、反射场和历史 UI 状态的不可恢复部分在对应记录中注明；喷泉参考 GIF 无音轨。

图表逐笔生成还使用作者链接的 [CodePilot 仓库](https://github.com/op7418/CodePilot) 做限定文件的静态分析；记录了所用提交，未声称该提交就是原 GIF 的历史版本。
