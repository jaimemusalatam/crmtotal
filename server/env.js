/**
 * Minimal .env loader for the standalone production server (zero dependencies).
 * Vite's own `loadEnv` handles the dev path, so this is only used by server/index.js.
 *
 * - Real environment variables always win over the .env file.
 * - Values are never logged.
 */

import { readFileSync, existsSync } from 'node:fs';

function parse(contents) {
  const out = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** @returns {Record<string, string|undefined>} merged env (process.env wins). */
export function loadDotEnv(envPath) {
  const fromFile = existsSync(envPath) ? parse(readFileSync(envPath, 'utf8')) : {};
  return { ...fromFile, ...process.env };
}
