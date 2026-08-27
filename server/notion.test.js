import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapTaskPage, getTasksPayload, updateTaskStatus } from './notion.js';

function basePage(overrides = {}) {
  return {
    id: 'page-id-1',
    properties: {
      Tarea: { type: 'title', title: [{ plain_text: 'Hacer la cosa' }] },
      Status: { type: 'status', status: { name: 'In Progress' } },
      'Proyectos y cursos': { type: 'formula', formula: { type: 'string', string: 'Proyecto X' } },
      'Fecha de Vencimiento': { type: 'date', date: { start: '2026-08-01', end: '2026-08-10' } },
      'Esfuerzo (1 menos- 5 más)': { type: 'number', number: 4 },
      Responsables: {
        type: 'people',
        people: [{ name: ' Ana ' }, { name: 'Beto' }, { name: null }],
      },
      '\u{1F680} Proyectos y Cursos': { type: 'relation', relation: [{ id: 'proj-rel-1' }] },
    },
    ...overrides,
  };
}

describe('mapTaskPage', () => {
  it('maps a realistic, fully-populated Notion page to the compact frontend shape', () => {
    const page = basePage();
    const projectsById = { 'proj-rel-1': 'En curso' };
    const task = mapTaskPage(page, 5, projectsById);

    expect(task).toEqual({
      id: 5,
      pageId: 'page-id-1',
      t: 'Hacer la cosa',
      r: ['Ana', 'Beto'],
      p: 'Proyecto X',
      c: 1,
      v: '2026-08-10',
      vi: '2026-08-01',
      e: 4,
      status: 'In Progress',
      pe: 'En curso',
    });
  });

  it('sets c=1 only when Status is exactly "in progress" (case-insensitive), 0 for anything else', () => {
    const inProgress = mapTaskPage(basePage(), 0, {});
    expect(inProgress.c).toBe(1);

    const notStarted = mapTaskPage(
      basePage({ properties: { ...basePage().properties, Status: { type: 'status', status: { name: 'Not started' } } } }),
      0,
      {}
    );
    expect(notStarted.c).toBe(0);

    const upperCase = mapTaskPage(
      basePage({ properties: { ...basePage().properties, Status: { type: 'status', status: { name: 'IN PROGRESS' } } } }),
      0,
      {}
    );
    expect(upperCase.c).toBe(1);
  });

  it('falls back to a generated title "tarea-{idx}" when Tarea/title is missing', () => {
    const page = basePage();
    delete page.properties.Tarea;
    const task = mapTaskPage(page, 7, {});
    expect(task.t).toBe('tarea-7');
  });

  it('defaults effort (e) to 2 when the effort property is missing or not a number', () => {
    const page = basePage();
    delete page.properties['Esfuerzo (1 menos- 5 más)'];
    expect(mapTaskPage(page, 0, {}).e).toBe(2);

    const pageWithNullEffort = basePage({
      properties: { ...basePage().properties, 'Esfuerzo (1 menos- 5 más)': { type: 'number', number: null } },
    });
    expect(mapTaskPage(pageWithNullEffort, 0, {}).e).toBe(2);
  });

  it('preserves an explicit effort of 0 (falsy but a valid number, not defaulted to 2)', () => {
    const page = basePage({
      properties: { ...basePage().properties, 'Esfuerzo (1 menos- 5 más)': { type: 'number', number: 0 } },
    });
    expect(mapTaskPage(page, 0, {}).e).toBe(0);
  });

  it('defaults status to "Not started" when Status is missing, and c stays 0', () => {
    const page = basePage();
    delete page.properties.Status;
    const task = mapTaskPage(page, 0, {});
    expect(task.status).toBe('Not started');
    expect(task.c).toBe(0);
  });

  it('sets vi (inicio) to the date start and v (due) to the date end when both are present', () => {
    const task = mapTaskPage(basePage(), 0, {});
    expect(task.vi).toBe('2026-08-01');
    expect(task.v).toBe('2026-08-10');
  });

  it('falls back v to the date start when there is no end date (single-day due date)', () => {
    const page = basePage({
      properties: {
        ...basePage().properties,
        'Fecha de Vencimiento': { type: 'date', date: { start: '2026-08-01', end: null } },
      },
    });
    const task = mapTaskPage(page, 0, {});
    expect(task.vi).toBe('2026-08-01');
    expect(task.v).toBe('2026-08-01');
  });

  it('sets vi and v to null when there is no date property at all', () => {
    const page = basePage();
    delete page.properties['Fecha de Vencimiento'];
    const task = mapTaskPage(page, 0, {});
    expect(task.vi).toBeNull();
    expect(task.v).toBeNull();
  });

  it('finds the people property by type=="people" regardless of its display name, and drops blank/whitespace names', () => {
    const page = basePage({
      properties: {
        ...basePage().properties,
        Responsables: undefined,
        'Cualquier Nombre De Columna': {
          type: 'people',
          people: [{ name: 'Solo Uno' }, { name: '   ' }, {}],
        },
      },
    });
    delete page.properties.Responsables;
    const task = mapTaskPage(page, 0, {});
    expect(task.r).toEqual(['Solo Uno']);
  });

  it('returns an empty responsables array when no people-typed property exists', () => {
    const page = basePage();
    delete page.properties.Responsables;
    const task = mapTaskPage(page, 0, {});
    expect(task.r).toEqual([]);
  });

  it('resolves estadoMacro (pe) via the project relation id looked up in projectsById', () => {
    const task = mapTaskPage(basePage(), 0, { 'proj-rel-1': 'Saludable' });
    expect(task.pe).toBe('Saludable');
  });

  it('sets estadoMacro (pe) to null when the relation id is not found in projectsById', () => {
    const task = mapTaskPage(basePage(), 0, {});
    expect(task.pe).toBeNull();
  });

  it('sets estadoMacro (pe) to null when there is no project relation at all', () => {
    const page = basePage();
    delete page.properties['\u{1F680} Proyectos y Cursos'];
    const task = mapTaskPage(page, 0, { 'proj-rel-1': 'Saludable' });
    expect(task.pe).toBeNull();
  });

  it('handles a minimal/empty page (no properties object) without throwing', () => {
    const task = mapTaskPage({ id: 'bare', properties: {} }, 3, {});
    expect(task).toEqual({
      id: 3,
      pageId: 'bare',
      t: 'tarea-3',
      r: [],
      p: null,
      c: 0,
      v: null,
      vi: null,
      e: 2,
      status: 'Not started',
      pe: null,
    });
  });

  it('handles a page object with no `properties` key at all', () => {
    const task = mapTaskPage({ id: 'no-props' }, 1, {});
    expect(task.t).toBe('tarea-1');
    expect(task.r).toEqual([]);
  });
});

describe('getTasksPayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps tasks and degrades projects/snapshots to empty when those upstream calls fail', async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes('tasks-db')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [basePage({ id: 'p1' })],
            has_more: false,
          }),
        });
      }
      // projects and snapshots dbs both fail upstream
      return Promise.resolve({ ok: false, status: 503, text: async () => 'unavailable' });
    });
    vi.stubGlobal('fetch', fetchMock);

    const payload = await getTasksPayload({
      token: 'tok',
      tasksDbId: 'tasks-db',
      projectsDbId: 'projects-db',
      snapshotsDbId: 'snapshots-db',
    });

    expect(payload.projects).toEqual([]);
    expect(payload.tasks).toHaveLength(1);
    expect(payload.tasks[0].pageId).toBe('p1');
  });

  it('rejects the whole payload when the tasks fetch itself fails (not degraded, unlike projects/snapshots)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'tasks db down',
    }));

    await expect(
      getTasksPayload({ token: 'tok', tasksDbId: 'tasks-db', projectsDbId: 'p', snapshotsDbId: 's' })
    ).rejects.toThrow(/Notion API 500/);
  });
});

describe('updateTaskStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws without calling fetch when pageId is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(updateTaskStatus({ token: 't', status: 'Done' })).rejects.toThrow(
      /pageId y status son requeridos/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws without calling fetch when status is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(updateTaskStatus({ token: 't', pageId: 'p1' })).rejects.toThrow(
      /pageId y status son requeridos/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('PATCHes the page status and returns { ok: true } on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await updateTaskStatus({ token: 't', pageId: 'p1', status: 'Done' });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.notion.com/v1/pages/p1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('throws a decorated error when the upstream PATCH fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    }));
    await expect(updateTaskStatus({ token: 't', pageId: 'p1', status: 'Done' })).rejects.toThrow(
      /Notion API 400/
    );
  });
});
