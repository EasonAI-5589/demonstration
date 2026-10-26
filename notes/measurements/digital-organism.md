# 数字有机体 — source measurements and reconstruction

- Source: [湖北美术学院环境艺术学院HIFAEA · 2024级艺术与科技《开源编程基础》课程小结](https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w), section 10, author **盛海波**.
- Retrieved: 2026-10-26. The poster itself displays 2026年3月23日; this is an artwork date, not a verified article publication date.
- Exact downloaded GIF SHA-256: `633db149bb506ec5d194966af5da16c178b35594a7040e9b4817cd3c3f340401`.
- Observed carrier: **1080×1620**, **120 frames**, **30 ms per frame**, **3.6 s** total. The clip records growth and resets at the GIF boundary.

## Observed layout and motion

The muted green-black poster has pink headings and an outlined stage at x=72, y=254, w=936, h=728. The growing line organism is centered near (540,635). A lower-left code panel and lower-right design statement remain static. Readouts show increasing polygon side count, noise offset, and rotation. The final visible readout is approximately 120 sides, 0.88 noise, and 110° rotation.

The visible core code samples noise at cosine/sine coordinates, multiplies radius by the side count, draws a closed radial polygon, increments the side count, and advances the noise offset. The complete original code, noise seed, and rendering history are unavailable.

## Measurement method

Pink line pixels were separated from the dark stage background. At fourteen source frames, their visible radial envelope was measured in 96 angle bins around (540,635), compensating for the observed y-scale of 0.82. Missing bins were interpolated around the circular domain and lightly smoothed. The profiles are stored in `assets/references/digital-organism/motion-data.js`.

The Canvas renderer interpolates these measured vector profiles and reconstructs preceding outlines directly from elapsed time. This reproduces the observed growth silhouette and layered pink-line character without substituting the original GIF as the scene. The original random seed is not fabricated. Pointer position can add a bounded center displacement; reduced-motion mode reduces line-layer density.

## REA evidence

- Source frame browser observation: `ev_4b54f49bd7a458a6b4e3ff34ff0b00a908c9de074a849413a553012763b192f3`.
- Source temporal screenshot comparison: `ev_b1523432b6dc27c31c9ffc3d8ac91ef97bdffcd214836718af7dbf77086d97ce`.
- Canvas/source review observation: `ev_c2ff36bcfeedf13c161be0832f48cc60443378db6ba7962cdc7bbea6335b74ef`.

The source comparison measures early/late source changes, **not reconstruction similarity**. REA observed local decoded frames and the recreated scene, not the original Processing runtime.

## Limits and checks

Radial envelopes describe the visible accumulated shape; they do not recover every inner stroke or the original Perlin noise field. Inner line topology, text rendering, grain texture, and layer alpha are reconstructed design choices. The supplied excerpt is only 3.6 seconds, so longer growth behavior is not inferred.

24 compressed source JPEGs and timestamps are listed in `assets/references/digital-organism/manifest.json`. Each asset is below 2 MB. The original 29.15 MB GIF remains outside Git.

Checks: finite drawing arguments at t=0, 0.73×duration, and duration; normal and reduced-motion rendering; reverse-seek drawing-command equality. Repeat render command SHA-256 prefix: `586cd8c5870f679d`.
