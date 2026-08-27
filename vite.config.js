import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { resolveConfig } from './server/config.js';
import { serveTasksApi } from './server/node-adapter.js';

/**
 * Adaptador delgado: solo monta el middleware en /api/tasks y delega toda la
 * logica (routing, validacion, codigos de estado, llamadas a Notion) en
 * server/api.js -> server/notion.js, que es el mismo codigo que usa el servidor
 * de produccion (server/index.js). No duplicar reglas aqui.
 */
function notionTasksApi(env) {
  const config = resolveConfig(env);
  return {
    name: 'notion-tasks-api',
    configureServer(server) {
      // Connect ya recorta el prefijo: req.url llega como '/' o '/status'.
      server.middlewares.use('/api/tasks', (req, res) => {
        serveTasksApi(req, res, config).catch((err) => {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), notionTasksApi(env)],
  };
});
