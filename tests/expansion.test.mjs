import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { projectRoot } from '../server.mjs';
import { NEW_SCENES, nearestReferenceFrame } from '../app/new-scenes.js';

function recordingContext(width, height) {
  const calls = [];
  const finite = value => {
    if (typeof value === 'number') assert.ok(Number.isFinite(value), 'Canvas coordinates must be finite');
    if (Array.isArray(value)) value.forEach(finite);
  };
  const ctx = new Proxy({ canvas: { width, height }, measureText: text => ({ width: String(text).length * 7.2 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) }, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => { args.forEach(finite); calls.push([key, ...args]); };
    },
    set(target, key, value) { finite(value); target[key] = value; calls.push(['set', key, value]); return true; },
  });
  return { ctx, calls };
}

test('Additions expose attributed original frames and registered navigation', () => {
  assert.equal(Object.keys(NEW_SCENES).length, 11);
  const html = fs.readFileSync(path.join(projectRoot, 'app/index.html'), 'utf8');
  for (const [id, config] of Object.entries(NEW_SCENES)) {
    assert.match(html, new RegExp(`data-scene="${id}"`));
    assert.ok(config.width > 0 && config.height > 0 && config.duration > 0);
    const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, config.refManifest), 'utf8'));
    assert.ok(manifest.sourceUrl.startsWith(id.startsWith('ewm-') ? 'https://adamleopold.github.io/ewm-challenge/' : 'https://mp.weixin.qq.com/'));
    assert.ok(manifest.frames.length >= 2);
    let previous = -1;
    for (const frame of manifest.frames) {
      assert.ok(Number.isFinite(frame.time) && frame.time >= previous);
      previous = frame.time;
      assert.ok(frame.src.startsWith(`/assets/references/${id}/`));
      const file = fs.statSync(path.join(projectRoot, frame.src));
      assert.ok(file.size > 0 && file.size < 2 * 1024 * 1024);
    }
  }
});

test('Drawing stays finite and repeats after reverse seek for every new scene', () => {
  for (const [id, config] of Object.entries(NEW_SCENES)) {
    const renderAt = (time, reducedMotion = false) => {
      const trace = recordingContext(config.width, config.height);
      config.instance.render(trace.ctx, { elapsed: time, duration: config.duration, reducedMotion, playing: false, pointer: null });
      assert.ok(trace.calls.length > 20);
      return JSON.stringify(trace.calls);
    };
    const start = renderAt(0), middle = renderAt(config.duration * 0.41);
    renderAt(config.duration);
    renderAt(config.duration * 0.83, true);
    assert.equal(renderAt(0), start, `${id}: retained future state after reverse seek`);
    assert.equal(renderAt(config.duration * 0.41), middle, `${id}: timestamp changed its drawing`);
    assert.notEqual(middle, start, `${id}: elapsed time must affect drawing`);
  }
});

test('Reference lookup clamps endpoints and selects the nearest original timestamp', () => {
  const frames = [{ time: 0, src: 'a' }, { time: 0.3, src: 'b' }, { time: 0.6, src: 'c' }];
  assert.equal(nearestReferenceFrame(frames, -1).src, 'a');
  assert.equal(nearestReferenceFrame(frames, 0.4).src, 'b');
  assert.equal(nearestReferenceFrame(frames, 100).src, 'c');
  assert.equal(nearestReferenceFrame([], 0), null);
});
