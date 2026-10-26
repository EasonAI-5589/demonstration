# Grid Rhythm — source measurements and reconstruction

- Source: [湖北美术学院环境艺术学院HIFAEA · 2024级艺术与科技《开源编程基础》课程小结](https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w), section 03, author **解薇霓**.
- Retrieved: 2026-10-26. The article publication date is not established by the visible class-year title.
- Exact downloaded GIF SHA-256: `c6f3568b9521a3faaf0a3d30c6904f8275d371bf3d2bb25f311116324349c870`.
- Observed carrier: **1080×1620**, **62 frames**, **20 ms per frame**, **1.24 s** total. The available clip is short and does not establish a seamless full animation cycle.

## Observed layout and motion

The portrait poster contains a 20×20 colored square grid at roughly x=60–560, y=297–790. Its white grid anchors visibly deform around the recorded pointer region. The upper-left title card is x=54, y=54, w=508, h=208. The right column contains parameter, effect, and reflection cards at x≈675; the lower-left column shows code and attribution. These poster regions remain visible during the animation.

The visible source code describes sinusoidal grid waves, a pointer interaction radius of 80 logical pixels, and a decay factor of 0.95. The complete original application and exact pointer event log were not supplied by the GIF.

## Measurement method

White marker components were detected in the source grid crop. 394 markers were recovered in the final frame. A 400-node array was initialized by matching the visible markers to the observed grid; six missing/occluded final anchors use an inferred position. Optical flow tracked the markers backward through the recording, with a bounded snap to nearby observed white markers. Twenty-one time samples are stored in `assets/references/grid-rhythm/motion-data.js` at quarter-pixel precision. Per-node colors were sampled from source squares in the final frame.

The renderer draws native Canvas rectangles, white anchors, and mesh connections using interpolated measured coordinates. It does not display the reference frames in place of the recreated effect. A stateless pointer repulsion can be added over the recorded field; reduced-motion mode damps displacement.

## REA evidence

- Source frame browser observation: `ev_4b54f49bd7a458a6b4e3ff34ff0b00a908c9de074a849413a553012763b192f3`.
- Source temporal screenshot comparison: `ev_b1523432b6dc27c31c9ffc3d8ac91ef97bdffcd214836718af7dbf77086d97ce`.
- Canvas/source review observation: `ev_c2ff36bcfeedf13c161be0832f48cc60443378db6ba7962cdc7bbea6335b74ef`.

The source comparison measures a change between early and late source frames. Its changed-pixel ratio is **not a reconstruction accuracy score**. REA observed the decoded local source frames; it did not recover or execute the author's Processing application.

## Limits and checks

Occluded anchors can exchange identity, so mesh topology in the most compressed pointer region is approximate. Source colors are sampled once and the exact original color evolution is unknown. Typography and attribution layout are redrawn; the student identifier is not copied into the reconstruction.

24 compressed source JPEGs and their source-time positions are listed in `assets/references/grid-rhythm/manifest.json`. Each asset is below 2 MB. The original 12.96 MB GIF remains outside Git.

Checks: finite drawing arguments at t=0, 0.73×duration, and duration; normal and reduced-motion rendering; reverse-seek drawing-command equality. Repeat render command SHA-256 prefix: `4b9808d90b68dcc5`.
