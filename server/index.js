/**
 * Production entry point: standalone Node HTTP server.
 *
 *   npm run build && npm start          # PORT defaults to 4173
 *   PORT=8080 npm start
 *
 * Responsibilities:
 *   1. Serve the Vite build output in dist/ as static files (SPA fallback to
 *      index.html so client routing keeps working).
 *   2. Mount the SAME two API routes the dev server exposes, through the shared
 *      layer in server/api.js. No route logic is duplicated here.
 *
 * Zero runtime dependencies: only node: builtins + global fetch (Node >= 18).
 *
 * ---------------------------------------------------------------------------
 * Swapping in a serverless adapter later
 * ---------------------------------------------------------------------------
 * The portable core is server/notion.js (pure data functions) + server/api.js
 * (routing, validation, status codes, error shape). Neither imports node:http.
 * To deploy on Vercel / Netlify / Cloudflare instead of this server, add a
 * function handler that only translates the platform's request/response types:
 *
 *   // api/tasks/[[...path]].js  (Vercel / Netlify / Workers style)
 *   import { handleTasksApi, toSubPath } from '../../server/api.js';
 *   import { resolveConfig } from '../../server/config.js';
 *
 *   export default async function handler(request) {
 *     const url = new URL(request.url);
 *     const result = await handleTasksApi({
 *       method: request.method,
 *       subPath: toSubPath(url.pathname),
 *       readBody: () => request.json(),
 *       config: resolveConfig(process.env),   // or `env` on Workers
 *     });
 *     return new Response(result.body, { status: result.status, headers: result.headers });
 *   }
 *
 * Static hosting is then handled by the platform's CDN and this file becomes
 * unnecessary. Nothing in server/notion.js or server/api.js changes.
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { API_BASE_PATH } from './api.js';
import { resolveConfig } from './config.js';
import { loadDotEnv } from './env.js';
import { serveTasksApi } from './node-adapter.js';

const projectRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const distDir = join(projectRoot, 'dist');
const env = loadDotEnv(join(projectRoot, '.env'));
const config = resolveConfig(env);
const port = Number(env.PORT || process.env.PORT || 4173);
const host = env.HOST || process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function sendFile(res, filePath, { immutable = false } = {}) {
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  res.setHeader(
    'Cache-Control',
    immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  );
  createReadStream(filePath).on('error', () => {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }).pipe(res);
}

/** Resolves a url pathname to a file inside dist/, blocking path traversal. */
function resolveStatic(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname.split('?')[0]); }
  catch { return null; }
  const candidate = resolve(distDir, '.' + normalize(decoded).replace(/\\/g, '/'));
  if (candidate !== distDir && !candidate.startsWith(distDir + (process.platform === 'win32' ? '\\' : '/'))) {
    return null;
  }
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return null;
}

const server = createServer(async (req, res) => {
  const url = req.url || '/';
  const pathname = url.split('?')[0];

  if (pathname === API_BASE_PATH || pathname.startsWith(API_BASE_PATH + '/')) {
    try {
      await serveTasksApi(req, res, config, { stripBasePath: true });
    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const file = resolveStatic(pathname);
  if (file) {
    sendFile(res, file, { immutable: pathname.startsWith('/assets/') });
    return;
  }

  // SPA fallback.
  const indexHtml = join(distDir, 'index.html');
  if (existsSync(indexHtml)) {
    sendFile(res, indexHtml);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('dist/ no encontrado. Ejecuta `npm run build` antes de `npm start`.');
});

server.listen(port, host, () => {
  // Never log secret values -- only whether they are present.
  console.log(`[crmtotal] servidor en http://localhost:${port}`);
  console.log(`[crmtotal] dist: ${existsSync(distDir) ? 'ok' : 'FALTA (npm run build)'}`);
  console.log(`[crmtotal] NOTION_TOKEN: ${config.token ? 'set' : 'MISSING'} | NOTION_TAREAS_DATABASE_ID: ${config.tasksDbId ? 'set' : 'MISSING'}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
