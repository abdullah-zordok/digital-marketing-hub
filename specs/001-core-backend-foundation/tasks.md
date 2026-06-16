# Tasks: Core Backend Foundation

**Input**: Design documents from `specs/001-core-backend-foundation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/core-backend-foundation.openapi.yaml](./contracts/core-backend-foundation.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Test tasks are included because the specification and plan require repeatable validation for health, startup configuration, authentication, authorization, response envelopes, and data model readiness.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after shared setup and foundational work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the backend workspace, package scripts, Docker files, and directory structure from the implementation plan.

- [X] T001 Create root workspace manifest in package.json with pnpm scripts for install, build, test, and API filtering
- [X] T002 Create pnpm workspace definition in pnpm-workspace.yaml for apps/api
- [X] T003 Create NestJS API package manifest with required dependencies and scripts in apps/api/package.json
- [X] T004 [P] Create TypeScript configuration for the API in apps/api/tsconfig.json
- [X] T005 [P] Create test TypeScript configuration in apps/api/tsconfig.spec.json
- [X] T006 [P] Create Jest configuration for unit and integration tests in apps/api/jest.config.ts
- [X] T007 [P] Create API source and test directory structure under apps/api/src and apps/api/test
- [X] T008 [P] Create Dockerfile for the API service in apps/api/Dockerfile
- [X] T009 [P] Create Docker ignore rules in apps/api/.dockerignore
- [X] T010 Create Docker Compose environment with api, postgres, and redis services in docker-compose.yml
- [X] T011 Create required environment sample values in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared application infrastructure that must exist before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T012 Initialize NestJS bootstrap with global API prefix `/api/v1` in apps/api/src/main.ts
- [X] T013 Create root application module wiring config, database, health, auth, users, and admin modules in apps/api/src/app.module.ts
- [X] T014 [P] Create typed environment schema and validation helper in apps/api/src/config/env.schema.ts
- [X] T015 Create configuration module that validates required startup values in apps/api/src/config/config.module.ts
- [X] T016 [P] Create Prisma service lifecycle wrapper in apps/api/src/database/prisma.service.ts
- [X] T017 Create database module exporting Prisma access in apps/api/src/database/database.module.ts
- [X] T018 [P] Create Redis provider and health ping helper in apps/api/src/database/redis.provider.ts
- [X] T019 [P] Create shared success and error envelope types in apps/api/src/common/types/api-response.type.ts
- [X] T020 Create global response interceptor in apps/api/src/common/interceptors/response.interceptor.ts
- [X] T021 Create global exception filter in apps/api/src/common/filters/http-exception.filter.ts
- [X] T022 Create request logging middleware in apps/api/src/common/middleware/request-logger.middleware.ts
- [X] T023 Create validation pipe configuration helper in apps/api/src/common/pipes/validation.pipe.ts
- [X] T024 Create app-level constants for roles, statuses, and token names in apps/api/src/common/constants/app.constants.ts
- [X] T025 Create initial Prisma schema with User model and shared enums in apps/api/prisma/schema.prisma
- [X] T026 Create admin seed script using configured initial admin credentials in apps/api/prisma/seed.ts

**Checkpoint**: Shared backend infrastructure, configuration validation, database access, response handling, and base user storage are ready.

---

## Phase 3: User Story 1 - Verify Platform Readiness (Priority: P1) MVP

**Goal**: The backend starts with required services and reports readiness through health status.

**Independent Test**: Start the Docker environment, call `/api/v1/health`, and verify application, database, Redis, environment, and timestamp status are present; remove a required environment value and verify startup fails clearly.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementing this story.

- [X] T027 [P] [US1] Create health contract test for GET /api/v1/health in apps/api/test/contract/health.contract-spec.ts
- [X] T028 [P] [US1] Create Docker environment integration test for health readiness in apps/api/test/integration/health.e2e-spec.ts
- [X] T029 [P] [US1] Create startup configuration validation unit test in apps/api/test/unit/config/env.schema.spec.ts

### Implementation for User Story 1

- [X] T030 [P] [US1] Create health module in apps/api/src/health/health.module.ts
- [X] T031 [P] [US1] Create health response DTO in apps/api/src/health/dto/health-response.dto.ts
- [X] T032 [US1] Implement health service checking API, PostgreSQL, Redis, environment, and timestamp in apps/api/src/health/health.service.ts
- [X] T033 [US1] Implement health controller for GET /health in apps/api/src/health/health.controller.ts
- [X] T034 [US1] Wire health module into root application module in apps/api/src/app.module.ts
- [X] T035 [US1] Add startup failure messages for invalid configuration in apps/api/src/config/config.module.ts
- [X] T036 [US1] Document health and startup validation commands in specs/001-core-backend-foundation/quickstart.md

**Checkpoint**: User Story 1 is independently testable and demonstrates the MVP backend foundation.

---

## Phase 4: User Story 2 - Authenticate Admin Users (Priority: P1)

**Goal**: Admin users can sign in, retrieve current identity, refresh a session, sign out, and protected routes reject unauthenticated requests.

**Independent Test**: Seed an admin account, complete login/me/refresh/logout, and verify unauthenticated access to `/api/v1/admin/probe` is rejected without private data.

### Tests for User Story 2

> Write these tests first and confirm they fail before implementing this story.

- [X] T037 [P] [US2] Create auth contract tests for login, logout, me, refresh, and admin probe in apps/api/test/contract/auth.contract-spec.ts
- [X] T038 [P] [US2] Create admin authentication integration flow test in apps/api/test/integration/auth.e2e-spec.ts
- [X] T039 [P] [US2] Create password hashing unit test in apps/api/test/unit/auth/password.service.spec.ts
- [X] T040 [P] [US2] Create token service unit test in apps/api/test/unit/auth/token.service.spec.ts

### Implementation for User Story 2

- [X] T041 [P] [US2] Create auth module in apps/api/src/modules/auth/auth.module.ts
- [X] T042 [P] [US2] Create users module in apps/api/src/modules/users/users.module.ts
- [X] T043 [P] [US2] Create login, refresh, and safe-user DTOs in apps/api/src/modules/auth/dto/auth.dto.ts
- [X] T044 [US2] Implement users repository for admin lookup and safe user mapping in apps/api/src/modules/users/users.repository.ts
- [X] T045 [US2] Implement password hashing and comparison service in apps/api/src/modules/auth/password.service.ts
- [X] T046 [US2] Implement JWT access and refresh token service in apps/api/src/modules/auth/token.service.ts
- [X] T047 [US2] Implement auth service for login, me, refresh, and logout in apps/api/src/modules/auth/auth.service.ts
- [X] T048 [US2] Implement JWT guard for protected admin requests in apps/api/src/common/guards/jwt-auth.guard.ts
- [X] T049 [US2] Implement current-user decorator in apps/api/src/common/decorators/current-user.decorator.ts
- [X] T050 [US2] Implement auth controller endpoints in apps/api/src/modules/auth/auth.controller.ts
- [X] T051 [US2] Implement protected admin probe controller in apps/api/src/modules/auth/admin-probe.controller.ts
- [X] T052 [US2] Wire auth and users modules into root application module in apps/api/src/app.module.ts

**Checkpoint**: User Story 2 is independently testable against the auth contract and protected route behavior.

---

## Phase 5: User Story 3 - Enforce Admin Roles (Priority: P2)

**Goal**: ADMIN, EDITOR, and VIEWER users have distinct permissions enforced before protected admin actions.

**Independent Test**: Seed or create one user for each role and verify the role guard allows and denies actions according to the specification.

### Tests for User Story 3

> Write these tests first and confirm they fail before implementing this story.

- [X] T053 [P] [US3] Create role guard unit test for ADMIN, EDITOR, VIEWER, and unsupported roles in apps/api/test/unit/auth/roles.guard.spec.ts
- [X] T054 [P] [US3] Create role authorization integration test for admin probe variants in apps/api/test/integration/roles.e2e-spec.ts

### Implementation for User Story 3

- [X] T055 [P] [US3] Create roles metadata decorator in apps/api/src/common/decorators/roles.decorator.ts
- [X] T056 [US3] Implement role guard with ADMIN, EDITOR, and VIEWER behavior in apps/api/src/common/guards/roles.guard.ts
- [X] T057 [US3] Add role constants and role capability map in apps/api/src/common/constants/app.constants.ts
- [X] T058 [US3] Update admin probe route with role guard coverage in apps/api/src/modules/auth/admin-probe.controller.ts
- [X] T059 [US3] Extend seed script with optional EDITOR and VIEWER test users in apps/api/prisma/seed.ts
- [X] T060 [US3] Register role guard dependencies in auth module in apps/api/src/modules/auth/auth.module.ts
- [X] T061 [US3] Document role validation commands in specs/001-core-backend-foundation/quickstart.md

**Checkpoint**: User Story 3 is independently testable with role-specific allowed and denied outcomes.

---

## Phase 6: User Story 4 - Receive Consistent API Feedback (Priority: P2)

**Goal**: Public, auth, health, and protected admin responses follow consistent success and error envelopes with friendly validation and exception behavior.

**Independent Test**: Send valid, invalid, unauthenticated, forbidden, and unexpected-error requests and verify all responses match the documented envelope.

### Tests for User Story 4

> Write these tests first and confirm they fail before implementing this story.

- [X] T062 [P] [US4] Create response envelope unit test in apps/api/test/unit/common/response.interceptor.spec.ts
- [X] T063 [P] [US4] Create exception envelope unit test in apps/api/test/unit/common/http-exception.filter.spec.ts
- [X] T064 [P] [US4] Create validation error integration test in apps/api/test/integration/validation.e2e-spec.ts
- [X] T065 [P] [US4] Create OpenAPI contract conformance test for foundation responses in apps/api/test/contract/response-envelope.contract-spec.ts

### Implementation for User Story 4

- [X] T066 [US4] Finalize response interceptor envelope mapping in apps/api/src/common/interceptors/response.interceptor.ts
- [X] T067 [US4] Finalize exception filter for validation, auth, forbidden, and unexpected errors in apps/api/src/common/filters/http-exception.filter.ts
- [X] T068 [US4] Register global interceptor, filter, validation pipe, and logging middleware in apps/api/src/main.ts
- [X] T069 [US4] Add request body limits and validation whitelist behavior in apps/api/src/main.ts
- [X] T070 [US4] Ensure auth, health, and admin probe controllers return envelope-compatible values in apps/api/src/modules/auth/auth.controller.ts
- [X] T071 [US4] Update API contract examples for success and error envelopes in specs/001-core-backend-foundation/contracts/core-backend-foundation.openapi.yaml

**Checkpoint**: User Story 4 is independently testable across representative success and failure responses.

---

## Phase 7: User Story 5 - Establish Shared Data Foundation (Priority: P3)

**Goal**: The foundational data model reserves all core business records needed by future services, blog, chatbot, lead, settings, and upload features.

**Independent Test**: Inspect migrations/schema and verify all 10 entities exist with UUID identifiers, timestamps, slugs where needed, status enums, soft-delete fields where useful, and search/lookup indexes.

### Tests for User Story 5

> Write these tests first and confirm they fail before implementing this story.

- [X] T072 [P] [US5] Create Prisma schema structure test for all foundation entities in apps/api/test/unit/database/schema-entities.spec.ts
- [X] T073 [P] [US5] Create migration smoke test for PostgreSQL schema creation in apps/api/test/integration/database-migration.e2e-spec.ts

### Implementation for User Story 5

- [X] T074 [US5] Add Service, BlogPost, BlogCategory, Lead, ChatSession, ChatMessage, KnowledgeBaseItem, SiteSetting, and UploadedFile models to apps/api/prisma/schema.prisma
- [X] T075 [US5] Add content, lead, chatbot, settings, upload, and user enums to apps/api/prisma/schema.prisma
- [X] T076 [US5] Add UUID identifiers, createdAt, updatedAt, and useful deletedAt fields to apps/api/prisma/schema.prisma
- [X] T077 [US5] Add unique slug constraints and lookup indexes for public content and search-heavy fields in apps/api/prisma/schema.prisma
- [X] T078 [US5] Create initial Prisma migration for all foundation entities under apps/api/prisma/migrations
- [X] T079 [US5] Create placeholder domain modules for services, blog, chatbot, leads, settings, uploads, and analytics under apps/api/src/modules
- [X] T080 [US5] Wire placeholder domain modules into apps/api/src/app.module.ts without exposing full future workflows
- [X] T081 [US5] Update data model documentation if implementation names differ in specs/001-core-backend-foundation/data-model.md

**Checkpoint**: User Story 5 is independently testable by schema inspection and migration smoke test.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation alignment, and cleanup across all completed stories.

- [X] T082 [P] Align quickstart commands with final package scripts in specs/001-core-backend-foundation/quickstart.md
- [X] T083 [P] Align OpenAPI contract with implemented DTOs and routes in specs/001-core-backend-foundation/contracts/core-backend-foundation.openapi.yaml
- [X] T084 [P] Add API README with setup, environment, and validation notes in apps/api/README.md
- [X] T085 Run unit, contract, and integration test scripts and record expected commands in specs/001-core-backend-foundation/quickstart.md
- [X] T086 Run Docker Compose validation and update environment notes in .env.example
- [X] T087 Review generated test code for maintainability and deterministic behavior in apps/api/test
- [X] T088 Remove unused scaffolding and verify TypeScript build passes in apps/api/src

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; start immediately.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 User Story 1**: Depends on Phase 2; suggested MVP.
- **Phase 4 User Story 2**: Depends on Phase 2 and can be built after or alongside US1, but end-to-end auth validation benefits from US1 health readiness.
- **Phase 5 User Story 3**: Depends on Phase 4 because role enforcement requires authenticated users.
- **Phase 6 User Story 4**: Depends on Phase 2 and can be refined alongside US1/US2 because it applies to their responses.
- **Phase 7 User Story 5**: Depends on Phase 2 and can proceed independently after the base User model exists.
- **Phase 8 Polish**: Depends on all selected story phases being complete.

### User Story Dependencies

- **US1 Verify Platform Readiness**: No dependency on other user stories after Phase 2.
- **US2 Authenticate Admin Users**: No dependency on other user stories after Phase 2.
- **US3 Enforce Admin Roles**: Depends on US2 authentication primitives.
- **US4 Receive Consistent API Feedback**: No strict story dependency after Phase 2, but should be validated against US1 and US2 endpoints.
- **US5 Establish Shared Data Foundation**: No dependency on other user stories after Phase 2 except the shared User model.

### Within Each User Story

- Tests are written before implementation tasks.
- DTOs and models precede services.
- Services precede controllers.
- Controllers are wired into modules before integration validation.
- Story checkpoint must pass before treating that story as complete.

## Parallel Opportunities

- T004, T005, T006, T007, T008, T009 can run in parallel after T001-T003.
- T014, T016, T018, T019, T022, T023 can run in parallel after T012-T013.
- US1 test tasks T027-T029 can run in parallel.
- US2 test tasks T037-T040 can run in parallel.
- US3 test tasks T053-T054 can run in parallel.
- US4 test tasks T062-T065 can run in parallel.
- US5 test tasks T072-T073 can run in parallel.
- After Phase 2, US1, US2, US4, and US5 can be staffed in parallel; US3 should wait for US2 auth primitives.

## Parallel Example: User Story 1

```text
Task: "T027 [P] [US1] Create health contract test for GET /api/v1/health in apps/api/test/contract/health.contract-spec.ts"
Task: "T028 [P] [US1] Create Docker environment integration test for health readiness in apps/api/test/integration/health.e2e-spec.ts"
Task: "T029 [P] [US1] Create startup configuration validation unit test in apps/api/test/unit/config/env.schema.spec.ts"
```

## Parallel Example: User Story 2

```text
Task: "T037 [P] [US2] Create auth contract tests for login, logout, me, refresh, and admin probe in apps/api/test/contract/auth.contract-spec.ts"
Task: "T039 [P] [US2] Create password hashing unit test in apps/api/test/unit/auth/password.service.spec.ts"
Task: "T040 [P] [US2] Create token service unit test in apps/api/test/unit/auth/token.service.spec.ts"
```

## Parallel Example: User Story 5

```text
Task: "T072 [P] [US5] Create Prisma schema structure test for all foundation entities in apps/api/test/unit/database/schema-entities.spec.ts"
Task: "T073 [P] [US5] Create migration smoke test for PostgreSQL schema creation in apps/api/test/integration/database-migration.e2e-spec.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational infrastructure.
3. Complete Phase 3 User Story 1.
4. Stop and validate health, startup configuration failure, PostgreSQL readiness, Redis readiness, and Docker Compose startup through quickstart scenarios.

### Incremental Delivery

1. Deliver US1 to prove the backend starts and reports readiness.
2. Deliver US2 to add secure admin authentication and protected route rejection.
3. Deliver US3 to enforce ADMIN, EDITOR, and VIEWER roles.
4. Deliver US4 to harden response envelopes, validation errors, and exception behavior.
5. Deliver US5 to complete the reserved shared data foundation for later specs.

### Parallel Team Strategy

1. Complete Phase 1 and Phase 2 together.
2. Assign US1, US2, US4, and US5 to separate implementers once foundational work is done.
3. Start US3 after US2 exposes authentication primitives.
4. Finish with Phase 8 cross-checks across documentation, contracts, tests, Docker, and build validation.

## Format Validation

- All task rows use `- [ ] T###` checklist format.
- All user story phase tasks include `[US1]`, `[US2]`, `[US3]`, `[US4]`, or `[US5]`.
- Setup, foundational, and polish tasks do not include user story labels.
- All task descriptions include concrete file paths.
