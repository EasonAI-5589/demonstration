"""Offline GIF-to-vector anchors (Pillow, NumPy, OpenCV). Raw input stays outside Git."""
import argparse
import hashlib
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image


def contour(mask):
    cs, _ = cv2.findContours(mask.astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return max(cs, key=cv2.contourArea)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('gif', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    target = root / 'assets/references/bauhaus-primary'
    target.mkdir(parents=True, exist_ok=True)
    image = Image.open(args.gif)
    samples, frames, timestamp = [], [], 0.0
    for index in range(image.n_frames):
        image.seek(index)
        rgb = image.convert('RGB')
        a = np.asarray(rgb).astype(float)
        r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
        y, x = np.indices(r.shape)
        poster = x < 500
        red = contour((r > 150) & (r > g * 1.4) & (g > 50) & (g < 145) & (b < 125) & poster & (y > 100))
        blue = contour((r > 48) & (r < 88) & (g > 112) & (g < 145) & (b > 155) & (b < 195) & poster & (y > 85))
        yellow = contour((r > 190) & (g > 140) & (b < 120) & poster & (y > 110))
        rx, _, _, _ = cv2.boundingRect(red)
        _, by, _, bh = cv2.boundingRect(blue)
        # The square sometimes occludes the triangle interior; its exterior still fits three vertices.
        _, vertices = cv2.minEnclosingTriangle(yellow)
        points = vertices.reshape(3, 2)
        edges = [np.linalg.norm(points[(i + 1) % 3] - points[i]) for i in range(3)]
        points = np.roll(points, -((int(np.argmin(edges)) + 2) % 3), axis=0)
        square_mask = (r < 48) & (g > 85) & (g < 120) & (b > 140) & (b < 185) & poster
        cs, _ = cv2.findContours(square_mask.astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        boxes = [cv2.boundingRect(c) for c in cs]
        square = next(([sx, sy] for sx, sy, sw, sh in boxes if 33 <= sw <= 39 and 33 <= sh <= 39), None)
        black = (r < 45) & (g < 45) & (b < 45)
        line_x = float(np.argmax(black[95:630, 250:480].sum(axis=0)) + 250)
        xs = np.flatnonzero(black[480, 40:455]) + 40
        runs = np.split(xs, np.where(np.diff(xs) > 1)[0] + 1)
        run = max(runs, key=len)
        samples.append({'t': round(timestamp, 5), 'redX': rx, 'blueY': round(by + bh / 2, 3),
                        'triangle': points.round(3).tolist(), 'square': square,
                        'lineX': line_x, 'barWidth': int(run[-1] - run[0] + 1)})
        if index % 3 == 0 or index == image.n_frames - 1:
            filename = f'frame-{index:03d}.webp'
            rgb.save(target / filename, 'WEBP', quality=78, method=6)
            frames.append({'time': round(timestamp, 5), 'frame': index,
                           'src': f'/assets/references/bauhaus-primary/{filename}'})
        timestamp += image.info.get('duration', 30) / 1000
    # Fill only missing square anchors, caused by overlap with similarly colored title glyphs.
    visible = [i for i, sample in enumerate(samples) if sample['square'] is not None]
    missing = [i for i, sample in enumerate(samples) if sample['square'] is None]
    coords = [np.interp(np.arange(len(samples)), visible, [samples[i]['square'][c] for i in visible]) for c in range(2)]
    for i in missing:
        samples[i]['square'] = [round(float(coords[c][i]), 3) for c in range(2)]
    track = {'sourceSha256': hashlib.sha256(args.gif.read_bytes()).hexdigest(), 'duration': round(timestamp, 5),
             'width': image.width, 'height': image.height, 'samples': samples}
    (root / 'app/scenes/bauhaus-track.js').write_text('// Measured GIF geometry; regenerate with workflow/measure-bauhaus.py.\nexport const BAUHAUS_TRACK = '
        + json.dumps(track, separators=(',', ':')) + ';\n', encoding='utf8')
    manifest = {'sourceUrl': 'https://mp.weixin.qq.com/s/GPwxuDcuAEzy8Kl_wfvc6w',
                'sourceTitle': '2024级艺术与科技《开源编程基础》课程小结 · 08', 'creator': '田玉泽',
                'width': image.width, 'height': image.height, 'duration': round(timestamp, 5), 'frames': frames,
                'sourceSha256': track['sourceSha256'], 'reconstruction': '75 measured vector anchors. Typography recreated; original code is visible as pixels only.'}
    (target / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps({'frames': image.n_frames, 'referenceFrames': len(frames), 'duration': timestamp}))


if __name__ == '__main__':
    main()
