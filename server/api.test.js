import { describe, it, expect, vi, afterEach } from 'vitest';
import { API_BASE_PATH, toSubPath, handleTasksApi } from './api.js';

const COMPLETE_CONFIG = {
  token: 'secret',
  tasksDbId: 'tasks-db',
  projectsDbId: 'projects-db',
  snapshotsDbId: 'snapshots-db',
};

const emptyBody = async () => ({});

describe('toSubPath', () => {
  it('maps the bare API base path to "/"', () => {
    expect(toSubPath(API_BASE_PATH)).toBe('/');
  });

  it('strips the base path prefix, keeping the remainder', () => {
    expect(toSubPath(`${API_BASE_PATH}/status`)).toBe('/status');
  });

  it('preserves query strings and hashes past the prefix (normalization happens elsewhere)', () => {
    expect(toSubPath(`${API_BASE_PATH}/status?x=1`)).toBe('/status?x=1');
    expect(toSubPath(`${API_BASE_PATH}/status#frag`)).toBe('/status#frag');
  });

  it('returns "/" for a base-path-only URL with a trailing slash removed by the slice (empty remainder)', () => {
    // API_BASE_PATH + '/' -> slice gives '/', not '' -- covered by the other branch,
    // but an exact-equal base path with no trailing content must yield '/'.
    expect(toSubPath(`${API_BASE_PATH}`)).toBe('/');
  });

  it('passes through unrelated / unknown urls unchanged (no prefix match)', () => {
    expect(toSubPath('/totally/unrelated')).toBe('/totally/unrelated');
  });

  it('defaults to "/" when called with no argument', () => {
    expect(toSubPath()).toBe('/');
  });

  it('returns the empty string unchanged for an empty string input (default param does not apply)', () => {
    // The `url = '/'` default only kicks in for `undefined`, not for an
    // explicit ''. '' fails both the equality and startsWith checks, so it
    // falls through to "return url" and comes back as ''. Documents the
    // actual (perhaps surprising) behavior rather than the "/" one might expect.
    expect(toSubPath('')).toBe('');
  });
});

describe('handleTasksApi: config gate', () => {
  it('returns 500 with MISSING_CONFIG_MESSAGE when config is incomplete, before any routing', async () => {
    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/does-not-exist',
      readBody: emptyBody,
      config: {},
    });
    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toMatch(/NOTION_TOKEN/);
  });
});

describe('handleTasksApi: routing', () => {
  it('returns 404 for an unknown sub-path', async () => {
    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/nope',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toContain('/api/tasks/nope');
  });

  it('normalizes query string / trailing slash / hash on a known path before routing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], has_more: false }),
    }));
    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/?foo=bar',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(200);
  });

  it('returns 405 with an Allow header for a known path used with the wrong method', async () => {
    const res = await handleTasksApi({
      method: 'DELETE',
      subPath: '/',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(405);
    expect(res.headers.Allow).toBe('GET, HEAD');
    const body = JSON.parse(res.body);
    expect(body.error).toContain('DELETE');
  });

  it('returns 405 with the /status Allow list when GET is used on /status', async () => {
    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/status',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });
});

describe('handleTasksApi: GET / (tasks payload)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 200 with the { tasks, projects } payload on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], has_more: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ tasks: [], projects: [] });
    expect(fetchMock).toHaveBeenCalled();
  });

  it('returns 502 when the upstream Notion call fails (network/HTTP error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom from notion',
    }));

    const res = await handleTasksApi({
      method: 'GET',
      subPath: '/',
      readBody: emptyBody,
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(502);
    const body = JSON.parse(res.body);
    expect(body.error).toMatch(/Notion API 500/);
  });
});

describe('handleTasksApi: POST /status (update task status)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 200 { ok: true } on a successful status update', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await handleTasksApi({
      method: 'POST',
      subPath: '/status',
      readBody: async () => ({ pageId: 'page-1', status: 'Done' }),
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });

  it('returns 502 when pageId/status are missing from the body (validation error surfaces as upstream error)', async () => {
    const res = await handleTasksApi({
      method: 'POST',
      subPath: '/status',
      readBody: async () => ({}),
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(502);
    const body = JSON.parse(res.body);
    expect(body.error).toMatch(/pageId y status son requeridos/);
  });

  it('returns 502 when the upstream PATCH call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'page not found',
    }));

    const res = await handleTasksApi({
      method: 'POST',
      subPath: '/status',
      readBody: async () => ({ pageId: 'missing', status: 'Done' }),
      config: COMPLETE_CONFIG,
    });
    expect(res.status).toBe(502);
    const body = JSON.parse(res.body);
    expect(body.error).toMatch(/Notion API 404/);
  });
});
