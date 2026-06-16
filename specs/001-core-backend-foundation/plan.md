# Implementation Plan: Core Backend Foundation

**Branch**: `N/A - no git branch detected` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-core-backend-foundation/spec.md`

**Note**: This plan covers only Spec 1 - Core Backend Foundation. Later specifications handle full services, blog, chatbot, lead, analytics, production hardening, and advanced performance work.

## Summary

Build the backend foundation for Digital Marketing Hub as a backend-first web service. The implementation establishes a versioned REST surface, consistent response and error envelopes, validated startup configuration, health reporting for the application and dependencies, secure admin authentication, role-based admin authorization, a protected admin verification route, modular domain structure, and foundational data entities for later platform phases.

The technical approach follows the source backend direction: TypeScript on Node.js with NestJS, Prisma, PostgreSQL, Redis, JWT-based admin sessions, Docker Compose for the local backend environment, and Jest/Supertest for unit and integration validation.

## Technical Context

**Language/Version**: TypeScript on Node.js LTS

**Primary Dependencies**: NestJS application framework, Prisma data access, PostgreSQL relational storage, Redis supporting service, JWT authentication, bcrypt password hashing, class-validator/class-transformer request validation, dotenv/config validation, Docker Compose, Jest, Supertest

**Storage**: PostgreSQL for durable business records; Redis for health verification and future cache/rate-limit/queue support

**Testing**: Jest for unit tests; Supertest-backed integration tests for HTTP contract, authentication, authorization, validation, and health checks

**Target Platform**: Linux-compatible backend service running locally and in production-style environments through Docker Compose

**Project Type**: Backend web service

**Performance Goals**: Health and authentication responses complete within 1 second during local acceptance testing; foundation supports modular expansion without changing public/admin separation; list/search performance groundwork is represented through indexed lookup fields for later specs

**Constraints**: Single backend Docker environment must include application, PostgreSQL, and Redis; startup must fail fast on missing required configuration; public responses must not expose secrets, password hashes, private admin fields, or internal error traces

**Scale/Scope**: Foundation for a digital marketing agency platform with public website APIs, protected admin APIs, future content management, future chatbot, future lead management, and future analytics

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file currently contains placeholder text and no ratified project principles. No custom governance gates are enforceable at this time.

Baseline gates applied for this plan:

- PASS: Scope is limited to Core Backend Foundation.
- PASS: Plan includes unit and integration validation for authentication, authorization, validation, and health behavior.
- PASS: Public/admin separation is explicit in the specification, data model, and contracts.
- PASS: Sensitive data exposure is explicitly disallowed.
- PASS: Docker-based local environment is included as a foundation requirement.

Post-design re-check:

- PASS: `research.md` resolves technology and implementation approach decisions without unresolved clarifications.
- PASS: `data-model.md` represents all 10 foundational entities from the specification.
- PASS: `contracts/core-backend-foundation.openapi.yaml` defines the externally visible foundation contract.
- PASS: `quickstart.md` defines end-to-end validation scenarios for startup, health, auth, authorization, validation, and contract checks.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-backend-foundation/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- core-backend-foundation.openapi.yaml
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
apps/
`-- api/
    |-- src/
    |   |-- main.ts
    |   |-- app.module.ts
    |   |-- common/
    |   |   |-- decorators/
    |   |   |-- filters/
    |   |   |-- guards/
    |   |   |-- interceptors/
    |   |   |-- middleware/
    |   |   |-- pipes/
    |   |   `-- utils/
    |   |-- config/
    |   |-- database/
    |   |-- modules/
    |   |   |-- auth/
    |   |   |-- users/
    |   |   |-- services/
    |   |   |-- blog/
    |   |   |-- chatbot/
    |   |   |-- leads/
    |   |   |-- settings/
    |   |   |-- uploads/
    |   |   `-- analytics/
    |   `-- health/
    |-- prisma/
    |   |-- schema.prisma
    |   `-- seed.ts
    |-- test/
    |   |-- contract/
    |   |-- integration/
    |   `-- unit/
    |-- Dockerfile
    |-- .dockerignore
    `-- package.json

docker-compose.yml
.env.example
pnpm-workspace.yaml
package.json
```

**Structure Decision**: Use a backend-only workspace with the API under `apps/api` so future frontend/admin applications can be added without moving the backend. Within the API, use domain modules matching the source spec and shared `common`, `config`, and `database` areas for cross-cutting behavior.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
