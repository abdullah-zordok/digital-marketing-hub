# Production Readiness

This document records Docker runtime, security, performance, observability, and release procedures for the backend API.

## Docker Runtime

Start the production-like backend runtime from the repository root:

```powershell
docker compose up --build
```

The Compose environment runs `api`, `postgres`, and `redis`. PostgreSQL, Redis, and uploaded files use named Docker volumes so local data survives container recreation. The API waits for healthy PostgreSQL and Redis services, runs `pnpm prisma:deploy`, then starts the compiled NestJS service.

Use `docker compose down` to stop services. Use `docker compose down --volumes` only for an intentional local data reset.

## Configuration And Secrets

Copy `.env.example` to `.env` for local validation. Values in `.env.example` are placeholders only; production deployments must supply real secrets through the deployment environment. Production startup rejects weak or placeholder secrets and requires explicit trusted origins.

## Security Defaults

The API enables security headers, response compression, JSON/urlencoded body limits, and trusted-origin CORS at bootstrap. Configure browser origins with `TRUSTED_ORIGINS` as a comma-separated allowlist. Unlisted origins do not receive CORS allow headers.

Public health and traffic-limit responses must not expose credentials, raw connection strings, counters, stack traces, or account-existence details.

## Traffic Limits

Redis-backed traffic limits protect login, chatbot, lead capture, and uploads. Configure thresholds with:

- `LOGIN_LIMIT` / `LOGIN_WINDOW_SECONDS`
- `CHATBOT_VISITOR_LIMIT` / `CHATBOT_VISITOR_WINDOW_SECONDS`
- `LEAD_LIMIT` / `LEAD_WINDOW_SECONDS`
- `UPLOAD_LIMIT` / `UPLOAD_WINDOW_SECONDS`

Rejected requests return `429` with `Too many requests. Please try again later.`

## Caching And Performance

Published services and blog content use Redis read-through caching. Cache keys include query parameters that affect the public response, and admin content mutations invalidate the affected public cache prefixes.

Pagination defaults to page `1` and limit `10`; oversized limits clamp to `100`.

## Operational Events

Operational events are structured JSON logs with redacted context. Current categories include startup/dependency readiness, authentication failures, lead creation, lead notification skipped/failed states, chatbot failures, and background job enqueue/failure events.

Do not log raw secrets, bearer tokens, webhook payloads, full credentials, or unnecessary personal data. Use IDs and status codes as investigation references.

## Release Validation

Run the Docker smoke check after the environment is running:

```powershell
pnpm smoke:docker
```

The smoke script validates required Compose services, persistent volumes, and the health endpoint shape.

## Backup, Restore, And Rollback

Back up PostgreSQL before release with a deployment-managed `pg_dump` or provider snapshot. Restore into a staging database first and run health plus analytics checks before promoting restored data.

Rollback by redeploying the previous image tag and running `pnpm prisma:deploy` only for already-approved migrations. Do not use schema push in production.

For PostgreSQL or Redis outage, check Compose/service health first, inspect dependency logs, then restart the affected dependency. The API health endpoint should report `not_ready` until required dependencies recover.
