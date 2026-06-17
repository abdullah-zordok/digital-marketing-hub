# Research: Docker, Performance, Security, and Production Readiness

## Decision: Keep one Docker Compose environment with `api`, `postgres`, and `redis`

**Rationale**: The source specification requires one Docker-based backend environment. The repository already has a root `docker-compose.yml` with these services, health checks, volumes, and an API build target, so the production-readiness work should harden that environment instead of adding another orchestration path.

**Alternatives considered**: Separate development and production Compose files were rejected for this phase because they increase drift. A Kubernetes-first setup was rejected as outside the small-to-medium agency scope.

## Decision: Use explicit development and production modes through configuration and documented commands

**Rationale**: The same Compose environment can support different safety behavior through `NODE_ENV`, validated environment variables, startup commands, and documented workflows. Production must use safe migration deployment and strict secrets; development can allow local defaults.

**Alternatives considered**: Silent defaults for production were rejected because they hide deployment mistakes. Fully separate runtime images were deferred until operational needs justify them.

## Decision: Harden the existing multi-stage API image

**Rationale**: The current API Dockerfile already builds the NestJS app and copies compiled output plus Prisma assets into a runtime image. Spec 4 should tighten image behavior with production dependency handling, predictable startup, least-privilege execution where practical, and clear migration/runtime separation.

**Alternatives considered**: Running the API directly from source inside the production container was rejected because it is slower and less predictable. Creating a separate worker image is deferred until background work is implemented.

## Decision: Continue using Zod-based fail-fast environment validation

**Rationale**: The project already validates environment variables in `apps/api/src/config/env.schema.ts`. Extending that schema keeps configuration rules centralized and testable while supporting secret classification, trusted origins, body limits, rate limits, cache TTLs, and documentation.

**Alternatives considered**: Manual validation in `main.ts` was rejected because it scatters rules and is harder to test. Runtime-only validation after the app starts was rejected because critical production mistakes must fail before serving traffic.

## Decision: Use production-safe database migration commands

**Rationale**: Development should continue using migration creation workflows, while production-like startup should apply existing migrations only. Failed migration execution must stop startup and leave clear logs.

**Alternatives considered**: Automatic schema push in production was rejected because it can bypass migration history. Manual database mutation outside the app workflow was rejected because it is not repeatable.

## Decision: Add Redis-backed caching for high-read public content

**Rationale**: Services, blog lists, blog detail pages, and public settings are high-read and low-write. Redis is already a required dependency and can support read-through caching with explicit invalidation after admin content changes.

**Alternatives considered**: In-memory caching was rejected because it does not work consistently across restarts or multiple app instances. Caching every response was rejected because authenticated and dynamic responses need stricter freshness and privacy.

## Decision: Enforce bounded pagination and request limits globally

**Rationale**: List endpoints, search queries, body payloads, uploads, chatbot messages, and lead forms need predictable limits to protect the API under public traffic. Existing pagination utilities and DTO validation should be extended rather than replaced.

**Alternatives considered**: Per-controller ad hoc limits were rejected because they drift and are easy to miss. Unlimited search and list requests were rejected as a direct production performance risk.

## Decision: Use Redis-backed traffic limiting for public abuse-prone flows

**Rationale**: Login, chatbot, lead capture, and uploads need rate limits that survive process restarts and work across future multiple API instances. Redis is already part of the runtime and avoids process-local counters.

**Alternatives considered**: Pure in-memory counters were rejected for production-like behavior. External WAF-only protection was rejected because application-level limits remain necessary.

## Decision: Apply security headers, trusted CORS origins, validation, and response hygiene at the application boundary

**Rationale**: The backend exposes public and admin APIs. Security defaults should be configured once at startup, backed by config validation, and verified through contract/integration tests.

**Alternatives considered**: Relying only on a reverse proxy was rejected because local and production-like runs should behave safely. Per-route manual response filtering was rejected where shared interceptors/mappers already exist.

## Decision: Use structured operational logs with redaction rules

**Rationale**: Spec 4 requires startup, errors, auth failures, lead events, chatbot failures, and webhook failures to be visible without leaking secrets or unnecessary personal data. A structured logger or consistent logging adapter gives tests and operators a predictable shape.

**Alternatives considered**: Console-only unstructured logs were rejected because they are hard to inspect and redact consistently. Logging full request/response bodies was rejected because it creates privacy and secret leakage risk.

## Decision: Prepare background jobs with Redis queue support

**Rationale**: Lead notifications, future email delivery, knowledge processing, and external sync workflows need deferred execution. A Redis-backed queue matches the existing dependency model and can start with a small module boundary.

**Alternatives considered**: Inline-only notification work was rejected because it couples user-facing requests to external provider latency. A separate message broker was deferred as unnecessary for the current scale.

## Decision: Implement the analytics overview as an authenticated admin contract

**Rationale**: The required overview aggregates counts across existing leads, services, blog posts, chatbot sessions, and chatbot messages. It belongs in the existing analytics module with role-protected admin access.

**Alternatives considered**: Calculating analytics on the frontend was rejected because it would expose too much data and duplicate counting rules. Building a full analytics warehouse was rejected as outside scope.

## Decision: Add API documentation at a stable documentation endpoint

**Rationale**: Integrators and frontend developers need discoverable contracts for auth, content, leads, chatbot, uploads, analytics, and health capabilities. The documentation should be generated from the backend contract annotations and protected or environment-gated if needed.

**Alternatives considered**: Static hand-written endpoint lists were rejected because they drift from code. Exposing docs without environment controls was rejected for production deployments where public docs are not desired.

## Decision: Validate with unit, contract, integration, and smoke checks

**Rationale**: Production readiness crosses configuration, Docker runtime, security, performance limits, API contracts, and user flows. The existing test structure already separates unit, contract, and integration tests; quickstart smoke checks cover Docker runtime behavior.

**Alternatives considered**: Only manual Docker testing was rejected because it misses regressions. Only unit tests were rejected because runtime wiring and route behavior need integration coverage.
