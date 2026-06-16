# Research: Core Backend Foundation

## Decision: Use NestJS as the backend framework

**Rationale**: The source backend specification allows NestJS or Express/Fastify and asks for clean modular architecture, global validation, guards, filters, interceptors, and domain modules. NestJS directly matches these needs through modules, controllers, services, guards, pipes, filters, and interceptors.

**Alternatives considered**: Express/Fastify with manual structure was considered, but it would require more project conventions to enforce modularity and shared behavior. NestJS provides those conventions from the start.

## Decision: Use TypeScript on Node.js LTS

**Rationale**: The source specification explicitly prefers Node.js and TypeScript. This gives strong typing for contracts, DTOs, configuration validation, and domain models while remaining aligned with the requested backend direction.

**Alternatives considered**: Plain JavaScript was rejected because it weakens validation and contract maintainability. Other runtimes were rejected because they conflict with the provided source direction.

## Decision: Use PostgreSQL with Prisma for durable data

**Rationale**: The source specification explicitly calls for PostgreSQL and Prisma. PostgreSQL fits the relational needs across users, content, leads, chat sessions, messages, settings, and file metadata. Prisma provides schema management, migrations, typed data access, and seed support for the initial admin user.

**Alternatives considered**: A document database was rejected because the foundational entities have clear relationships and need durable consistency. Direct SQL-only access was rejected because the project benefits from generated types and migration workflow.

## Decision: Use Redis as the supporting service

**Rationale**: Redis is requested by the source specification and is useful for future rate limiting, caching, session coordination, and background queues. In this foundation it must be included in environment startup and health reporting so later phases can rely on it.

**Alternatives considered**: Omitting Redis until later was rejected because the health and Docker foundation must prove the supporting service is available early.

## Decision: Use JWT access tokens with refresh-token support for admin sessions

**Rationale**: The source specification requires JWT-based authentication and recommends refresh tokens. Access tokens keep admin route checks stateless, while refresh tokens support session renewal and sign-out behavior.

**Alternatives considered**: Server-only sessions were rejected because they do not match the source direction. Long-lived access tokens without refresh tokens were rejected because they make sign-out and token rotation weaker.

## Decision: Hash passwords with bcrypt

**Rationale**: The source specification permits bcrypt or argon2. bcrypt is widely supported in Node.js deployments, straightforward to configure, and sufficient for the initial admin foundation.

**Alternatives considered**: Argon2 was considered and remains acceptable, but bcrypt is selected for broad compatibility and lower operational friction in the first backend phase.

## Decision: Validate environment configuration during startup

**Rationale**: The spec requires fail-fast behavior when required configuration is missing. A typed configuration validation layer should check environment name, port, database URL, Redis URL, JWT secret, token lifetime, AI credential placeholder, application URL, frontend URL, initial admin credentials, and storage driver.

**Alternatives considered**: Lazy validation during first use was rejected because it allows partially started environments and unclear runtime failures.

## Decision: Use a global response interceptor and global exception filter

**Rationale**: The spec requires standardized success and error envelopes. Centralized response and exception handling prevents each module from inventing different response shapes.

**Alternatives considered**: Per-controller response formatting was rejected because it increases duplication and risk of inconsistent API behavior.

## Decision: Use Docker Compose for local backend environment

**Rationale**: The source specification requires one Docker-based backend environment including the application, PostgreSQL, and Redis. Docker Compose gives the operator one consistent startup path and makes health validation repeatable.

**Alternatives considered**: Local host-installed dependencies were rejected because they do not meet the single environment requirement.

## Decision: Use Jest and Supertest for validation

**Rationale**: The source specification recommends Jest and Supertest. Unit tests cover services, guards, and validation helpers. Integration tests verify the externally visible behavior required by the spec: health, auth, protected route rejection, role checks, and error envelopes.

**Alternatives considered**: Manual-only validation was rejected because the foundation includes security and integration behavior that needs repeatable regression checks.
