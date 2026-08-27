# CRM Total

**Panel de carga y planificación** para el equipo de Musa: visualiza tareas activas, responsables, proyectos/cursos y snapshots semanales de despliegue, tomando los datos en vivo desde Notion.

Es una aplicación web de una sola página (SPA) construida con **React + Vite** en el front-end y un **servidor Node sin dependencias de runtime** que expone una pequeña API (`/api/tasks`) sobre la API de Notion. El mismo código de API se reutiliza en desarrollo (plugin de Vite) y en producción (servidor Node standalone), e incluso puede portarse a un entorno serverless sin tocar la lógica.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración del entorno (.env)](#configuración-del-entorno-env)
- [Scripts disponibles](#scripts-disponibles)
- [Desarrollo](#desarrollo)
- [Build y ejecución en producción](#build-y-ejecución-en-producción)
- [API](#api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura de la capa de API](#arquitectura-de-la-capa-de-api)
- [Tests](#tests)
- [Integración continua (CI)](#integración-continua-ci)

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Front-end | React 18 + Vite 5 |
| Estilos | Tailwind CSS 4 (vía PostCSS) |
| Servidor | Node ≥ 18 (`node:http`, `fetch` global), sin dependencias de runtime |
| Datos | API de Notion (versión `2022-06-28`) |
| Tests | Vitest 4 (entorno `node`) |
| Tipografías | Manrope + JetBrains Mono (Google Fonts, con fallback local) |

---

## Requisitos

- **Node.js ≥ 18** (declarado en `package.json` → `engines`). El servidor usa `fetch` global y módulos `node:`, disponibles a partir de Node 18. El CI usa Node 20.
- **npm** (el proyecto incluye `package-lock.json`; usa `npm ci` para instalaciones reproducibles).
- Una **integración interna de Notion** con acceso a las bases de datos correspondientes (ver más abajo).

---

## Instalación

```bash
npm install
```

Luego copia el archivo de ejemplo de variables de entorno y rellénalo:

```bash
cp .env.example .env
```

> ⚠️ **Nunca** hagas commit de `.env`. Solo `.env.example` se versiona.

---

## Configuración del entorno (.env)

El servidor lee **únicamente variables sin prefijo `VITE_`**. Esto es intencional: Vite inyecta cualquier variable `VITE_*` en el bundle del **cliente**, por lo que un secreto con ese prefijo quedaría expuesto públicamente. Todos los secretos viven server-side.

### Requeridas por la app web

| Variable | Propósito | ¿Requerida? |
| --- | --- | --- |
| `NOTION_TOKEN` | Token de la integración interna de Notion (**secreto**). | ✅ Sí |
| `NOTION_TAREAS_DATABASE_ID` | Base de "Tareas" que alimenta `GET /api/tasks`. | ✅ Sí |
| `NOTION_PROYECTOS_DATABASE_ID` | Base "Proyectos y Cursos". Tiene *fallback* en `server/config.js` si se deja vacía. | ⚪ Opcional |
| `NOTION_SNAPSHOTS_DATABASE_ID` | Base "Snapshots Semanales de Despliegue". Tiene *fallback* si se deja vacía. | ⚪ Opcional |

Si faltan `NOTION_TOKEN` o `NOTION_TAREAS_DATABASE_ID`, la API responde `500` con el mensaje `NOTION_TOKEN o NOTION_TAREAS_DATABASE_ID no configurados en .env`.

> Los IDs de bases de datos de Notion **no son secretos**; por eso `NOTION_PROYECTOS_DATABASE_ID` y `NOTION_SNAPSHOTS_DATABASE_ID` traen valores reales por defecto en `.env.example` y como fallback en el código.

### Servidor de producción

| Variable | Propósito | Default |
| --- | --- | --- |
| `PORT` | Puerto del servidor standalone (`server/index.js`). | `4173` |
| `HOST` | Host de escucha. | `0.0.0.0` |

### Definidas pero sin consumidores en la app web

Estas variables aparecen en `.env.example` para scripts/herramientas fuera de la app web (o uso futuro). **La aplicación web no las utiliza actualmente**:

`NOTION_DATABASE_ID`, `NOTION_TICKETS_DATABASE_ID`, `PERSONA_NOMBRE`, `PERSONA_ID`, `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_OAUTH_REDIRECT_URI`, `COSTOS_PIN`, `DB_PATH`.

> Nota: `.env.example` describe `COSTOS_PIN` como "PIN para la vista de costos" y `DB_PATH` como "ruta del archivo de base de datos local". No se detectan consumidores de estas variables en el código de la app web del repositorio; trátalas como reservadas para herramientas externas.

---

## Scripts disponibles

Derivados de `package.json` → `scripts`:

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm run dev` | `vite` | Servidor de desarrollo de Vite con HMR y el middleware `/api/tasks` montado. |
| `npm run build` | `vite build` | Compila el front-end a `dist/`. |
| `npm run preview` | `vite preview` | Previsualiza localmente el build de `dist/` (servidor estático de Vite). |
| `npm start` | `node server/index.js` | Servidor Node de producción: sirve `dist/` + la API. Requiere haber corrido `npm run build` antes. |
| `npm test` | `vitest run` | Ejecuta la suite de tests una vez (sin modo watch). |

---

## Desarrollo

```bash
npm run dev
```

En desarrollo, `vite.config.js` monta un plugin (`notion-tasks-api`) que expone `/api/tasks` a través de **exactamente la misma capa de API** que usa producción (`server/api.js` → `server/notion.js`). No hay lógica de rutas duplicada: el front-end habla con `/api/tasks` igual en dev y en prod.

El punto de entrada del front-end es `index.html` → `src/main.jsx`, que renderiza el componente `src/carga-responsables.jsx`.

---

## Build y ejecución en producción

```bash
npm run build
npm start            # PORT por defecto: 4173
# o bien:
PORT=8080 npm start
```

El servidor `server/index.js`:

1. Sirve los archivos estáticos de `dist/` (con *SPA fallback* a `index.html` para que el routing del cliente siga funcionando).
2. Monta las **mismas** rutas de API que el servidor de desarrollo.
3. No tiene dependencias de runtime: solo módulos `node:` + `fetch` global (Node ≥ 18).

Al arrancar, registra en consola el puerto, si `dist/` existe y si las variables clave de Notion están presentes — **nunca imprime valores de secretos**, solo si están definidos o no. Si `dist/` no existe, responde `404` pidiendo ejecutar `npm run build`.

---

## API

Base path: **`/api/tasks`**. Todas las respuestas son JSON.

| Método | Ruta | Propósito | Respuesta OK |
| --- | --- | --- | --- |
| `GET` | `/api/tasks` | Devuelve las tareas activas (Status ≠ `Done` y ≠ `Stand by`) más los proyectos con sus snapshots semanales. | `200 { tasks, projects }` |
| `POST` | `/api/tasks/status` | Actualiza el Status de una tarea en Notion. Body: `{ pageId, status }`. | `200 { ok: true }` |

### Códigos de error

| Código | Cuándo |
| --- | --- |
| `500` | Configuración incompleta (falta `NOTION_TOKEN` o `NOTION_TAREAS_DATABASE_ID`). Cuerpo: `{ error }`. |
| `502` | Error de validación o error aguas arriba desde Notion. Cuerpo: `{ error }`. |
| `405` | Ruta conocida con método no permitido (incluye cabecera `Allow`). Cuerpo: `{ error }`. |
| `404` | Ruta desconocida bajo `/api/tasks`. Cuerpo: `{ error }`. |

> El contrato debe permanecer *byte-compatible* con el front-end. La forma exacta de las respuestas y errores vive en un único lugar: `server/api.js`.

### Notas sobre los datos (`server/notion.js`)

- **Tareas**: se consultan solo las activas (`Status != Done` y `!= Stand by`) y se mapean a un shape compacto (`t` título, `r` responsables, `p` proyecto, `c` en curso, `v` vencimiento, `e` esfuerzo, `status`, etc.).
- **Proyectos** y **snapshots**: si Notion falla, degradan a vacío en lugar de romper la respuesta (resiliencia intencional) — solo las tareas son estrictamente necesarias para un `200`.
- `POST /api/tasks/status` exige `pageId` y `status`; si falta alguno, lanza error (→ `502`).

---

## Estructura del proyecto

```
crmtotal/
├─ index.html                  # HTML raíz de la SPA (carga src/main.jsx)
├─ vite.config.js              # Config de Vite + plugin que monta /api/tasks en dev
├─ vitest.config.js            # Config de tests (separada de vite.config.js a propósito)
├─ postcss.config.js           # Tailwind CSS vía PostCSS
├─ .env.example                # Plantilla de variables de entorno
├─ src/
│  ├─ main.jsx                 # Punto de entrada React (monta <Carga />)
│  ├─ carga-responsables.jsx   # Componente principal (panel de carga/planificación)
│  └─ index.css                # Estilos (Tailwind + fallbacks de tipografía)
└─ server/
   ├─ index.js                 # Servidor de producción standalone (sirve dist/ + API)
   ├─ api.js                   # Routing/validación/errores de /api/tasks (agnóstico de transporte)
   ├─ notion.js                # Capa de datos de Notion (funciones puras, solo fetch)
   ├─ config.js                # resolveConfig() + fallbacks de IDs de bases
   ├─ env.js                   # Cargador mínimo de .env (solo para el server de prod)
   ├─ node-adapter.js          # Único punto que toca req/res de node:http
   └─ *.test.js                # Tests de Vitest (api, config, notion)
```

---

## Arquitectura de la capa de API

El diseño separa la lógica del transporte para poder reutilizarla en dev, producción y (opcionalmente) serverless:

- **`server/notion.js`** — Núcleo portable: funciones puras que solo usan `fetch`. No conocen `req`/`res` ni ningún runtime.
- **`server/api.js`** — Routing, validación, códigos de estado y forma de errores. Tampoco importa `node:http`. Aquí vive el contrato con el front-end, en un solo lugar.
- **`server/node-adapter.js`** — El **único** archivo que toca `req`/`res` de `node:http`. Lo reutilizan tanto el plugin de Vite como el servidor de producción.

Para desplegar en Vercel / Netlify / Cloudflare Workers basta con escribir un adaptador hermano que traduzca `Request`/`Response` de la Web a `{ method, subPath, readBody }` → `{ status, headers, body }`, sin cambiar nada de `notion.js` ni `api.js` (ver el bloque de notas al inicio de `server/index.js`).

---

## Tests

```bash
npm test
```

- Motor: **Vitest** en entorno `node`.
- Patrón de inclusión: `server/**/*.test.js`, `src/**/*.test.js`, `test/**/*.test.js`.
- Los tests apuntan a los módulos ESM de `server/` (con `fetch` mockeado, **sin** llamadas reales a Notion).
- `vitest.config.js` se mantiene aparte de `vite.config.js` a propósito: el test no necesita el middleware de Notion ni `loadEnv()`.

Tests presentes: `server/api.test.js`, `server/config.test.js`, `server/notion.test.js`.

---

## Integración continua (CI)

`.github/workflows/ci.yml` se ejecuta en cada `push` y `pull_request` sobre `main`:

1. **Checkout** del repo.
2. **Setup Node 20** con caché de npm.
3. **Install** reproducible: `npm ci`.
4. **Build**: `npm run build` (no requiere secretos; la API es server-side).
5. **Test**: `npm test` (Vitest sobre `server/`, sin llamadas reales a Notion).

Incluye control de concurrencia: un `push` nuevo cancela ejecuciones previas del mismo ref.
