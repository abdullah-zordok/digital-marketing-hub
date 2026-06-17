# Digital Marketing Hub API

Backend foundation for the Digital Marketing Hub platform.

## Stack

- Node.js LTS with TypeScript
- NestJS
- Prisma with PostgreSQL
- Redis
- JWT admin authentication
- Jest and Supertest

## Environment

Create `.env` from the root `.env.example` file and provide all required values.

Required foundation values include:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `OPENAI_API_KEY`
- `APP_BASE_URL`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `STORAGE_DRIVER`
- `UPLOAD_MAX_BYTES`
- `UPLOAD_PUBLIC_PATH`
- `UPLOAD_STORAGE_PATH`
- `LEAD_NOTIFICATION_WEBHOOK_URL` (optional; blank disables delivery and records skipped attempts)
- `TRUSTED_ORIGINS`
- `REQUEST_BODY_LIMIT`
- `DOCS_ENABLED`
- `DOCS_PATH`
- `CACHE_DEFAULT_TTL_SECONDS`
- `PUBLIC_CONTENT_CACHE_TTL_SECONDS`
- `LOGIN_LIMIT`
- `LOGIN_WINDOW_SECONDS`
- `LEAD_LIMIT`
- `LEAD_WINDOW_SECONDS`
- `UPLOAD_LIMIT`
- `UPLOAD_WINDOW_SECONDS`
- `QUEUE_REDIS_URL`
- `CHATBOT_VISITOR_LIMIT`
- `CHATBOT_VISITOR_WINDOW_SECONDS`
- `CHATBOT_SOURCE_LIMIT`
- `CHATBOT_SOURCE_WINDOW_SECONDS`

Startup fails before accepting requests when required values are missing or invalid.

## Local Commands

```powershell
pnpm install
pnpm --filter @digital-marketing-hub/api prisma:generate
pnpm --filter @digital-marketing-hub/api prisma:deploy
pnpm --filter @digital-marketing-hub/api seed
pnpm --filter @digital-marketing-hub/api dev
```

## Docker

```powershell
docker compose up --build
```

The Compose environment starts the API, PostgreSQL, and Redis together. The API waits for healthy dependencies, applies migrations with `prisma:deploy`, and serves uploads from a persistent Docker volume.

Run the smoke validator after the environment is up:

```powershell
pnpm smoke:docker
```

## Validation

```powershell
pnpm --filter @digital-marketing-hub/api test
pnpm --filter @digital-marketing-hub/api test:unit
pnpm --filter @digital-marketing-hub/api test:contract
pnpm --filter @digital-marketing-hub/api test:integration
pnpm --filter @digital-marketing-hub/api build
```

Production-readiness validation from the repository root:

```powershell
pnpm build
pnpm test:unit
pnpm test:contract
pnpm test:integration
pnpm smoke:docker
```

Primary endpoint:

```text
GET /api/v1/health
GET /api/docs
GET /api/docs-json
```

Auth endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
GET  /api/v1/admin/probe
GET  /api/v1/admin/analytics/overview
```

Content endpoints:

```text
GET    /api/v1/services
GET    /api/v1/services/:slug
POST   /api/v1/admin/services
PATCH  /api/v1/admin/services/:id
PATCH  /api/v1/admin/services/:id/publish
PATCH  /api/v1/admin/services/:id/unpublish
PATCH  /api/v1/admin/services/reorder

GET    /api/v1/blog/posts
GET    /api/v1/blog/posts/:slug
GET    /api/v1/blog/categories
GET    /api/v1/blog/categories/:slug/posts
POST   /api/v1/admin/blog/posts
PATCH  /api/v1/admin/blog/posts/:id
PATCH  /api/v1/admin/blog/posts/:id/publish
PATCH  /api/v1/admin/blog/posts/:id/unpublish
POST   /api/v1/admin/blog/categories
PATCH  /api/v1/admin/blog/categories/:id

POST   /api/v1/admin/uploads
```

Chatbot and lead endpoints:

```text
POST   /api/v1/chatbot/sessions
POST   /api/v1/chatbot/sessions/:sessionId/messages
GET    /api/v1/chatbot/sessions/:sessionId/messages

GET    /api/v1/admin/knowledge-base
POST   /api/v1/admin/knowledge-base
GET    /api/v1/admin/knowledge-base/:id
PATCH  /api/v1/admin/knowledge-base/:id
DELETE /api/v1/admin/knowledge-base/:id
PATCH  /api/v1/admin/knowledge-base/:id/activate
PATCH  /api/v1/admin/knowledge-base/:id/archive

POST   /api/v1/leads
GET    /api/v1/admin/leads
GET    /api/v1/admin/leads/:id
PATCH  /api/v1/admin/leads/:id
DELETE /api/v1/admin/leads/:id
PATCH  /api/v1/admin/leads/:id/status
```
