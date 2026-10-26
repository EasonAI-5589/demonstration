import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const within = (base, filename) => {
  const rel = path.relative(base, filename);
  return rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
};

export async function serveStatic(req, res, { root = projectRoot } = {}) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(p => p === '..')) {
      throw new Error('Invalid path');
    }
  } catch {
    res.writeHead(400).end('Invalid path');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  if (pathname === '/status') {
    res.setHeader('Content-Type', types['.json']);
    res.end(JSON.stringify({ application: 'demonstration', scenes: 12, presets: 13 }));
    return;
  }

  let base;
  let filename;
  if (pathname.startsWith('/assets/references/')) {
    base = path.join(root, 'assets', 'references');
    filename = path.resolve(base, '.' + pathname.slice('/assets/references'.length));
  } else {
    base = path.join(root, 'app');
    filename = path.resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
  }

  if (!within(base, filename) || !types[path.extname(filename)]) {
    res.writeHead(404).end('Not found');
    return;
  }

  try {
    const [realBase, realFile] = await Promise.all([realpath(base), realpath(filename)]);
    if (!within(realBase, realFile) || !(await stat(realFile)).isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(realFile);
    res.once('close', () => stream.destroy());
    stream.once('error', () => res.destroy());
    stream.pipe(res);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') res.writeHead(404).end('Not found');
    else throw err;
  }
}

export function createLabServer({ root = projectRoot } = {}) {
  return http.createServer((req, res) => {
    serveStatic(req, res, { root }).catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end('Server error');
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4318);
  const server = createLabServer();
  server.on('error', err => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${port} is busy.` : err.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Demonstration → http://127.0.0.1:${server.address().port}\n12 Scenes · 13 Presets · Synchronized Reference Inspector`);
  });
}
