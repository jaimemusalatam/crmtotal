/**
 * Node-HTTP glue: the ONLY place that touches `req` / `res`.
 * Reused by the Vite dev plugin (Connect middleware) and by server/index.js.
 *
 * To move to a serverless runtime, write a sibling adapter that converts a
 * Web `Request` into { method, subPath, readBody } and writes the returned
 * { status, headers, body } into a Web `Response` -- see server/index.js notes.
 */

import { handleTasksApi, toSubPath } from './api.js';

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

/**
 * Handles a Node request against the shared API layer and writes the response.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {object} config  Result of resolveConfig().
 * @param {object} [opts]
 * @param {boolean} [opts.stripBasePath=false] true when req.url is absolute
 *        (standalone server); false when a Connect mount already stripped it.
 */
export async function serveTasksApi(req, res, config, opts = {}) {
  const subPath = opts.stripBasePath ? toSubPath(req.url || '/') : (req.url || '/');
  const result = await handleTasksApi({
    method: req.method,
    subPath,
    readBody: () => readJsonBody(req),
    config,
  });
  res.statusCode = result.status;
  for (const [key, value] of Object.entries(result.headers)) {
    res.setHeader(key, value);
  }
  res.end(result.body);
}
