# Implementation Plan: Services, Blog, and Content Management

**Branch**: `N/A - no git branch detected` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-services-blog-content/spec.md`

**Note**: This plan builds on Spec 1 - Core Backend Foundation. It extends the existing NestJS API, Prisma schema, auth guards, response envelope, validation behavior, and placeholder `services`, `blog`, and `uploads` modules.

## Summary

Implement backend content management for marketing services, blog posts, blog categories, public content discovery, SEO metadata, and content image uploads. Admin and editor users can manage content through protected admin endpoints, while public visitors can read only published content. Public content lists support pagination, search, category and tag filters, and deterministic sorting. Uploads accept validated image files, store metadata, and return safe public URLs.

The technical approach reuses the current TypeScript/NestJS backend, Prisma/PostgreSQL data model, JWT authentication and role guards, standardized API envelopes, validation pipe, and Jest/Supertest test setup from Spec 1.

## Technical Context

**Language/Version**: TypeScript on Node.js LTS

**Primary Dependencies**: Existing NestJS API, Prisma Client, PostgreSQL, JWT auth and role guards, class-validator/class-transformer, Multer-compatible NestJS file upload support, Jest, Supertest

**Storage**: PostgreSQL for service, blog, category, and upload metadata; local filesystem-backed public uploads for this feature, with stored metadata designed to support S3-compatible storage later

**Testing**: Jest unit tests for services, validation helpers, SEO fallbacks, and upload validation; Supertest integration tests for public and admin content workflows; contract tests against OpenAPI documentation

**Target Platform**: Linux-compatible backend service running under the existing Docker Compose environment

**Project Type**: Backend web service

**Performance Goals**: Public list responses return bounded pages with paging metadata; public content detail lookup uses stable public addresses; seeded discovery tests verify correct search/filter/sort behavior across at least 20 blog posts

**Constraints**: Public endpoints must expose only published, non-deleted content; admin write endpoints require ADMIN or EDITOR roles; VIEWER cannot mutate content; uploaded files must be image-only, size-bounded, and must not expose private storage paths

**Scale/Scope**: Services, blog posts, blog categories, public discovery, SEO metadata, and content image uploads for the Digital Marketing Hub backend; no chatbot, leads, analytics, frontend screens, or production monitoring in this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file still contains placeholder text and no ratified project principles. No custom governance gates are enforceable at this time.

Baseline gates applied for this feature:

- PASS: Scope is limited to services, blog, categories, public discovery, SEO metadata, and uploads.
- PASS: Plan reuses the existing backend architecture from Spec 1.
- PASS: Protected admin write workflows are role-gated.
- PASS: Public responses are explicitly limited to published, non-deleted content and safe fields.
- PASS: Plan includes unit, integration, and contract validation for content behavior.

Post-design re-check:

- PASS: `research.md` resolves upload limits, public filtering, SEO fallback, pagination, and popular sorting decisions.
- PASS: `data-model.md` maps all entities and state transitions needed by the specification.
- PASS: `contracts/services-blog-content.openapi.yaml` documents public and admin interfaces.
- PASS: `quickstart.md` defines end-to-end validation scenarios for services, blog, discovery, SEO, roles, and uploads.

## Project Structure

### Documentation (this feature)

```text
specs/002-services-blog-content/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- services-blog-content.openapi.yaml
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
apps/
`-- api/
    |-- src/
    |   |-- common/
    |   |   |-- decorators/
    |   |   |-- guards/
    |   |   |-- pipes/
    |   |   `-- types/
    |   |-- modules/
    |   |   |-- services/
    |   |   |   |-- dto/
    |   |   |   |-- services.module.ts
    |   |   |   |-- services.controller.ts
    |   |   |   |-- admin-services.controller.ts
    |   |   |   |-- services.service.ts
    |   |   |   `-- services.repository.ts
    |   |   |-- blog/
    |   |   |   |-- dto/
    |   |   |   |-- blog.module.ts
    |   |   |   |-- blog-posts.controller.ts
    |   |   |   |-- blog-categories.controller.ts
    |   |   |   |-- admin-blog-posts.controller.ts
    |   |   |   |-- admin-blog-categories.controller.ts
    |   |   |   |-- blog.service.ts
    |   |   |   `-- blog.repository.ts
    |   |   `-- uploads/
    |   |       |-- dto/
    |   |       |-- uploads.module.ts
    |   |       |-- admin-uploads.controller.ts
    |   |       |-- uploads.service.ts
    |   |       `-- upload-validation.service.ts
    |   `-- app.module.ts
    |-- prisma/
    |   |-- schema.prisma
    |   `-- migrations/
    `-- test/
        |-- contract/
        |-- integration/
        |-- unit/
        `-- support/
```

**Structure Decision**: Extend the existing `apps/api` backend and fill the already-created domain modules. Keep service, blog, and upload behavior separate because they have distinct actors and validation rules, while sharing common pagination, SEO fallback, role guards, and response envelopes.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
