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
- [Configuración en Windows (Node.js)](#configuración-en-windows-nodejs)
- [Build y ejecución en producción](#build-y-ejecución-en-producción)
- [API](#api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura de la capa de API](#arquitectura-de-la-capa-de-api)
- [Tests](#tests)
- [Solución de problemas](#solución-de-problemas)
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

> ⚠️ El archivo **debe llamarse exactamente `.env`** (con el punto inicial). Un archivo llamado `env` **no será leído** ni por Vite (`loadEnv`) ni por el servidor de producción (`server/env.js`), y la API responderá `500` como si faltaran las credenciales.
>
> ⚠️ **Nunca** hagas commit de `.env`. Solo `.env.example` se versiona (`.env` está en `.gitignore`).

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

## Configuración en Windows (Node.js)

Si Node.js no está instalado, puedes instalarlo **sin permisos de administrador** con `winget` (a nivel de usuario):

```powershell
winget install --id OpenJS.NodeJS.LTS -e --scope user
```

Después **reinicia la terminal** para que el `PATH` se actualice y verifica:

```powershell
node -v
npm -v
```

### Wrapper del dev server (`.claude/dev.cmd`)

El proyecto incluye [`.claude/launch.json`](.claude/launch.json) para arrancar el servidor de desarrollo desde herramientas integradas. En instalaciones de Node **por usuario** (p. ej. vía `winget`), el proceso que lanza el server puede no tener Node en su `PATH`, y `npm` fallaría al invocar `node`.

Para evitarlo, `launch.json` apunta a un pequeño wrapper, [`.claude/dev.cmd`](.claude/dev.cmd), que antepone el directorio de Node al `PATH` y luego ejecuta `npm run dev`:

```bat
@echo off
set "PATH=<ruta-a-node>;%PATH%"
cd /d "%~dp0.."
call npm run dev -- --port 5173 --strictPort
```

> Si mueves o reinstalas Node, actualiza la ruta dentro de `.claude/dev.cmd` (y, si cambia el puerto, en `.claude/launch.json`). Ejecutar `npm run dev` a mano desde una terminal con Node en el `PATH` no necesita este wrapper.

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

## Solución de problemas

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `Command not found: npm` / `"node" no se reconoce…` al arrancar | Node.js no está instalado, o no está en el `PATH` del proceso que lanza el server. | Instala Node (ver [Configuración en Windows](#configuración-en-windows-nodejs)) y reinicia la terminal. Para herramientas integradas, usa el wrapper `.claude/dev.cmd`. |
| La API responde `500 { "error": "NOTION_TOKEN o NOTION_TAREAS_DATABASE_ID no configurados en .env" }` | Falta el archivo `.env`, está mal nombrado (`env` en vez de `.env`), o esas dos variables están vacías. | Asegúrate de que el archivo se llame exactamente **`.env`** y que `NOTION_TOKEN` y `NOTION_TAREAS_DATABASE_ID` tengan valor. **Reinicia** el server tras editar `.env`. |
| Cambié `.env` pero la app sigue igual | El entorno se lee **una sola vez al arrancar** (`loadEnv` en dev, `server/env.js` en prod). | Reinicia el servidor de desarrollo o el proceso de producción. |
| La API responde `502` | Error aguas arriba de Notion: token inválido, o el token no tiene compartida la base de datos consultada. | Verifica el token y **comparte** las bases (Tareas/Proyectos/Snapshots) con la integración en Notion. |
| El Dashboard muestra `0 de 0 proyectos con dato` | La base de *Snapshots Semanales de Despliegue* no tiene registros para esa semana, o `NOTION_PROYECTOS_DATABASE_ID` / `NOTION_SNAPSHOTS_DATABASE_ID` apuntan a bases que el token no ve. | Confirma los IDs de esas bases y que estén compartidas con la integración. Recuerda que proyectos y snapshots degradan a vacío si Notion falla (solo las tareas son obligatorias para un `200`). |
| `dist/ no encontrado` al hacer `npm start` | No se generó el build. | Ejecuta `npm run build` antes de `npm start`. |

---

## Integración continua (CI)

`.github/workflows/ci.yml` se ejecuta en cada `push` y `pull_request` sobre `main`:

1. **Checkout** del repo.
2. **Setup Node 20** con caché de npm.
3. **Install** reproducible: `npm ci`.
4. **Build**: `npm run build` (no requiere secretos; la API es server-side).
5. **Test**: `npm test` (Vitest sobre `server/`, sin llamadas reales a Notion).

Incluye control de concurrencia: un `push` nuevo cancela ejecuciones previas del mismo ref.
