# Digital Marketing Hub

Digital Marketing Hub is a TypeScript/NestJS backend platform for agency website content, authentication, services, blog content, uploads, lead management, and AI-assisted visitor conversations.

## Architecture

- `apps/api`: NestJS API with Prisma, PostgreSQL, Redis, JWT authentication, role guards, and Jest/Supertest validation.
- `specs`: Spec Kit feature specifications, plans, contracts, quickstarts, and task lists.
- `.specify`: Spec Kit project configuration and templates.

## Repository Workflow

All implementation work is delivered through feature branches and pull requests targeting `main`. Do not commit implementation changes directly to `main`.

Planned branches:

- `feature/backend-foundation`
- `feature/authentication`
- `feature/services-module`
- `feature/blog-module`
- `feature/lead-management`
- `feature/ai-chatbot`
- `feature/admin-dashboard`
- `feature/docker-infrastructure`
- `feature/testing`

## Local Development

```powershell
pnpm install
pnpm --filter @digital-marketing-hub/api prisma:generate
pnpm --filter @digital-marketing-hub/api build
pnpm --filter @digital-marketing-hub/api test
```

## Production Readiness

Spec 4 hardens the single Docker-based backend runtime for production-like validation:

```powershell
Copy-Item .env.example .env
pnpm build
pnpm test:unit
pnpm test:contract
pnpm test:integration
docker compose up --build
pnpm smoke:docker
```

The Docker environment starts `api`, `postgres`, and `redis` with health checks and persistent volumes. Runtime readiness is exposed at `GET /api/v1/health`, API documentation is available at `/api/docs` when `DOCS_ENABLED=true`, and release evidence is tracked in `docs/release-readiness-checklist.md`.

## Quality Standards

- TypeScript strict mode
- Clean Architecture boundaries by module
- SOLID service and repository design
- Validation at API boundaries
- Unit, contract, and integration tests for completed backend behavior
