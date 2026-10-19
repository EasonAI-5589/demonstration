#!/usr/bin/env node
/**
 * Cyber Motion Lab — Evidence Extractor (Human -> REA / Frame -> Canvas Spec)
 *
 * Usage:
 *   node workflow/extract-evidence.mjs --image <path> --id <scene-id>
 *   node workflow/extract-evidence.mjs --video <mp4-path> --id <scene-id> [--fps 0.5]
 *   node workflow/extract-evidence.mjs --bundle <url-or-dir> --id <scene-id>
 *   node workflow/extract-evidence.mjs --audit-references
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF_DIR = path.join(ROOT, 'assets', 'references');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--audit-references') out.audit = true;
    else if (a.startsWith('--') && i + 1 < argv.length) out[a.slice(2)] = argv[++i];
  }
  return out;
}

function sampleImageStats(imgPath) {
  const py = `
import subprocess, sys, json
p = sys.argv[1]
out = subprocess.check_output(["sips", "-g", "pixelWidth", "-g", "pixelHeight", "-g", "format", p], text=True)
info = {"file": p.split("/")[-1], "bytes": __import__("os").path.getsize(p)}
for line in out.splitlines():
    if ":" in line:
        k, v = [x.strip() for x in line.split(":", 1)]
        if k in ("pixelWidth", "pixelHeight"):
            info[k] = int(v)
        elif k == "format":
            info[k] = v
print(json.dumps(info))
`;
  return JSON.parse(execFileSync('python3', ['-c', py, imgPath], { encoding: 'utf8' }).trim());
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Cyber Motion Lab — Evidence Extractor
Workflow:
  1. Human discovers viral motion UI on Xiaohongshu / X / Web
  2. Extract frames, dimensions & REA bundle graph:
     node workflow/extract-evidence.mjs --video <path.mp4> --id <scene-id>
     node workflow/extract-evidence.mjs --bundle <url-or-dir> --id <scene-id>
     node workflow/extract-evidence.mjs --audit-references
  3. Implement deterministic Canvas 2D scene in app/scenes/<scene-id>.js
  4. Verify side-by-side at http://127.0.0.1:4318/?scene=<scene-id>&compare=1`);
    return;
  }

  if (args.bundle) {
    console.log(`[REA] Running static bundle analysis on ${args.bundle}...`);
    const out = execFileSync('rea', ['analyze-web-bundle', args.bundle, '--json'], { encoding: 'utf8' });
    const target = path.join(REF_DIR, `${args.id || 'bundle'}-rea.json`);
    fs.writeFileSync(target, out);
    console.log(`[REA] Saved evidence to ${target}`);
    return;
  }

  if (args.video && args.id) {
    const outImg = path.join(REF_DIR, `${args.id}.jpg`);
    execFileSync('ffmpeg', ['-y', '-ss', args.ss || '4', '-i', args.video, '-frames:v', '1', '-q:v', '4', outImg], { stdio: 'ignore' });
    console.log(`[Frame] Extracted reference keyframe -> ${outImg}`, sampleImageStats(outImg));
    return;
  }

  // Default / --audit-references: audit all reference images in assets/references/
  const files = fs.readdirSync(REF_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
  const manifest = files.map(f => sampleImageStats(path.join(REF_DIR, f)));
  fs.writeFileSync(path.join(REF_DIR, 'evidence-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Audited ${manifest.length} reference keyframes in assets/references/evidence-manifest.json`);
}

main();
