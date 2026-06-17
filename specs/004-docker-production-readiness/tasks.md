# Tasks: Docker, Performance, Security, and Production Readiness

**Input**: Design documents from `specs/004-docker-production-readiness/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Test tasks are included because Spec 4 explicitly requires production-readiness verification across unit, contract, integration, smoke, security, traffic-limit, and health behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: Maps the task to the user story from `spec.md`.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, scripts, and documentation locations needed by all production-readiness work.

- [X] T001 Add production-readiness dependencies for security headers, compression, OpenAPI, Redis throttling, and queue support in `apps/api/package.json`
- [X] T002 Update lockfile after dependency installation in `pnpm-lock.yaml`
- [X] T003 [P] Add production-readiness script aliases for build, docs validation, and Docker smoke checks in `package.json`
- [X] T004 [P] Add API-level production-readiness script aliases in `apps/api/package.json`
- [X] T005 [P] Create production operations documentation skeleton in `docs/production-readiness.md`
- [X] T006 [P] Create Docker smoke validation script placeholder in `scripts/validate-docker-smoke.ps1`
- [X] T007 [P] Create production readiness test fixture helpers in `apps/api/test/support/production-readiness-fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared configuration, logging, cache, security, and documentation infrastructure that all user stories depend on.

**Critical**: No user story work should begin until this phase is complete.

- [X] T008 Extend environment schema with production mode, trusted origins, request limits, cache TTLs, docs flags, and queue settings in `apps/api/src/config/env.schema.ts`
- [X] T009 [P] Add unit tests for production environment validation and secret-safety failures in `apps/api/test/unit/config/env.schema.spec.ts`
- [X] T010 Create typed runtime configuration access helpers in `apps/api/src/config/runtime-config.service.ts`
- [X] T011 [P] Add unit tests for runtime configuration helper behavior in `apps/api/test/unit/config/runtime-config.service.spec.ts`
- [X] T012 Create shared secret and log redaction utility in `apps/api/src/common/utils/redaction.util.ts`
- [X] T013 [P] Add unit tests for secret and personal-data redaction in `apps/api/test/unit/common/redaction.util.spec.ts`
- [X] T014 Create shared operational logging service in `apps/api/src/common/services/operational-logger.service.ts`
- [X] T015 [P] Add unit tests for operational event formatting in `apps/api/test/unit/common/operational-logger.service.spec.ts`
- [X] T016 Create shared Redis cache service abstraction in `apps/api/src/database/cache.service.ts`
- [X] T017 [P] Add unit tests for cache get, set, delete, and key behavior in `apps/api/test/unit/database/cache.service.spec.ts`
- [X] T018 Create shared traffic limit service abstraction backed by Redis in `apps/api/src/common/services/traffic-limit.service.ts`
- [X] T019 [P] Add unit tests for traffic limit windows and public-safe rejection behavior in `apps/api/test/unit/common/traffic-limit.service.spec.ts`
- [X] T020 Add global security, compression, body-limit, CORS, and docs bootstrap wiring in `apps/api/src/main.ts`
- [X] T021 Register shared runtime config, cache, traffic limit, and operational logging providers in `apps/api/src/app.module.ts`

**Checkpoint**: Shared infrastructure is ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Run a Production-Like Backend Environment (Priority: P1) MVP

**Goal**: The backend and required dependencies start together from one documented environment with validated configuration, persistence, migration behavior, and health readiness.

**Independent Test**: Start the documented backend environment from a clean checkout using placeholder-safe configuration and verify the API, database, cache, persistence, and health status are available without manual dependency setup.

### Tests for User Story 1

- [X] T022 [P] [US1] Add contract tests for ready and not-ready health responses in `apps/api/test/contract/production-health.contract-spec.ts`
- [X] T023 [P] [US1] Add integration tests for dependency health checks and secret-free health output in `apps/api/test/integration/production-health.e2e-spec.ts`
- [X] T024 [P] [US1] Add Docker Compose smoke assertions for api, postgres, redis, volumes, and health checks in `scripts/validate-docker-smoke.ps1`
- [X] T025 [P] [US1] Add unit tests for production-safe migration command selection in `apps/api/test/unit/config/runtime-startup.spec.ts`

### Implementation for User Story 1

- [X] T026 [US1] Harden root Docker Compose service configuration, health dependencies, persistent volumes, and production command behavior in `docker-compose.yml`
- [X] T027 [US1] Harden API multi-stage image, runtime user, production dependency handling, and Prisma asset copying in `apps/api/Dockerfile`
- [X] T028 [US1] Update Docker build exclusions for source, test, upload, and generated artifact hygiene in `.dockerignore`
- [X] T029 [US1] Add complete placeholder-safe production and development environment documentation in `.env.example`
- [X] T030 [US1] Extend health service dependency checks and status mapping in `apps/api/src/health/health.service.ts`
- [X] T031 [US1] Update health response DTO for ready, not-ready, degraded, environment, timestamp, and dependency checks in `apps/api/src/health/dto/health-response.dto.ts`
- [X] T032 [US1] Update health controller response handling for readiness failures without leaking internals in `apps/api/src/health/health.controller.ts`
- [X] T033 [US1] Document Docker startup, migration, health, persistence, and recovery basics in `docs/production-readiness.md`

**Checkpoint**: User Story 1 is independently functional and can be validated through health checks and Docker smoke validation.

---

## Phase 4: User Story 2 - Release With Safe Configuration and Security Defaults (Priority: P1)

**Goal**: Production configuration, secrets, auth protections, trusted origins, request limits, upload limits, and public response hygiene are validated before launch.

**Independent Test**: Run missing/weak/invalid configuration cases and security-focused public/admin requests, then confirm unsafe releases fail before serving traffic and public/admin routes enforce the expected protections.

### Tests for User Story 2

- [X] T034 [P] [US2] Add contract tests for rate-limit response envelope and public-safe error shape in `apps/api/test/contract/production-security.contract-spec.ts`
- [X] T035 [P] [US2] Add integration tests for trusted CORS origins, rejected untrusted origins, and security headers in `apps/api/test/integration/security-defaults.e2e-spec.ts`
- [X] T036 [P] [US2] Add integration tests for missing production secrets and unsafe defaults failing startup in `apps/api/test/integration/production-config.e2e-spec.ts`
- [X] T037 [P] [US2] Add integration tests for login, chatbot, lead, and upload traffic limits in `apps/api/test/integration/traffic-limits.e2e-spec.ts`
- [X] T038 [P] [US2] Add unit tests for public response sanitization helpers in `apps/api/test/unit/common/public-response-safety.spec.ts`

### Implementation for User Story 2

- [X] T039 [US2] Add production secret strength and placeholder rejection rules in `apps/api/src/config/env.schema.ts`
- [X] T040 [US2] Apply trusted-origin CORS policy and security headers at bootstrap in `apps/api/src/main.ts`
- [X] T041 [US2] Add reusable traffic limit guard or interceptor in `apps/api/src/common/guards/traffic-limit.guard.ts`
- [X] T042 [US2] Apply login traffic limiting in `apps/api/src/modules/auth/auth.controller.ts`
- [X] T043 [US2] Apply chatbot traffic limiting in `apps/api/src/modules/chatbot/chatbot-sessions.controller.ts`
- [X] T044 [US2] Apply lead capture traffic limiting in `apps/api/src/modules/leads/leads.controller.ts`
- [X] T045 [US2] Apply upload traffic limiting and stricter request limits in `apps/api/src/modules/uploads/admin-uploads.controller.ts`
- [X] T046 [US2] Add public response safety utilities for removing private fields and internal data in `apps/api/src/common/utils/public-response-safety.util.ts`
- [X] T047 [US2] Verify services public mapper excludes admin-only fields in `apps/api/src/modules/services/services.mapper.ts`
- [X] T048 [US2] Verify blog public mapper excludes admin-only fields in `apps/api/src/modules/blog/blog.mapper.ts`
- [X] T049 [US2] Document production security defaults, secret handling, CORS, and traffic limits in `docs/production-readiness.md`

**Checkpoint**: User Story 2 is independently functional and can be validated through startup failure cases and security-focused API tests.

---

## Phase 5: User Story 3 - Keep Public Content Fast Under Normal Traffic (Priority: P2)

**Goal**: Public services, blog content, lead forms, and chatbot flows remain responsive under expected traffic using cache, pagination limits, and efficient queries.

**Independent Test**: Execute representative public traffic for services, blog, lead creation, and chatbot messages and confirm response-time, pagination, cache invalidation, and traffic-limit behavior match documented targets.

### Tests for User Story 3

- [X] T050 [P] [US3] Add unit tests for cache key generation and query-hash behavior in `apps/api/test/unit/common/cache-key.service.spec.ts`
- [X] T051 [P] [US3] Add integration tests for services public cache hit and invalidation after admin changes in `apps/api/test/integration/services-cache.e2e-spec.ts`
- [X] T052 [P] [US3] Add integration tests for blog public cache hit and invalidation after admin changes in `apps/api/test/integration/blog-cache.e2e-spec.ts`
- [X] T053 [P] [US3] Add integration tests for pagination maximum limits across public and admin lists in `apps/api/test/integration/pagination-limits.e2e-spec.ts`
- [X] T054 [P] [US3] Add lightweight performance validation tests for public content, leads, chatbot, and analytics in `apps/api/test/integration/performance-readiness.e2e-spec.ts`

### Implementation for User Story 3

- [X] T055 [US3] Add cache key service for public services, blog posts, and settings keys in `apps/api/src/common/services/cache-key.service.ts`
- [X] T056 [US3] Add Redis read-through caching for published services list and slug lookups in `apps/api/src/modules/services/services.service.ts`
- [X] T057 [US3] Invalidate services public cache after admin create, update, publish, unpublish, delete, and reorder operations in `apps/api/src/modules/services/services.service.ts`
- [X] T058 [US3] Add Redis read-through caching for published blog lists, blog slug lookups, category lists, and category post lists in `apps/api/src/modules/blog/blog-posts.service.ts`
- [X] T059 [US3] Invalidate blog public cache after admin post and category mutations in `apps/api/src/modules/blog/blog-posts.service.ts`
- [X] T060 [US3] Enforce global pagination defaults and maximum limits in `apps/api/src/common/dto/pagination-query.dto.ts`
- [X] T061 [US3] Update pagination utility to clamp invalid or oversized requests consistently in `apps/api/src/common/utils/pagination.util.ts`
- [X] T062 [US3] Document cache policy, invalidation rules, pagination limits, and performance validation targets in `docs/production-readiness.md`

**Checkpoint**: User Story 3 is independently functional and can be validated through cache, pagination, and performance-readiness tests.

---

## Phase 6: User Story 4 - Monitor Failures and Operational Events (Priority: P2)

**Goal**: Operators can investigate startup, dependency readiness, authentication failures, lead creation, chatbot failures, and notification failures without secret or personal-data leakage.

**Independent Test**: Trigger representative success and failure events and verify logs identify what happened, when it happened, and what action is needed while redacting secrets and unnecessary personal data.

### Tests for User Story 4

- [X] T063 [P] [US4] Add unit tests for operational event redaction across auth, lead, chatbot, and notification contexts in `apps/api/test/unit/common/operational-events.spec.ts`
- [X] T064 [P] [US4] Add integration tests for authentication failure and lead notification failure logging in `apps/api/test/integration/operational-logging.e2e-spec.ts`
- [X] T065 [P] [US4] Add unit tests for background job enqueue, retry, and failure event behavior in `apps/api/test/unit/jobs/background-job.service.spec.ts`

### Implementation for User Story 4

- [X] T066 [US4] Add background jobs module shell and queue provider wiring in `apps/api/src/modules/jobs/jobs.module.ts`
- [X] T067 [US4] Add background job service with enqueue, retry metadata, and safe payload references in `apps/api/src/modules/jobs/background-job.service.ts`
- [X] T068 [US4] Integrate lead notification dispatch with background job abstraction in `apps/api/src/modules/leads/lead-notification.service.ts`
- [X] T069 [US4] Add operational logging for startup and dependency readiness in `apps/api/src/main.ts`
- [X] T070 [US4] Add operational logging for authentication failures in `apps/api/src/modules/auth/auth.service.ts`
- [X] T071 [US4] Add operational logging for chatbot failures and safety fallbacks in `apps/api/src/modules/chatbot/chatbot.service.ts`
- [X] T072 [US4] Add operational logging for lead creation and notification failures in `apps/api/src/modules/leads/leads.service.ts`
- [X] T073 [US4] Document operational event categories, redaction rules, and troubleshooting guidance in `docs/production-readiness.md`

**Checkpoint**: User Story 4 is independently functional and can be validated through operational logging tests and manual failure scenarios.

---

## Phase 7: User Story 5 - Verify Launch Readiness Before Production (Priority: P3)

**Goal**: Release owners have a launch checklist, automated verification, API documentation, analytics overview, and recovery guidance with pass/fail evidence.

**Independent Test**: Run the production-readiness checklist against a release candidate and confirm every required item has pass, fail, or justified skipped evidence.

### Tests for User Story 5

- [X] T074 [P] [US5] Add contract tests for admin analytics overview response and authorization in `apps/api/test/contract/analytics-overview.contract-spec.ts`
- [X] T075 [P] [US5] Add integration tests for analytics overview aggregate counts in `apps/api/test/integration/analytics-overview.e2e-spec.ts`
- [X] T076 [P] [US5] Add contract tests for API documentation endpoint availability and route coverage in `apps/api/test/contract/api-docs.contract-spec.ts`
- [X] T077 [P] [US5] Add smoke checklist validation tests for quickstart commands and release evidence files in `apps/api/test/integration/release-readiness.e2e-spec.ts`

### Implementation for User Story 5

- [X] T078 [US5] Add analytics overview DTO in `apps/api/src/modules/analytics/dto/analytics-overview.dto.ts`
- [X] T079 [US5] Implement analytics overview service aggregating leads, blog, services, sessions, and messages in `apps/api/src/modules/analytics/analytics.service.ts`
- [X] T080 [US5] Implement protected analytics overview controller in `apps/api/src/modules/analytics/analytics.controller.ts`
- [X] T081 [US5] Register analytics service and controller in `apps/api/src/modules/analytics/analytics.module.ts`
- [X] T082 [US5] Add OpenAPI bootstrap configuration and docs exposure controls in `apps/api/src/main.ts`
- [X] T083 [US5] Add API documentation annotations for auth, services, blog, leads, chatbot, uploads, analytics, and health controllers in `apps/api/src/modules/auth/auth.controller.ts`, `apps/api/src/modules/services/services.controller.ts`, `apps/api/src/modules/blog/blog-posts.controller.ts`, `apps/api/src/modules/leads/leads.controller.ts`, `apps/api/src/modules/chatbot/chatbot-sessions.controller.ts`, `apps/api/src/modules/uploads/admin-uploads.controller.ts`, `apps/api/src/modules/analytics/analytics.controller.ts`, and `apps/api/src/health/health.controller.ts`
- [X] T084 [US5] Create release readiness checklist with pass, fail, skipped, owner, and evidence fields in `docs/release-readiness-checklist.md`
- [X] T085 [US5] Add backup, restore, rollback, smoke test, and dependency outage procedures in `docs/production-readiness.md`
- [X] T086 [US5] Update `quickstart.md` validation evidence references in `specs/004-docker-production-readiness/quickstart.md`

**Checkpoint**: User Story 5 is independently functional and can be validated through analytics, docs, and release-readiness checks.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, cleanup, documentation, and verification across all completed stories.

- [X] T087 [P] Update API README with production-readiness commands and Docker validation flow in `apps/api/README.md`
- [X] T088 [P] Update root README with Spec 4 production-readiness setup and verification summary in `README.md`
- [X] T089 [P] Review `.env.example`, `docs/production-readiness.md`, and `docs/release-readiness-checklist.md` for placeholder-only secrets and no real credentials
- [X] T090 Run clean-code review and refactor production code for SOLID, DRY, KISS, YAGNI compliance in `apps/api/src`
- [X] T091 Run test-guard review and remove brittle or duplicated test coverage in `apps/api/test`
- [X] T092 Run `pnpm build` and fix TypeScript or build issues in `apps/api/src`
- [X] T093 Run `pnpm test:unit` and fix unit test failures in `apps/api/test/unit`
- [X] T094 Run `pnpm test:contract` and fix contract test failures in `apps/api/test/contract`
- [X] T095 Run `pnpm test:integration` and fix integration test failures in `apps/api/test/integration`
- [ ] T096 Run `docker compose up --build` and validate runtime behavior using `scripts/validate-docker-smoke.ps1`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; can start immediately.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; recommended MVP.
- **Phase 4 US2**: Depends on Phase 2; can run in parallel with US1 after shared infrastructure exists, but production release needs both P1 stories.
- **Phase 5 US3**: Depends on Phase 2 and benefits from US2 traffic-limit infrastructure.
- **Phase 6 US4**: Depends on Phase 2 and can run in parallel with US3.
- **Phase 7 US5**: Depends on Phase 2 and benefits from all prior stories for complete release evidence.
- **Phase 8 Polish**: Depends on all desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundation; no dependency on other stories.
- **US2 (P1)**: Starts after Foundation; no dependency on US1, but production release requires both.
- **US3 (P2)**: Starts after Foundation; uses shared cache and traffic limit services.
- **US4 (P2)**: Starts after Foundation; uses shared operational logging and queue abstractions.
- **US5 (P3)**: Starts after Foundation; can implement analytics/docs independently, but full release checklist is strongest after US1-US4.

### Within Each User Story

- Write tests first and confirm they fail for the missing behavior.
- Implement shared models/services before controllers or bootstrap wiring.
- Complete the story checkpoint before moving to the next priority.
- Keep commits small by grouping tests and implementation around one behavior at a time.

### Parallel Opportunities

- Setup tasks T003-T007 can run in parallel.
- Foundational test tasks T009, T011, T013, T015, T017, and T019 can run in parallel after their target file contracts are clear.
- Test tasks within each user story can run in parallel.
- US1 and US2 can run in parallel after Phase 2 because they touch mostly different files.
- US3 and US4 can run in parallel after Phase 2 because caching/performance and operational jobs/logging are separate slices.
- Documentation polish tasks T087-T089 can run in parallel.

---

## Parallel Example: User Story 1

```text
Task: "T022 [P] [US1] Add contract tests for ready and not-ready health responses in apps/api/test/contract/production-health.contract-spec.ts"
Task: "T023 [P] [US1] Add integration tests for dependency health checks and secret-free health output in apps/api/test/integration/production-health.e2e-spec.ts"
Task: "T024 [P] [US1] Add Docker Compose smoke assertions for api, postgres, redis, volumes, and health checks in scripts/validate-docker-smoke.ps1"
Task: "T025 [P] [US1] Add unit tests for production-safe migration command selection in apps/api/test/unit/config/runtime-startup.spec.ts"
```

## Parallel Example: User Story 2

```text
Task: "T034 [P] [US2] Add contract tests for rate-limit response envelope and public-safe error shape in apps/api/test/contract/production-security.contract-spec.ts"
Task: "T035 [P] [US2] Add integration tests for trusted CORS origins, rejected untrusted origins, and security headers in apps/api/test/integration/security-defaults.e2e-spec.ts"
Task: "T036 [P] [US2] Add integration tests for missing production secrets and unsafe defaults failing startup in apps/api/test/integration/production-config.e2e-spec.ts"
Task: "T037 [P] [US2] Add integration tests for login, chatbot, lead, and upload traffic limits in apps/api/test/integration/traffic-limits.e2e-spec.ts"
```

## Parallel Example: User Story 3

```text
Task: "T050 [P] [US3] Add unit tests for cache key generation and query-hash behavior in apps/api/test/unit/common/cache-key.service.spec.ts"
Task: "T051 [P] [US3] Add integration tests for services public cache hit and invalidation after admin changes in apps/api/test/integration/services-cache.e2e-spec.ts"
Task: "T052 [P] [US3] Add integration tests for blog public cache hit and invalidation after admin changes in apps/api/test/integration/blog-cache.e2e-spec.ts"
Task: "T053 [P] [US3] Add integration tests for pagination maximum limits across public and admin lists in apps/api/test/integration/pagination-limits.e2e-spec.ts"
```

## Parallel Example: User Story 4

```text
Task: "T063 [P] [US4] Add unit tests for operational event redaction across auth, lead, chatbot, and notification contexts in apps/api/test/unit/common/operational-events.spec.ts"
Task: "T064 [P] [US4] Add integration tests for authentication failure and lead notification failure logging in apps/api/test/integration/operational-logging.e2e-spec.ts"
Task: "T065 [P] [US4] Add unit tests for background job enqueue, retry, and failure event behavior in apps/api/test/unit/jobs/background-job.service.spec.ts"
```

## Parallel Example: User Story 5

```text
Task: "T074 [P] [US5] Add contract tests for admin analytics overview response and authorization in apps/api/test/contract/analytics-overview.contract-spec.ts"
Task: "T075 [P] [US5] Add integration tests for analytics overview aggregate counts in apps/api/test/integration/analytics-overview.e2e-spec.ts"
Task: "T076 [P] [US5] Add contract tests for API documentation endpoint availability and route coverage in apps/api/test/contract/api-docs.contract-spec.ts"
Task: "T077 [P] [US5] Add smoke checklist validation tests for quickstart commands and release evidence files in apps/api/test/integration/release-readiness.e2e-spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational runtime, config, cache, traffic-limit, logging, and bootstrap infrastructure.
3. Complete Phase 3 User Story 1.
4. Stop and validate Docker startup, health readiness, persistence, and migration behavior.

### Production-Release Minimum

1. Complete MVP scope.
2. Complete Phase 4 User Story 2.
3. Validate fail-fast configuration, secret safety, CORS, admin protection, traffic limits, and public response hygiene.

### Incremental Delivery

1. Add US1 for production-like runtime.
2. Add US2 for security and safe configuration.
3. Add US3 for cache, pagination, and performance.
4. Add US4 for logs, failure visibility, and background-job readiness.
5. Add US5 for analytics, API docs, release checklist, and recovery docs.
6. Complete polish and run all verification commands.

### Parallel Team Strategy

1. Team completes Phase 1 and Phase 2 together.
2. Developer A implements US1 runtime and health.
3. Developer B implements US2 security defaults and traffic limits.
4. Developer C implements US3 caching and pagination after cache service is ready.
5. Developer D implements US4 logging and jobs after operational logger is ready.
6. Developer E implements US5 analytics/docs/readiness after controllers and docs conventions are settled.

---

## Notes

- `[P]` tasks touch different files and can run in parallel after prerequisite assumptions are clear.
- `[US#]` labels map directly to user stories in `spec.md`.
- Each user story includes test tasks before implementation tasks.
- Keep all production secrets out of committed files and test fixtures.
- Use clean-code-guard before presenting or committing production code.
- Use test-guard before presenting or committing test code.
