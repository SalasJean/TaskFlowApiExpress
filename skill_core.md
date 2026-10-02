# skill_core.md — Documento maestro de TaskFlow API

> **Propósito:** este archivo es la **fuente de verdad** del miniproyecto. Aquí queda
> documentado *qué* construimos, *cómo* lo construimos (arquitectura) y *en qué orden*
> (sprints). Se actualiza a medida que avanzamos: es un documento vivo, no un plan
> congelado.
>
> **Regla de uso:** antes de empezar cualquier sesión, leemos este archivo. Si algo
> cambia respecto a lo aquí escrito, **primero actualizamos este documento** y luego
> programamos.

- **Proyecto:** TaskFlow API
- **Ubicación:** `learn-express/taskflow-api/`
- **Stack base:** Node.js 22 LTS (gestionado con `mise`) + Express 5 · PostgreSQL + Prisma · Docker Compose
- **Testing:** Vitest + Supertest
- **Cliente SQL:** `pgcli` (tú, en la terminal)
- **Metodología:** aprendizaje hands-on, incremental, un bloque/sprint a la vez.

---

## 1. Objetivo de aprendizaje

Construir una **API REST de dificultad media** aplicando **arquitectura por capas**,
para aprender a escribir software **mantenible**: cada responsabilidad en su lugar,
fácil de testear, cambiar y extender.

No buscamos la app más grande, sino la **estructura más sana**.

---

## 2. El proyecto elegido

| Opción | Dominio | Dificultad | Estado |
|---|---|---|---|
| **A. TaskFlow API (tareas ↔ proyectos ↔ usuarios)** | gestión de tareas | Media | ⭐ **Elegida** |
| B. Biblioteca (libros, socios, préstamos) | reglas de negocio ricas | Media | Alternativa |
| C. Blog (posts, autores, comentarios) | relaciones/contenido | Media-baja | Alternativa |

**Por qué la A:** cubre CRUD, usuarios, autenticación, relaciones, permisos,
filtros y paginación sin volverse un sistema enorme. Es el "sweet spot" de
aprendizaje.

**Dominio funcional (visión):** usuarios crean **proyectos**, cada proyecto agrupa
**tareas**, y cada usuario solo puede operar sobre sus propios recursos.

---

## 3. Arquitectura objetivo (por capas)

```mermaid
graph TD
    R[Request HTTP] --> RT[routes<br/>define endpoints]
    RT --> C[controllers<br/>req/res, sin lógica]
    C --> S[services<br/>reglas de negocio]
    S --> RP[repositories<br/>acceso a datos]
    RP --> DB[(Base de datos)]
    C --> V[validators]
    S --> E[AppError + errorHandler]
```

**Reglas de oro (no negociables):**

1. Cada capa **solo** habla con la de al lado.
2. El **controller nunca** toca la base de datos.
3. El **service nunca** toca `req`/`res` (no conoce HTTP).
4. El **repository** es el **único** que conoce la base de datos.
5. La lógica de negocio vive en **services**, no en routes/controllers.

**Responsabilidad de cada capa:**

| Capa | Hace | NO hace |
|---|---|---|
| `routes/` | declara endpoints, los apunta a un controller | lógica, validación |
| `controllers/` | lee `req`, llama al service, responde con `res` | reglas de negocio, DB |
| `services/` | reglas de negocio y orquestación | `req`/`res`, SQL |
| `repositories/` | acceso a datos (CRUD sobre la DB) | reglas de negocio |
| `middlewares/` | auth, errores, validación transversal | lógica de dominio |

---

## 4. Estructura de carpetas meta

```
taskflow-api/
├── src/
│   ├── config/          # env, conexión a DB
│   ├── routes/          # solo define rutas -> controller
│   ├── controllers/     # orquesta req/res
│   ├── services/        # lógica de negocio
│   ├── repositories/    # acceso a datos
│   ├── middlewares/     # auth, errores, validación
│   ├── models/          # esquemas / entidades
│   ├── errors/          # AppError
│   ├── utils/
│   ├── app.js           # configura express (NO levanta el puerto)
│   └── server.js        # levanta el puerto
├── tests/               # unitarios e integración
├── .env                 # variables de entorno (no se commitea)
├── .env.example         # plantilla de variables (sí se commitea)
├── .gitignore
├── package.json
└── skill_core.md        # este documento
```

> El patrón `app.js` (configura) separado de `server.js` (levanta) ya lo dominas
> del `bloque-01`, y se mantiene igual aquí.

---

## 5. Stack de datos y estrategia de aprendizaje

**Decisión:** PostgreSQL 17 (en Docker) + `pgcli` para practicar SQL + **Prisma** como ORM.

### 5.1 La cadena de herramientas

| Herramienta | Rol | Quién la usa |
|---|---|---|
| `pgcli` | cliente SQL de terminal (como `psql`, con autocompletado y colores) | tú, para experimentar |
| PostgreSQL 17 (Docker) | el motor de base de datos | infra |
| `pg` (node-postgres) | driver nativo → SQL crudo desde Node | primer repository |
| Prisma | ORM: modelos, migraciones, type-safety | repository final |

### 5.2 ¿SQL crudo o Prisma primero? → SQL primero

Decisión pedagógica clave del proyecto:

| Enfoque | Qué interiorizas |
|---|---|
| SQL a mano con `pgcli` / `pg` | `SELECT`, `JOIN`, `WHERE`, índices, transacciones: el lenguaje real |
| Prisma | cómo una abstracción **genera** ese SQL y te da productividad |

**Razón:** Prisma *genera* SQL. Si no sabes SQL, no entiendes qué ejecuta tu app, no
puedes depurar una consulta lenta ni diseñar un esquema sano. Aprender el fundamento
primero convierte el ORM en una *comodidad* y no en una *caja negra*.

Por eso el repositorio se implementa **dos veces** (ver Sprint 2): SQL crudo → luego
Prisma. Como `repositories/` aísla el acceso a datos, ese cambio **no toca** `services/`
ni `controllers/` — comprobarás en vivo para qué sirve esa capa.

> `pgcli` es solo un cliente: no cambia la base de datos, es nuestra ventana para experimentar.

### 5.3 Docker para la base de datos

Sí, usaremos **Docker Compose**. El nombre recomendado del archivo hoy es
**`compose.yaml`** (plugin v2 `docker compose`). `docker-compose.yml` pertenece al
binario antiguo v1 (`docker-compose`), ya en desuso. Cualquiera de
`compose.yaml` / `compose.yml` sirve con el v2.

- **Alcance ahora:** en desarrollo solo metemos **PostgreSQL** en el contenedor; la app
  corre con `npm run dev` en tu máquina. Dockerizaremos la app en el Sprint 8.

`compose.yaml` (ejemplo):

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: taskflow-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: taskflow
      POSTGRES_DB: taskflow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Y en `.env` (no se commitea; el `.env.example` sí):

```
DATABASE_URL="postgresql://taskflow:taskflow@localhost:5432/taskflow"
```

El **volumen** `pgdata` es lo que hace que tus datos sobrevivan a `docker compose down`.

---

## 6. Roadmap de Sprints (escalonado, uno a la vez)

> **No se avanza al siguiente sprint hasta cumplir el "Definition of Done" (DoD)**
> del actual. Un bloque temático a la vez, en orden, sin saltar.
>
> **Estados:** ⬜ pendiente · 🟡 en progreso · ✅ completado

| # | Sprint | Aprendes | Entregable | Estado |
|---|---|---|---|---|
| 0 | Fundaciones | setup, scripts, env, git, Docker | server con `/health` + Postgres arriba | ✅ |
| 1 | CRUD por capas (en memoria) | routes/controller/service/repo | CRUD de `tareas` | ✅ |
| 2 | Persistencia real | SQL crudo + Prisma | datos que sobreviven reinicio | 🟡 |
| 3 | Validación y errores | zod, AppError, errorHandler | 400/500 consistentes | ⬜ |
| 4 | Auth y autorización | bcrypt, JWT, middlewares | rutas protegidas + ownership | ⬜ |
| 5 | Relaciones y reglas | joins, filtros, paginación | tareas ↔ proyectos ↔ usuarios | ⬜ |
| 6 | Testing | jest/vitest + supertest | suite verde | ⬜ |
| 7 | Calidad y observabilidad | eslint, logs, helmet, Swagger | docs navegables | ⬜ |
| 8 | Empaquetado y deploy | Docker, docker-compose | corre en contenedor/nube | ⬜ |
| + | Extra (opcional) | migrar a TypeScript | proyecto en TS | ⬜ |

### Detalle de cada sprint

---

#### Sprint 0 — Fundaciones

- **Objetivo:** esqueleto vacío que arranca y responde.
- **Pasos:**
  1. Crear carpeta del proyecto.
  2. `npm init -y` e instalar `express`, `dotenv`, `nodemon` (dev).
  3. Crear estructura de carpetas (`src/`, `routes/`, `controllers/`, ...).
  4. `.gitignore` + `.env` + `.env.example`.
  5. Script `dev` en `package.json`.
  6. `app.js` con `GET /health`; `server.js` que levanta el puerto.
  7. `compose.yaml` con Postgres + `.env`; levantar con `docker compose up -d` y
     conectarte con `pgcli` para verificar.
  8. Pinnear la versión de Node con `mise use node@22` (crea `.mise.toml`) y
     reflejarla en `engines` del `package.json` y en la base Docker (`node:22`).
- **Reto:** que `npm run dev` recargue solo al guardar.
- **DoD:** `curl localhost:3000/health` responde `{ "status": "ok" }` **y** `pgcli`
  conecta al contenedor de Postgres.

---

#### Sprint 1 — CRUD por capas (en memoria)

- **Objetivo:** CRUD completo con arquitectura correcta, **sin DB todavía** (para no
  mezclar conceptos).
- **Pasos:**
  1. `routes/tareas.routes.js` → apunta al controller.
  2. `controllers/tareas.controller.js` → maneja `req`/`res`.
  3. `services/tareas.service.js` → reglas de negocio.
  4. `repositories/tareas.repository.js` → array en memoria.
  5. Endpoints `GET`, `GET /:id`, `POST`, `PATCH`, `DELETE` con status codes correctos
     (`200` / `201` / `204` / `404`).
- **Reto:** que el controller no tenga una sola línea de lógica de negocio.
- **DoD:** CRUD funcionando y capas aisladas (cambiar el repo no rompe el controller).

---

#### Sprint 2 — Persistencia real (en dos fases)

- **Objetivo:** sustituir el array por PostgreSQL **sin tocar** controllers/services.
- **Fase 2A — PostgreSQL con SQL crudo:**
  1. Levantar Postgres con `compose.yaml` (si no se hizo en Sprint 0).
  2. Conectarte con `pgcli` y crear la tabla `tareas` **a mano**.
  3. Practicar `INSERT` / `SELECT` / `UPDATE` / `DELETE` en la terminal.
  4. Reimplementar `tareas.repository.js` con el driver `pg` y **SQL parametrizado**.
- **Fase 2B — Migrar a Prisma:**
  1. `prisma init` y definir el modelo `Tarea` en `schema.prisma`.
  2. `prisma migrate` + `prisma generate` (comparar con tu SQL a mano).
  3. Reescribir **solo** el repository para usar Prisma Client.
- **Reto:** demostrar que al pasar de SQL crudo a Prisma **solo cambió `repositories/`**.
- **DoD:** los datos persisten tras reiniciar; el mismo contrato de repository con dos
  implementaciones (SQL crudo y Prisma).

---

#### Sprint 3 — Validación y errores

- **Objetivo:** respuestas de error consistentes y sin `try/catch` repetido.
- **Pasos:**
  1. Validación de entrada con `zod` (body/params).
  2. Clase `AppError` con `statusCode`.
  3. `errorHandler` central (al final de `app.js`).
  4. `404 handler`.
  5. Middleware `asyncHandler` / `catchAsync`.
- **DoD:** un body inválido devuelve `400` con estructura uniforme; sin try/catch disperso.

---

#### Sprint 4 — Auth y autorización

- **Objetivo:** usuarios, login y permisos.
- **Pasos:**
  1. Modelo `Usuario`.
  2. `POST /auth/register` y `POST /auth/login`.
  3. Hasheo con `bcrypt`.
  4. Firma y verificación de **JWT**.
  5. Middleware `requireAuth` que puebla `req.user`.
  6. Cada usuario solo ve **sus** tareas (ownership).
- **DoD:** sin token → `401`; token ajeno sobre recurso de otro → `403`.

---

#### Sprint 5 — Relaciones y reglas de negocio

- **Objetivo:** modelar el dominio medio.
- **Pasos:**
  1. `Proyecto` ↔ `Tarea` ↔ `Usuario`.
  2. Filtros (`?estado=`, `?proyecto=`).
  3. Paginación (`?page=&limit=`) y ordenamiento.
  4. Reglas (p. ej. no borrar un proyecto con tareas).
- **DoD:** consultas con relaciones, filtros combinables y reglas aplicadas.

---

#### Sprint 6 — Testing

- **Objetivo:** red de seguridad.
- **Pasos:**
  1. Runner: **Vitest** + `supertest` (tests en sintaxis ESM importando tus módulos CJS).
  2. Tests unitarios de **services**.
  3. Tests de integración de **endpoints**.
  4. DB de prueba aislada.
- **DoD:** `npm test` verde, cubriendo camino feliz **y** de error.

---

#### Sprint 7 — Calidad y observabilidad

- **Pasos:**
  1. `eslint` + `prettier`.
  2. Logs estructurados (`pino`).
  3. Seguridad: `helmet`, `cors`, rate limit.
  4. Config por entorno.
  5. Documentación **OpenAPI/Swagger**.
- **DoD:** `/docs` navegable con todos los endpoints.

---

#### Sprint 8 — Empaquetado y deploy

- **Pasos:**
  1. `Dockerfile` multi-stage.
  2. `docker-compose` con la DB.
  3. Variables de entorno de producción.
  4. Deploy (Railway / Render / Fly).
- **DoD:** la app corre en contenedor y en la nube.

---

#### Sprint extra — TypeScript (opcional)

Migrar el proyecto completo a TypeScript, tipando capas y contratos.

---

## 7. Cómo trabajamos (ciclo por sprint)

```mermaid
graph LR
    A[Reto del sprint] --> B[Tú lo codeas]
    B --> C[Pegas tu código y preguntas]
    C --> D[Yo valido y comento el por qué]
    D --> E{DoD ok?}
    E -->|sí| F[Actualizar skill_core.md y avanzar]
    E -->|no| B
```

- Tú escribes el código; yo reviso, corrijo y explico.
- Avanzamos **solo** cuando el DoD está cumplido.
- Al cerrar un sprint, **actualizamos este documento** (marcar estado, notas, decisiones).

---

## 8. Decisiones y pendientes

| Tema | Decisión | Estado |
|---|---|---|
| Proyecto | TaskFlow API (opción A) | ✅ confirmado |
| Nombre del proyecto | `taskflow-api` | ✅ confirmado |
| Motor de datos | PostgreSQL 17 (Docker) | ✅ confirmado |
| Cliente SQL | `pgcli` (tú, en la terminal) | ✅ confirmado |
| Acceso a datos | SQL crudo (`pg`) → luego Prisma | ✅ confirmado |
| Contenedores (dev) | Docker Compose, **solo la DB** | ✅ confirmado |
| Nombre del archivo compose | `compose.yaml` | ✅ confirmado |
| Gestor de paquetes | `npm` | ✅ confirmado |
| Módulos (CJS/ESM) | CommonJS (`require`) por ahora | ✅ confirmado |
| Test runner | Vitest + Supertest | ✅ confirmado |
| Versión de Node | **Node 22 LTS**, pinneada con `mise use node@22` | ✅ confirmado |

> **Sin pendientes.** Listos para el Sprint 0.

---

## 9. Registro de avance

| Fecha | Sprint | Nota |
|---|---|---|
| 2026-09-28 | — | Documento creado. |
| 2026-09-28 | 0 | Decisiones cerradas (PostgreSQL + pgcli, Docker, Prisma, `npm`, CommonJS). Sprint 0 en progreso. |
| 2026-09-28 | 0 | Añadido: testing con **Vitest** + SuperTest y pinneo de versión de Node. |
| 2026-09-28 | 0 | **Documento cerrado.** Node fijado en **22 LTS** vía `mise use node@22`; testing con **Vitest**. Sin pendientes. |
| 2026-09-29 | 0 | ✅ **Sprint 0 completado.** Verificado: `mise` (node 22), `main`→`src/server.js`, estructura `src/` correcta (typo `respositories` corregido), `.gitignore`/`.env`, `app.js`+`server.js`, `compose.yaml` (Postgres). Smoke test: `GET /health` → `200 {"status":"ok"}`. |
| 2026-10-01 | 1 | ✅ **Sprint 1 completado.** CRUD por capas, campos internos protegidos, entidad consistente en español y contrato asíncrono preparado para PostgreSQL. Corregido `await findById()` en `update()`. Prueba integral: CRUD OK; status 200/201/204/404 OK. |
| 2026-10-01 | 2 | 🟡 **Sprint 2 iniciado.** Primera fase: PostgreSQL y SQL crudo mediante `pgcli` + driver `pg`; segunda fase: migración del repository a Prisma. |
