/**
 * Runtime-agnostic Notion data layer.
 *
 * Rules for this file:
 *  - No Vite, Express, node:http or any transport import.
 *  - No `req` / `res`. Functions take plain config objects and return plain data.
 *  - Only global `fetch` (Node 18+, Deno, Bun, Cloudflare Workers, Vercel Edge).
 *
 * This makes the same code usable from the Vite dev middleware, the standalone
 * Node server (server/index.js) or any serverless adapter.
 */

const NOTION_VERSION = '2022-06-28';

function notionHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function notionFetch(url, token, init) {
  const res = await fetch(url, { ...init, headers: notionHeaders(token) });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  return res;
}

/** Base "Proyectos y Cursos" - trae TODOS los proyectos (activos o no) con su Estado Macro real. */
export async function fetchProjects(token, projectsDbId) {
  const byId = {};
  const list = [];
  let cursor;
  do {
    const res = await notionFetch(`https://api.notion.com/v1/databases/${projectsDbId}/query`, token, {
      method: 'POST',
      body: JSON.stringify({ start_cursor: cursor }),
    });
    const json = await res.json();
    for (const page of json.results || []) {
      const props = page.properties || {};
      const estado = props['Estado Macro']?.select?.name || null;
      const name = props['Nombre del proyecto']?.title?.[0]?.plain_text || null;
      byId[page.id] = estado;
      const licenciasContratadas = props['Licencias Contratadas']?.number ?? null;
      const estudiantesRegistrados = props['\u{1F465} Estudiantes Registrados']?.rollup?.number ?? null;
      const pctLogroFrac = props['\u{1F3AF} % Logro de Meta Estudiantes']?.formula?.number ?? null;
      const esMensual = props['Es licencias mensuales?']?.select?.name || null;
      const tiempoEstadoMacro = props['Tiempo en el estado Macro']?.formula?.string || null;
      const estadoRevisado = props['Estado revisado']?.select?.name || null;
      if (name) {
        list.push({
          id: page.id,
          name,
          estado: estado || null,
          licenciasContratadas,
          estudiantesRegistrados,
          pctLicencia: licenciasContratadas != null ? Math.round((pctLogroFrac || 0) * 100) : null,
          esMensual,
          tiempoEstadoMacro,
          estadoRevisado,
        });
      }
    }
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return { byId, list };
}

/** Base "Snapshots Semanales de Despliegue" - un registro por proyecto por semana (Fecha de Corte). */
export async function fetchWeeklySnapshots(token, snapshotsDbId) {
  const byProjectId = {};
  let cursor;
  do {
    const res = await notionFetch(`https://api.notion.com/v1/databases/${snapshotsDbId}/query`, token, {
      method: 'POST',
      body: JSON.stringify({ start_cursor: cursor, page_size: 100 }),
    });
    const json = await res.json();
    for (const page of json.results || []) {
      const props = page.properties || {};
      const projectId = props['\u{1F680} Proyectos y Cursos']?.relation?.[0]?.id || null;
      if (!projectId) continue;
      const fecha = props['Fecha de Corte']?.date?.start || null;
      const nombreCampana = props['Nombre de la campaña']?.title?.[0]?.plain_text || null;
      const estudiantesSemana = props['Estudiantes Activos (semana)']?.number ?? null;
      const licTiempo = props['Meta licencias /tiempo']?.rollup?.array?.[0]?.formula?.number ?? null;
      const licenciaVsMeta = props['Licencia VS meta semanal']?.formula?.number ?? null;
      const estudiantesAcumulado = props['Estudiantes (acumulado)']?.number ?? null;
      const pctFinAcumulado = props['% Finalización (acumulado)']?.number ?? null;
      const pctFinSemanal = props['% Finalización (semanal)']?.number ?? null;
      const nps = props['NPS (acumulado)']?.number ?? null;
      const logroAprendizaje = props['Logro de aprendizaje (acumulado)']?.number ?? null;
      const notifSemana = props['# notificaciones en la semana']?.number ?? null;
      (byProjectId[projectId] = byProjectId[projectId] || []).push({
        fecha, nombreCampana, estudiantesSemana, licTiempo, licenciaVsMeta,
        estudiantesAcumulado, pctFinAcumulado, pctFinSemanal, nps, logroAprendizaje, notifSemana,
      });
    }
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  for (const id in byProjectId) {
    byProjectId[id].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }
  return byProjectId;
}

/** Base de Tareas - solo tareas activas (Status != Done y != Stand by). */
export async function fetchActiveTaskPages(token, tasksDbId) {
  const acc = [];
  let cursor;
  do {
    const res = await notionFetch(`https://api.notion.com/v1/databases/${tasksDbId}/query`, token, {
      method: 'POST',
      body: JSON.stringify({
        start_cursor: cursor,
        filter: {
          and: [
            { property: 'Status', status: { does_not_equal: 'Done' } },
            { property: 'Status', status: { does_not_equal: 'Stand by' } },
          ],
        },
      }),
    });
    const json = await res.json();
    acc.push(...(json.results || []));
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return acc;
}

/** Mapea una pagina de Notion al shape compacto que consume el frontend. */
export function mapTaskPage(page, idx, projectsById) {
  const props = page.properties || {};
  const title = props.Tarea?.title?.[0]?.plain_text || `tarea-${idx}`;
  const status = props.Status?.status?.name || '';
  const project = props['Proyectos y cursos']?.formula?.string || null;
  const vencDate = props['Fecha de Vencimiento']?.date || null;
  const inicio = vencDate?.start || null;
  const due = vencDate?.end || vencDate?.start || null;
  const effort = props['Esfuerzo (1 menos- 5 más)']?.number;
  const responsablesProp = Object.values(props).find((p) => p.type === 'people');
  const responsables = (responsablesProp?.people || [])
    .map((p) => p.name?.trim())
    .filter(Boolean);
  const projectRelId = props['\u{1F680} Proyectos y Cursos']?.relation?.[0]?.id || null;
  const estadoMacro = projectRelId ? projectsById[projectRelId] || null : null;
  return {
    id: idx,
    pageId: page.id,
    t: title,
    r: responsables,
    p: project,
    c: status.toLowerCase() === 'in progress' ? 1 : 0,
    v: due,
    vi: inicio,
    e: typeof effort === 'number' ? effort : 2,
    status: status || 'Not started',
    pe: estadoMacro,
  };
}

/**
 * Payload de `GET /api/tasks` -> `{ tasks, projects }`.
 * Proyectos y snapshots degradan a vacio si Notion falla (resiliencia original).
 */
export async function getTasksPayload({ token, tasksDbId, projectsDbId, snapshotsDbId }) {
  const [pages, projects, weeklySnapshots] = await Promise.all([
    fetchActiveTaskPages(token, tasksDbId),
    fetchProjects(token, projectsDbId).catch(() => ({ byId: {}, list: [] })),
    fetchWeeklySnapshots(token, snapshotsDbId).catch(() => ({})),
  ]);

  for (const project of projects.list) {
    project.snapshots = weeklySnapshots[project.id] || [];
  }

  const tasks = pages.map((page, idx) => mapTaskPage(page, idx, projects.byId));
  return { tasks, projects: projects.list };
}

/** Payload de `POST /api/tasks/status` -> `{ ok: true }`. */
export async function updateTaskStatus({ token, pageId, status }) {
  if (!pageId || !status) throw new Error('pageId y status son requeridos');
  await notionFetch(`https://api.notion.com/v1/pages/${pageId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ properties: { Status: { status: { name: status } } } }),
  });
  return { ok: true };
}
