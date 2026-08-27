import { describe, it, expect } from 'vitest';
import {
  resolveConfig,
  isConfigComplete,
  DEFAULT_PROJECTS_DB_ID,
  DEFAULT_SNAPSHOTS_DB_ID,
  MISSING_CONFIG_MESSAGE,
} from './config.js';

describe('resolveConfig', () => {
  it('reads token and tasksDbId straight from env with no fallback', () => {
    const config = resolveConfig({
      NOTION_TOKEN: 'secret_abc',
      NOTION_TAREAS_DATABASE_ID: 'tasks-db-1',
    });
    expect(config.token).toBe('secret_abc');
    expect(config.tasksDbId).toBe('tasks-db-1');
  });

  it('falls back to the documented default project/snapshot DB ids when unset', () => {
    const config = resolveConfig({});
    expect(config.projectsDbId).toBe(DEFAULT_PROJECTS_DB_ID);
    expect(config.snapshotsDbId).toBe(DEFAULT_SNAPSHOTS_DB_ID);
    expect(config.token).toBeUndefined();
    expect(config.tasksDbId).toBeUndefined();
  });

  it('prefers explicit env project/snapshot ids over the defaults', () => {
    const config = resolveConfig({
      NOTION_PROYECTOS_DATABASE_ID: 'custom-projects',
      NOTION_SNAPSHOTS_DATABASE_ID: 'custom-snapshots',
    });
    expect(config.projectsDbId).toBe('custom-projects');
    expect(config.snapshotsDbId).toBe('custom-snapshots');
  });

  it('defaults to an empty env object when called with no argument', () => {
    const config = resolveConfig();
    expect(config.projectsDbId).toBe(DEFAULT_PROJECTS_DB_ID);
    expect(config.snapshotsDbId).toBe(DEFAULT_SNAPSHOTS_DB_ID);
  });

  it('treats an empty-string env var as "unset" only where falsy checks apply (documents current behavior)', () => {
    // NOTE: `env.NOTION_PROYECTOS_DATABASE_ID || DEFAULT` means an explicit
    // empty string in the environment silently falls back to the default
    // rather than being treated as "explicitly blank". This is existing,
    // intentional-looking behavior -- documented here, not asserted as a bug.
    const config = resolveConfig({ NOTION_PROYECTOS_DATABASE_ID: '' });
    expect(config.projectsDbId).toBe(DEFAULT_PROJECTS_DB_ID);
  });
});

describe('isConfigComplete', () => {
  it('is true only when both token and tasksDbId are present', () => {
    expect(isConfigComplete({ token: 't', tasksDbId: 'd' })).toBe(true);
  });

  it('is false when token is missing', () => {
    expect(isConfigComplete({ tasksDbId: 'd' })).toBe(false);
  });

  it('is false when tasksDbId is missing', () => {
    expect(isConfigComplete({ token: 't' })).toBe(false);
  });

  it('is false for an empty-string token (falsy, not just undefined)', () => {
    expect(isConfigComplete({ token: '', tasksDbId: 'd' })).toBe(false);
  });

  it('is false for undefined / null config', () => {
    expect(isConfigComplete(undefined)).toBe(false);
    expect(isConfigComplete(null)).toBe(false);
  });

  it('exposes a stable, human-readable MISSING_CONFIG_MESSAGE', () => {
    expect(MISSING_CONFIG_MESSAGE).toMatch(/NOTION_TOKEN/);
    expect(MISSING_CONFIG_MESSAGE).toMatch(/NOTION_TAREAS_DATABASE_ID/);
  });
});
