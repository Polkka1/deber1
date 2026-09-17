# Gestor de Tareas

Aplicación web full-stack para gestionar tareas personales: crear, listar, editar, marcar como completadas y eliminar.

| Parte | Tecnología | Despliegue |
| --- | --- | --- |
| Frontend | React 19 + TypeScript + Vite | Vercel |
| Backend | Express 5 + TypeScript + Zod | Vercel (función serverless) |
| Base de datos | Supabase (PostgreSQL) | Supabase Cloud |

**Demo en producción**

- Frontend: https://client-ashen-alpha-26.vercel.app
- API: https://server-nine-steel-29.vercel.app/api/tasks (estado: [/api/health](https://server-nine-steel-29.vercel.app/api/health))

---

## Funcionalidades

- **CRUD completo** de tareas contra una API REST propia.
- Tarea con título, descripción, prioridad (baja/media/alta), fecha límite y estado completado.
- Marcar como completada/pendiente, edición en línea y confirmación antes de eliminar.
- Filtros: todas, pendientes, completadas. Aviso visual de tareas vencidas.
- **Estados de red explícitos**: spinner de carga, mensaje de error con botón *Reintentar*, avisos de éxito/error y bloqueo de controles mientras una petición está en curso.
- **TypeScript estricto sin `any`** en frontend y backend; las respuestas de la API se validan en tiempo de ejecución con *type guards*.

## Arquitectura

```text
Navegador (React)  ──fetch──▶  API Express (/api/tasks)  ──supabase-js──▶  Supabase Postgres
  VITE_API_URL                  SUPABASE_URL + SECRET_KEY                   tabla tasks (RLS)
```

La tabla tiene *Row Level Security* activado sin políticas públicas: solo el backend (con la *secret key*) puede leer y escribir. El frontend nunca ve credenciales de la base de datos.

## Estructura del repositorio

```text
.
├── db/
│   └── schema.sql            # Tabla tasks, trigger updated_at, RLS y datos de ejemplo
├── server/                   # API REST
│   ├── src/
│   │   ├── index.ts          # App Express (export default → Vercel)
│   │   ├── local.ts          # app.listen() para desarrollo local
│   │   ├── routes/tasks.ts   # Endpoints CRUD
│   │   ├── validation/       # Esquemas Zod
│   │   ├── middleware/       # 404 y manejo de errores en JSON
│   │   ├── lib/              # Cliente Supabase, HttpError
│   │   └── types/            # Task, Database, ApiSuccess, ApiError
│   └── .env.example
└── client/                   # Frontend React
    ├── src/
    │   ├── api/              # Cliente HTTP, type guards, tasksApi
    │   ├── hooks/useTasks.ts # Estado de la lista y operaciones CRUD
    │   ├── components/       # TaskForm, TaskList, TaskItem, TaskFilters, Toast, Spinner
    │   ├── types/            # Task, RequestState, MutationResult...
    │   └── utils/
    └── .env.example
```

## API REST

URL base: `http://localhost:3000` en local o la URL de Vercel del backend.

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | `{ status, database }` |
| `GET` | `/api/tasks` | — | `200 { data: Task[] }` |
| `GET` | `/api/tasks/:id` | — | `200 { data: Task }` · `404` |
| `POST` | `/api/tasks` | `{ title, description?, priority?, due_date? }` | `201 { data: Task }` · `400` |
| `PUT` | `/api/tasks/:id` | Cualquier campo de la tarea, incluido `completed` | `200 { data: Task }` · `400` · `404` |
| `DELETE` | `/api/tasks/:id` | — | `200 { data: { id } }` · `404` |

Los errores siempre tienen la forma `{ "error": { "message": "...", "details": ["..."] } }`.

---

## Instalación y ejecución local

### Requisitos

- Node.js 22 o superior (probado con Node 24)
- Una cuenta gratuita de [Supabase](https://supabase.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Polkka1/deber1.git
cd deber1
```

### 2. Crear la base de datos en Supabase

1. En [supabase.com/dashboard](https://supabase.com/dashboard) crea un proyecto nuevo.
2. Abre **SQL Editor → New query**, pega el contenido de [`db/schema.sql`](db/schema.sql) y pulsa **Run**.
3. Copia estos dos valores:
   - **Project URL** (Project Settings → Data API), p. ej. `https://abcd1234.supabase.co`
   - **Secret key** (Project Settings → API Keys → *Secret keys*, empieza por `sb_secret_`)

### 3. Backend

```bash
cd server
npm install
cp .env.example .env     # en PowerShell: Copy-Item .env.example .env
```

Completa `server/.env`:

```env
SUPABASE_URL=https://abcd1234.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
CLIENT_ORIGIN=http://localhost:5173
PORT=3000
```

```bash
npm run dev              # http://localhost:3000/api/tasks
```

### 4. Frontend

En otra terminal:

```bash
cd client
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173
```

### Scripts útiles

| Carpeta | Comando | Qué hace |
| --- | --- | --- |
| `server` | `npm run dev` | API con recarga automática |
| `server` | `npm run typecheck` | Verifica tipos con `tsc` |
| `client` | `npm run dev` | Servidor de desarrollo de Vite |
| `client` | `npm run build` | Verifica tipos y genera `dist/` |
| `client` | `npm run lint` | Linter (prohíbe `any`) |

---

## Despliegue en producción (Vercel)

Se crean **dos proyectos de Vercel** a partir del mismo repositorio, cada uno con un *Root Directory* distinto.

### Backend

1. Vercel → **Add New… → Project** → importa el repositorio.
2. **Root Directory:** `server` · **Framework Preset:** `Express` (verifícalo: con *Other* el deploy termina pero responde 404).
3. **Environment Variables:**
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `CLIENT_ORIGIN` → de momento `*`; después, la URL del frontend
4. **Deploy** y comprueba `https://server-nine-steel-29.vercel.app/api/health`.

### Frontend

1. **Add New… → Project** → mismo repositorio.
2. **Root Directory:** `client` · **Framework Preset:** Vite.
3. **Environment Variables:** `VITE_API_URL` = `https://server-nine-steel-29.vercel.app` (sin `/` al final).
4. **Deploy**.

### Cerrar CORS

En el proyecto del backend cambia `CLIENT_ORIGIN` a `https://client-ashen-alpha-26.vercel.app` y vuelve a desplegar (**Deployments → ⋯ → Redeploy**).

> Las variables `VITE_*` se incrustan al compilar: si cambias `VITE_API_URL` hay que volver a desplegar el frontend.

---

## Flujo de trabajo con Git

- `main` está protegida: los cambios entran mediante Pull Request.
- Una rama por funcionalidad: `feature/db-schema`, `feature/backend-api`, `feature/frontend-ui`, `docs/readme`...
- Mensajes de commit con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat`, `fix`, `chore`, `docs`.
