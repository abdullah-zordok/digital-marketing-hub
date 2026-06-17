# Quickstart: Production Readiness Validation

## Prerequisites

- Node.js 22 LTS
- pnpm 9.x through Corepack
- Docker Desktop or compatible Docker Engine with Compose
- A clean checkout of this repository

## 1. Install dependencies

```powershell
corepack enable
pnpm install
```

**Expected outcome**: workspace dependencies install for the root package and `apps/api`.

## 2. Prepare local environment

```powershell
Copy-Item .env.example .env
```

Review `.env` and confirm all required values are placeholder-safe for local validation. Production values must be supplied by the deployment environment and must not be committed.

**Expected outcome**: local runtime configuration exists without real secrets.

## 3. Build the API

```powershell
pnpm build
```

**Expected outcome**: the API compiles successfully and Prisma client generation remains compatible with the current schema.

## 4. Run automated validation

```powershell
pnpm test:unit
pnpm test:contract
pnpm test:integration
```

**Expected outcome**:
- Unit tests cover configuration, caching, traffic limits, security helpers, analytics aggregation, logging redaction, and background-job boundaries.
- Contract tests cover health, analytics, API documentation, response envelopes, rate-limit behavior, and public cache behavior.
- Integration tests cover Docker-adjacent runtime behavior, authenticated admin access, public safety, cache invalidation, and dependency health failures where practical.

## 5. Start the Docker environment

```powershell
docker compose up --build
```

**Expected outcome**:
- API, PostgreSQL, and Redis start together.
- PostgreSQL and Redis health checks pass.
- The API applies production-safe migration behavior for the selected mode.
- The API starts without requiring manual dependency setup.

## 6. Verify health readiness

In a second terminal:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health
```

**Expected outcome**:
- Response reports application, database, and cache readiness.
- Response includes environment and timestamp.
- Response does not expose credentials, tokens, raw connection strings, or stack traces.

## 7. Verify API documentation

Open:

```text
http://localhost:3000/api/docs
```

**Expected outcome**:
- Documentation is available when enabled.
- Auth, services, blog, leads, chatbot, uploads, analytics, admin, and health capabilities are represented.

## 8. Verify protected analytics overview

1. Authenticate with an admin user.
2. Request:

```text
GET /api/v1/admin/analytics/overview
```

**Expected outcome**:
- Unauthenticated requests are rejected.
- Authenticated admin users receive non-negative aggregate counts for leads, blog posts, services, chatbot sessions, and chatbot messages.
- No individual lead or visitor personal data is returned.

## 9. Verify production-safety checks

Run the release-readiness scenarios from the tasks phase:

- Missing critical production secret fails startup.
- Unsafe production default fails startup.
- Untrusted origin is rejected.
- Oversized request body is rejected.
- Oversized or unsupported upload is rejected.
- Excessive login, chatbot, lead, and upload traffic is rejected.
- Public content cache is invalidated after admin content changes.
- Logs redact passwords, tokens, raw secrets, and full credential values.

**Expected outcome**: every scenario has pass/fail evidence before release approval.

Record release evidence in `docs/release-readiness-checklist.md`. Blocking checks must be `pass` or have an explicit approved exception before launch.

## 10. Stop the environment

```powershell
docker compose down
```

Use volume removal only for intentional local reset:

```powershell
docker compose down --volumes
```
