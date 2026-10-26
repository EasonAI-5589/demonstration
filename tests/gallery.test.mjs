import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createLabServer, projectRoot } from '../server.mjs';
import { referenceRun, stateAt } from '../app/spider/model.js';
import { ReaDecompilerScene } from '../app/scenes/rea-decompiler.js';
import { KesslerOrbitalScene } from '../app/scenes/kessler-orbital.js';
import { StanfordTorusScene } from '../app/scenes/stanford-torus.js';
import { SubsTeardownScene } from '../app/scenes/subs-teardown.js';
import { JevIsometricScene } from '../app/scenes/jev-isometric.js';
import { NEW_SCENES, nearestReferenceFrame } from '../app/new-scenes.js';

function createMockCtx() {
  return new Proxy(
    {
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'left',
      globalAlpha: 1,
      shadowBlur: 0,
      shadowColor: '',
      lineJoin: 'round',
      measureText: str => ({ width: String(str).length * 7.2 }),
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop() {} }),
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return () => {};
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    }
  );
}

test('Legacy scene renderers do not throw across timeline timestamps', () => {
  const inetText = fs.readFileSync(path.join(projectRoot, 'app/spider/inferencenet-prompt.txt'), 'utf8');
  const run = referenceRun(inetText, { preset: 'inferencenet' });
  assert.equal(run.total, 195);
  assert.equal(run.decisions.length, 175);
  const stMid = stateAt(run, 10.5, { preset: 'inferencenet' });
  assert.ok(stMid.decisions.length > 40);

  const scenes = [
    new ReaDecompilerScene(),
    new KesslerOrbitalScene(),
    new StanfordTorusScene(),
    new SubsTeardownScene(),
    new JevIsometricScene(),
  ];

  for (const scene of scenes) {
    assert.ok(scene.duration >= 18);
    for (const t of [0, 3.5, 11.2, scene.duration]) {
      const ctx = createMockCtx();
      scene.render(ctx, { elapsed: t, duration: scene.duration, reducedMotion: false });
      scene.render(ctx, { elapsed: t, duration: scene.duration, reducedMotion: true });
    }
  }
});

test('Server serves gallery index, status endpoint, and reference keyframes safely', async () => {
  const server = createLabServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const statusRes = await fetch(`http://127.0.0.1:${port}/status`);
    assert.equal(statusRes.status, 200);
    const status = await statusRes.json();
    assert.equal(status.scenes, 17);
    assert.equal(status.presets, 18);

    const indexRes = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(indexRes.status, 200);
    const html = await indexRes.text();
    assert.match(html, /DEMONSTRATION/);

    const refRes = await fetch(`http://127.0.0.1:${port}/assets/references/02-rea-decompiler.jpg`);
    assert.equal(refRes.status, 200);
    await refRes.arrayBuffer();

    const traversal = await fetch(`http://127.0.0.1:${port}/../AGENTS.md`);
    assert.equal(traversal.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
