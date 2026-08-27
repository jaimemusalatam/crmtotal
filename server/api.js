/**
 * Transport-agnostic routing / validation / error-shape layer for `/api/tasks`.
 *
 * It knows nothing about Node's `http`, Vite or any serverless runtime: it takes
 * a plain descriptor of the request and returns a plain descriptor of the
 * response. Both entry points (vite.config.js dev plugin and server/index.js)
 * reuse this, so the contract exists in exactly one place.
 *
 * Contract (must stay byte-compatible with the frontend):
 *   GET  /api/tasks         -> 200 { tasks, projects }
 *   POST /api/tasks/status  -> 200 { ok: true }        body { pageId, status }
 *   missing config          -> 500 { error }
 *   upstream/validation err -> 502 { error }
 *   known path, bad method  -> 405 { error }  + Allow
 *   unknown path            -> 404 { error }
 */

import { getTasksPayload, updateTaskStatus } from './notion.js';
import { isConfigComplete, MISSING_CONFIG_MESSAGE } from './config.js';

export const API_BASE_PATH = '/api/tasks';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Methods accepted per sub-path. Anything else on a known path is a 405. */
const ALLOWED = {
  '/': ['GET', 'HEAD'],
  '/status': ['POST'],
};

function json(status, payload, extraHeaders) {
  const headers = extraHeaders ? { ...JSON_HEADERS, ...extraHeaders } : JSON_HEADERS;
  return { status, headers, body: JSON.stringify(payload) };
}

/** Turns an absolute request url into the sub-path the router expects. */
export function toSubPath(url = '/') {
  if (url === API_BASE_PATH) return '/';
  if (url.startsWith(API_BASE_PATH)) return url.slice(API_BASE_PATH.length) || '/';
  return url;
}

/**
 * Drops the query string / hash and any trailing slash, so `/status?x=1`,
 * `/status/` and `/status` all route the same. Keeps '/' itself intact.
 */
function normalizeSubPath(subPath) {
  const bare = String(subPath || '/').split(/[?#]/)[0];
  const trimmed = bare.length > 1 ? bare.replace(/\/+$/, '') : bare;
  return trimmed || '/';
}

/**
 * @param {object} args
 * @param {string} args.method            HTTP method.
 * @param {string} args.subPath           Path relative to /api/tasks ('/' or '/status').
 * @param {() => Promise<object>} args.readBody  Lazy JSON body reader.
 * @param {object} args.config            Result of resolveConfig().
 * @returns {Promise<{status:number, headers:Record<string,string>, body:string}>}
 */
export async function handleTasksApi({ method, subPath, readBody, config }) {
  if (!isConfigComplete(config)) {
    return json(500, { error: MISSING_CONFIG_MESSAGE });
  }

  const path = normalizeSubPath(subPath);
  const allowed = ALLOWED[path];

  if (!allowed) {
    return json(404, { error: `No existe ${method} ${API_BASE_PATH}${path === '/' ? '' : path}` });
  }
  if (!allowed.includes(method)) {
    return json(405, { error: `Metodo ${method} no permitido en ${API_BASE_PATH}${path === '/' ? '' : path}` },
      { Allow: allowed.join(', ') });
  }

  if (path === '/status') {
    try {
      const { pageId, status } = await readBody();
      const result = await updateTaskStatus({ token: config.token, pageId, status });
      return json(200, result);
    } catch (err) {
      return json(502, { error: String(err.message || err) });
    }
  }

  try {
    const payload = await getTasksPayload(config);
    return json(200, payload);
  } catch (err) {
    return json(502, { error: String(err.message || err) });
  }
}
