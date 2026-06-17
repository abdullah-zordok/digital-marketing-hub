# Implementation Plan: Docker, Performance, Security, and Production Readiness

**Branch**: `feature/docker-infrastructure` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-docker-production-readiness/spec.md`

## Summary

Harden the existing backend API into a production-ready service by improving the single Docker-based runtime, fail-fast configuration validation, health/readiness behavior, Redis-backed caching and traffic controls, security defaults, operational logging, background-job readiness, analytics overview, API documentation, and release validation. The implementation will extend the current `apps/api` NestJS service, Prisma/PostgreSQL storage, Redis dependency, and root Docker Compose setup rather than introducing a second backend architecture.

## Technical Context

**Language/Version**: TypeScript 5.7 on Node.js 22 LTS

**Primary Dependencies**: NestJS 10, Prisma 5, PostgreSQL 16, Redis 7, ioredis, Zod, class-validator/class-transformer, Jest, Supertest, Docker Compose. Planned focused additions include security headers, response compression, OpenAPI documentation, Redis-backed throttling, and background-job support where needed.

**Storage**: PostgreSQL for persistent business data, Redis for cache/rate-limit/job state, local upload storage for current runtime, Docker volumes for local persistent services.

**Testing**: Existing Jest unit, contract, and integration suites under `apps/api/test`; add production-readiness unit/contract/integration coverage plus Docker smoke validation documented in quickstart.

**Target Platform**: Containerized Linux backend runtime for development and production-like validation.

**Project Type**: Backend web service in a pnpm monorepo (`apps/api`).

**Performance Goals**: 95% of representative public content requests within 500 ms; 95% of lead and chatbot requests within 2 seconds excluding external provider wait time; all list endpoints enforce defaults and maximum limits.

**Constraints**: Single Docker-based backend environment; strict TypeScript; no committed secrets; admin endpoints protected by JWT and roles; public responses exclude private/internal fields; logs redact credentials, tokens, raw secrets, and unnecessary personal data.

**Scale/Scope**: Small-to-medium digital marketing agency backend with moderate public traffic, admin dashboard usage, chatbot conversations, and lead capture. Multi-region high availability and frontend deployment are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file is still the default placeholder and does not define enforceable project-specific gates. For this plan, the effective gates come from the project requirements and user standards:

- Clean Architecture: PASS - changes stay inside existing modules or small shared infrastructure modules.
- Strict TypeScript: PASS - implementation targets the current TypeScript backend with existing strict compiler settings.
- SOLID and low coupling: PASS - caching, throttling, documentation, logging, analytics, and jobs are planned as focused services/providers.
- Test-first production readiness: PASS - unit, contract, integration, and smoke validation are included before implementation tasks.
- Security and secrets hygiene: PASS - fail-fast env validation, trusted origins, request limits, role protection, and log redaction are explicit requirements.

Post-design re-check: PASS - research, data model, contracts, and quickstart preserve the gates above with no justified violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-docker-production-readiness/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── environment-contract.md
│   └── production-readiness-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
.
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── apps/
│   └── api/
│       ├── Dockerfile
│       ├── README.md
│       ├── package.json
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── common/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── middleware/
│       │   │   ├── pipes/
│       │   │   └── utils/
│       │   ├── config/
│       │   ├── database/
│       │   ├── health/
│       │   └── modules/
│       │       ├── analytics/
│       │       ├── auth/
│       │       ├── blog/
│       │       ├── chatbot/
│       │       ├── leads/
│       │       ├── services/
│       │       ├── settings/
│       │       └── uploads/
│       └── test/
│           ├── contract/
│           ├── integration/
│           ├── support/
│           └── unit/
```

**Structure Decision**: Use the existing pnpm monorepo and single `apps/api` backend. Production-readiness implementation should update root Docker/runtime files, add small infrastructure services under `apps/api/src/common`, `apps/api/src/config`, `apps/api/src/database`, and `apps/api/src/modules/analytics`, and extend existing tests in `apps/api/test`.

## Complexity Tracking

No constitution violations or unnecessary architectural additions are planned.
