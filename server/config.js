/**
 * Config resolution shared by every entry point (Vite dev plugin, standalone
 * Node server, future serverless adapter).
 *
 * Only UNPREFIXED variables are read. Never use `VITE_`-prefixed names for
 * secrets: Vite inlines those into the client bundle.
 */

// Los IDs de base de datos NO son secretos: se documentan como fallback para
// que la app siga funcionando sin configuracion extra.
export const DEFAULT_PROJECTS_DB_ID = '2e8b1371-59c9-80c4-9ee8-f4ecebb90ee2';
export const DEFAULT_SNAPSHOTS_DB_ID = '2ebb1371-59c9-806a-86a6-c1d61d3265f0';

export const MISSING_CONFIG_MESSAGE =
  'NOTION_TOKEN o NOTION_TAREAS_DATABASE_ID no configurados en .env';

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{ token?: string, tasksDbId?: string, projectsDbId: string, snapshotsDbId: string }}
 */
export function resolveConfig(env = {}) {
  return {
    token: env.NOTION_TOKEN,
    tasksDbId: env.NOTION_TAREAS_DATABASE_ID,
    projectsDbId: env.NOTION_PROYECTOS_DATABASE_ID || DEFAULT_PROJECTS_DB_ID,
    snapshotsDbId: env.NOTION_SNAPSHOTS_DATABASE_ID || DEFAULT_SNAPSHOTS_DB_ID,
  };
}

export function isConfigComplete(config) {
  return Boolean(config?.token && config?.tasksDbId);
}
