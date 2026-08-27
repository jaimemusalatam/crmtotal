import { defineConfig } from 'vitest/config';

/**
 * Standalone Vitest config (kept separate from vite.config.js on purpose):
 * the app's vite.config.js wires up the Notion dev-server middleware and
 * loadEnv(), neither of which the test run needs or should depend on.
 * Tests target plain Node ESM modules under server/ (and, once exported,
 * pure helpers under src/).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.js', 'src/**/*.test.js', 'test/**/*.test.js'],
  },
});
