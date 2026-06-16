# Tasks: AI Chatbot, Knowledge Base, and Lead Capture

**Input**: Design documents from `specs/003-ai-chatbot-leads/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ai-chatbot-leads.openapi.yaml`, `quickstart.md`

**Tests**: Included because the feature specification and implementation plan require unit, contract, and integration validation for chatbot, knowledge, leads, notifications, role enforcement, and abuse limits.

**Organization**: Tasks are grouped by user story to preserve independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare module folders, configuration surfaces, and shared test fixtures used by all stories.

- [X] T001 Create chatbot DTO and test support folders in apps/api/src/modules/chatbot/dto and apps/api/test/unit/chatbot
- [X] T002 Create leads DTO and test support folders in apps/api/src/modules/leads/dto and apps/api/test/unit/leads
- [X] T003 [P] Add chatbot and lead notification environment variables to apps/api/src/config/env.schema.ts and apps/api/.env.example
- [X] T004 [P] Add Spec 3 OpenAPI contract file reference to apps/api/test/contract/ai-chatbot-leads.contract-spec.ts
- [X] T005 [P] Add chatbot and lead fixture builders in apps/api/test/support/chatbot-leads-fixtures.ts
- [X] T006 [P] Add authenticated ADMIN, EDITOR, and VIEWER helpers for Spec 3 tests in apps/api/test/support/content-auth.fixture.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence, shared repositories, shared DTOs, module wiring, and safety boundaries that every story depends on.

**Critical**: No user story work can begin until this phase is complete.

- [X] T007 Add LeadNotificationStatus enum, LeadNotification model, and Lead notifications relation in apps/api/prisma/schema.prisma
- [X] T008 Create Prisma migration for LeadNotification persistence in apps/api/prisma/migrations/20260616190000_ai_chatbot_leads/migration.sql
- [X] T009 [P] Extend database entity coverage tests for ChatSession, ChatMessage, KnowledgeBaseItem, Lead, and LeadNotification in apps/api/test/unit/database/schema-entities.spec.ts
- [X] T010 [P] Create shared chatbot response sanitization utility in apps/api/src/modules/chatbot/chatbot-safety.util.ts
- [X] T011 [P] Create shared lead validation utility in apps/api/src/modules/leads/lead-validation.util.ts
- [X] T012 Create ChatbotRepository for sessions, messages, and active knowledge queries in apps/api/src/modules/chatbot/chatbot.repository.ts
- [X] T013 Create LeadsRepository for public and admin lead persistence in apps/api/src/modules/leads/leads.repository.ts
- [X] T014 Wire chatbot providers and exports in apps/api/src/modules/chatbot/chatbot.module.ts
- [X] T015 Wire leads providers and exports in apps/api/src/modules/leads/leads.module.ts

**Checkpoint**: Prisma schema, repositories, modules, and shared validation boundaries are ready for story implementation.

---

## Phase 3: User Story 1 - Ask the Marketing Assistant (Priority: P1) MVP

**Goal**: Public visitors can ask service and marketing questions and receive safe, company-grounded assistant answers.

**Independent Test**: Start a visitor conversation, ask service-fit and unsafe questions, then verify answers use active knowledge when available and safely refuse unsupported claims.

### Tests for User Story 1

- [X] T016 [P] [US1] Add contract tests for POST /chatbot/sessions/{sessionId}/messages assistant responses in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts
- [X] T017 [P] [US1] Add unit tests for assistant safety refusal and fallback behavior in apps/api/test/unit/chatbot/ai-response.service.spec.ts
- [X] T018 [P] [US1] Add integration tests for service-fit, unsupported pricing, guarantees, legal advice, and missing-knowledge prompts in apps/api/test/integration/chatbot-assistant.e2e-spec.ts

### Implementation for User Story 1

- [X] T019 [P] [US1] Create assistant response DTOs in apps/api/src/modules/chatbot/dto/chatbot-response.dto.ts
- [X] T020 [P] [US1] Implement active knowledge matching helpers in apps/api/src/modules/chatbot/knowledge-search.service.ts
- [X] T021 [US1] Implement safe assistant generation and deterministic fallback logic in apps/api/src/modules/chatbot/ai-response.service.ts
- [X] T022 [US1] Persist assistant metadata without exposing prompts or ranking internals in apps/api/src/modules/chatbot/chatbot.repository.ts
- [X] T023 [US1] Add assistant message orchestration to apps/api/src/modules/chatbot/chatbot.service.ts
- [X] T024 [US1] Expose send-message endpoint behavior in apps/api/src/modules/chatbot/chatbot-sessions.controller.ts
- [X] T025 [US1] Register AI response and knowledge search providers in apps/api/src/modules/chatbot/chatbot.module.ts
- [X] T026 [US1] Seed at least one active knowledge item for assistant validation in apps/api/prisma/seed.ts

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Manage Chatbot Knowledge (Priority: P1)

**Goal**: ADMIN and EDITOR users can create, update, activate, archive, delete, browse, and filter chatbot knowledge items.

**Independent Test**: Sign in as ADMIN or EDITOR, manage a knowledge item through its lifecycle, verify VIEWER and unauthenticated writes are rejected, and confirm archived knowledge is not used by the assistant.

### Tests for User Story 2

- [X] T027 [P] [US2] Add contract tests for /admin/knowledge-base endpoints in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts
- [X] T028 [P] [US2] Add unit tests for knowledge status transitions and active-only eligibility in apps/api/test/unit/chatbot/knowledge-base.service.spec.ts
- [X] T029 [P] [US2] Add integration tests for ADMIN, EDITOR, VIEWER, and unauthenticated knowledge workflows in apps/api/test/integration/knowledge-base-management.e2e-spec.ts

### Implementation for User Story 2

- [X] T030 [P] [US2] Create knowledge base create, update, and query DTOs in apps/api/src/modules/chatbot/dto/knowledge-base.dto.ts
- [X] T031 [US2] Implement knowledge base create, update, activate, archive, soft-delete, and filter rules in apps/api/src/modules/chatbot/knowledge-base.service.ts
- [X] T032 [US2] Add unique slug and soft-delete checks for knowledge persistence in apps/api/src/modules/chatbot/chatbot.repository.ts
- [X] T033 [US2] Implement protected knowledge base controller endpoints in apps/api/src/modules/chatbot/knowledge-base.controller.ts
- [X] T034 [US2] Apply JwtAuthGuard, RolesGuard, and ADMIN/EDITOR role metadata in apps/api/src/modules/chatbot/knowledge-base.controller.ts
- [X] T035 [US2] Register knowledge base controller and service in apps/api/src/modules/chatbot/chatbot.module.ts
- [X] T036 [US2] Exclude non-active and deleted knowledge from assistant retrieval in apps/api/src/modules/chatbot/knowledge-search.service.ts
- [X] T037 [US2] Add knowledge seed examples with DRAFT, ACTIVE, and ARCHIVED statuses in apps/api/prisma/seed.ts

**Checkpoint**: User Story 2 is independently functional and protected by role-based access.

---

## Phase 5: User Story 3 - Preserve Chat Sessions and Messages (Priority: P1)

**Goal**: Public visitors can create sessions, send multi-message conversations, retrieve their own message history, and receive clear errors for inaccessible sessions.

**Independent Test**: Start a session, send multiple messages, fetch history, verify order and roles, then verify closed, missing, and wrong-visitor access fails.

### Tests for User Story 3

- [X] T038 [P] [US3] Add contract tests for POST /chatbot/sessions and GET /chatbot/sessions/{sessionId}/messages in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts
- [X] T039 [P] [US3] Add unit tests for chat session lifecycle and message ordering in apps/api/test/unit/chatbot/chatbot.service.spec.ts
- [X] T040 [P] [US3] Add integration tests for session creation, multi-message history, closed sessions, and wrong visitor access in apps/api/test/integration/chatbot-sessions.e2e-spec.ts

### Implementation for User Story 3

- [X] T041 [P] [US3] Create chat session and message request DTOs in apps/api/src/modules/chatbot/dto/chat-session.dto.ts
- [X] T042 [US3] Implement session creation, visitor scoping, open-session validation, and history retrieval in apps/api/src/modules/chatbot/chatbot.service.ts
- [X] T043 [US3] Implement chronological message persistence and retrieval in apps/api/src/modules/chatbot/chatbot.repository.ts
- [X] T044 [US3] Implement public session and history endpoints in apps/api/src/modules/chatbot/chatbot-sessions.controller.ts
- [X] T045 [US3] Return friendly not-found, closed-session, and inaccessible-session errors from apps/api/src/modules/chatbot/chatbot.service.ts
- [X] T046 [US3] Register chatbot sessions controller in apps/api/src/modules/chatbot/chatbot.module.ts

**Checkpoint**: User Story 3 is independently functional for public session continuity.

---

## Phase 6: User Story 4 - Capture Qualified Leads (Priority: P2)

**Goal**: Public visitors can create leads from chatbot or contact form, and ADMIN users can view, update, assign, status-change, and delete leads.

**Independent Test**: Create a chatbot lead and a contact-form lead, verify required details, source, status, and chat linkage, then manage the lead as ADMIN.

### Tests for User Story 4

- [X] T047 [P] [US4] Add contract tests for POST /leads and /admin/leads endpoints in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts
- [X] T048 [P] [US4] Add unit tests for buying-intent detection and missing-detail prompts in apps/api/test/unit/chatbot/lead-intent.service.spec.ts
- [X] T049 [P] [US4] Add unit tests for public lead validation and initial status rules in apps/api/test/unit/leads/leads.service.spec.ts
- [X] T050 [P] [US4] Add integration tests for chatbot lead capture, contact-form lead capture, and admin lead workflows in apps/api/test/integration/leads-management.e2e-spec.ts

### Implementation for User Story 4

- [X] T051 [P] [US4] Create public lead and admin lead DTOs in apps/api/src/modules/leads/dto/leads.dto.ts
- [X] T052 [P] [US4] Create lead intent extraction result DTOs in apps/api/src/modules/chatbot/dto/lead-intent.dto.ts
- [X] T053 [US4] Implement rule-based buying-intent and missing-detail detection in apps/api/src/modules/chatbot/lead-intent.service.ts
- [X] T054 [US4] Implement public lead creation, chatbot lead linking, NEW initial status, and validation in apps/api/src/modules/leads/leads.service.ts
- [X] T055 [US4] Implement public contact-form lead endpoint in apps/api/src/modules/leads/leads.controller.ts
- [X] T056 [US4] Implement ADMIN lead list, detail, update, assignment, status-change, and soft-delete workflows in apps/api/src/modules/leads/admin-leads.controller.ts
- [X] T057 [US4] Apply JwtAuthGuard, RolesGuard, and ADMIN-only role metadata in apps/api/src/modules/leads/admin-leads.controller.ts
- [X] T058 [US4] Link chatbot-created leads back to sessions during message orchestration in apps/api/src/modules/chatbot/chatbot.service.ts

**Checkpoint**: User Story 4 is independently functional for public lead creation and admin lead management.

---

## Phase 7: User Story 5 - Notify External Workflows of New Leads (Priority: P2)

**Goal**: New leads trigger best-effort external notifications without blocking lead creation when delivery fails or is not configured.

**Independent Test**: Create chatbot and contact-form leads with notification configured, verify payload and attempt record, then simulate failure and verify lead creation still succeeds.

### Tests for User Story 5

- [X] T059 [P] [US5] Add unit tests for notification payload, skipped, sent, and failed states in apps/api/test/unit/leads/lead-notification.service.spec.ts
- [X] T060 [P] [US5] Add integration tests for successful, failed, and unconfigured notification delivery in apps/api/test/integration/lead-notifications.e2e-spec.ts

### Implementation for User Story 5

- [X] T061 [P] [US5] Add lead notification configuration types in apps/api/src/modules/leads/lead-notification.config.ts
- [X] T062 [US5] Implement LeadNotification persistence methods in apps/api/src/modules/leads/leads.repository.ts
- [X] T063 [US5] Implement best-effort webhook delivery and failure recording in apps/api/src/modules/leads/lead-notification.service.ts
- [X] T064 [US5] Trigger notification attempts after successful public lead creation in apps/api/src/modules/leads/leads.service.ts
- [X] T065 [US5] Include notification attempt summaries in admin lead detail responses in apps/api/src/modules/leads/admin-leads.controller.ts
- [X] T066 [US5] Register LeadNotificationService in apps/api/src/modules/leads/leads.module.ts

**Checkpoint**: User Story 5 is independently functional and notification failures do not block leads.

---

## Phase 8: User Story 6 - Prevent Chatbot Abuse (Priority: P3)

**Goal**: Public chatbot messaging is limited by visitor and broader source while normal usage continues to work.

**Independent Test**: Send messages within limits, exceed visitor and source thresholds, then verify friendly retry responses and preserved sessions.

### Tests for User Story 6

- [X] T067 [P] [US6] Add unit tests for visitor and source limit decisions in apps/api/test/unit/chatbot/chatbot-rate-limit.service.spec.ts
- [X] T068 [P] [US6] Add integration tests for normal use, visitor limit, and source limit behavior in apps/api/test/integration/chatbot-rate-limits.e2e-spec.ts

### Implementation for User Story 6

- [X] T069 [P] [US6] Add chatbot rate-limit configuration values to apps/api/src/config/env.schema.ts and apps/api/.env.example
- [X] T070 [US6] Implement Redis-backed visitor and source counters in apps/api/src/modules/chatbot/chatbot-rate-limit.service.ts
- [X] T071 [US6] Add in-memory fallback behavior for test environments in apps/api/src/modules/chatbot/chatbot-rate-limit.service.ts
- [X] T072 [US6] Check abuse limits before assistant response generation in apps/api/src/modules/chatbot/chatbot.service.ts
- [X] T073 [US6] Return friendly retry guidance for exceeded limits in apps/api/src/modules/chatbot/chatbot-sessions.controller.ts
- [X] T074 [US6] Register rate-limit service in apps/api/src/modules/chatbot/chatbot.module.ts

**Checkpoint**: User Story 6 is independently functional for public abuse protection.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Align docs, contracts, generated clients, and full validation after desired stories are complete.

- [X] T075 [P] Update quickstart validation details after implementation in specs/003-ai-chatbot-leads/quickstart.md
- [X] T076 [P] Update OpenAPI contract if implementation response shapes changed in specs/003-ai-chatbot-leads/contracts/ai-chatbot-leads.openapi.yaml
- [X] T077 Update API README with chatbot, knowledge, lead, notification, and rate-limit configuration in apps/api/README.md
- [X] T078 Run Prisma generation and verify generated client from apps/api/prisma/schema.prisma
- [X] T079 Run full API build validation for apps/api/package.json
- [X] T080 Run unit, contract, and integration test suites for apps/api/package.json
- [X] T081 Review production code with clean-code-guard standards and tests with test-guard standards across apps/api/src and apps/api/test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 9)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Ask the Marketing Assistant (P1)**: Starts after Foundational and is the MVP.
- **US2 Manage Chatbot Knowledge (P1)**: Starts after Foundational; improves the active knowledge used by US1 but remains independently testable through admin APIs.
- **US3 Preserve Chat Sessions and Messages (P1)**: Starts after Foundational; supports US1 persistence and remains independently testable through public session APIs.
- **US4 Capture Qualified Leads (P2)**: Starts after Foundational; can integrate with US3 for chatbot-created lead linkage.
- **US5 Notify External Workflows (P2)**: Depends on US4 lead creation behavior.
- **US6 Prevent Chatbot Abuse (P3)**: Starts after Foundational; integrates with US3 message submission.

### Within Each User Story

- Tests are written first and should fail before implementation.
- DTOs and utilities precede services.
- Repositories precede services where persistence is required.
- Services precede controllers.
- Module registration follows implemented providers and controllers.

---

## Parallel Opportunities

- Setup tasks T003 through T006 can run in parallel.
- Foundational tasks T009 through T011 can run in parallel after schema review.
- Test tasks within each user story can run in parallel.
- DTO-only tasks marked [P] can run in parallel with unit test creation.
- US1, US2, and US3 can proceed in parallel after Foundational if developers coordinate edits to shared chatbot files.
- US4 and US6 can proceed after Foundational, but both touch chatbot service orchestration and should coordinate those edits.

## Parallel Example: User Story 1

```text
Task: "T016 [P] [US1] Add contract tests for POST /chatbot/sessions/{sessionId}/messages assistant responses in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts"
Task: "T017 [P] [US1] Add unit tests for assistant safety refusal and fallback behavior in apps/api/test/unit/chatbot/ai-response.service.spec.ts"
Task: "T018 [P] [US1] Add integration tests for service-fit, unsupported pricing, guarantees, legal advice, and missing-knowledge prompts in apps/api/test/integration/chatbot-assistant.e2e-spec.ts"
Task: "T019 [P] [US1] Create assistant response DTOs in apps/api/src/modules/chatbot/dto/chatbot-response.dto.ts"
Task: "T020 [P] [US1] Implement active knowledge matching helpers in apps/api/src/modules/chatbot/knowledge-search.service.ts"
```

## Parallel Example: User Story 2

```text
Task: "T027 [P] [US2] Add contract tests for /admin/knowledge-base endpoints in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts"
Task: "T028 [P] [US2] Add unit tests for knowledge status transitions and active-only eligibility in apps/api/test/unit/chatbot/knowledge-base.service.spec.ts"
Task: "T029 [P] [US2] Add integration tests for ADMIN, EDITOR, VIEWER, and unauthenticated knowledge workflows in apps/api/test/integration/knowledge-base-management.e2e-spec.ts"
Task: "T030 [P] [US2] Create knowledge base create, update, and query DTOs in apps/api/src/modules/chatbot/dto/knowledge-base.dto.ts"
```

## Parallel Example: User Story 3

```text
Task: "T038 [P] [US3] Add contract tests for POST /chatbot/sessions and GET /chatbot/sessions/{sessionId}/messages in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts"
Task: "T039 [P] [US3] Add unit tests for chat session lifecycle and message ordering in apps/api/test/unit/chatbot/chatbot.service.spec.ts"
Task: "T040 [P] [US3] Add integration tests for session creation, multi-message history, closed sessions, and wrong visitor access in apps/api/test/integration/chatbot-sessions.e2e-spec.ts"
Task: "T041 [P] [US3] Create chat session and message request DTOs in apps/api/src/modules/chatbot/dto/chat-session.dto.ts"
```

## Parallel Example: User Story 4

```text
Task: "T047 [P] [US4] Add contract tests for POST /leads and /admin/leads endpoints in apps/api/test/contract/ai-chatbot-leads.contract-spec.ts"
Task: "T048 [P] [US4] Add unit tests for buying-intent detection and missing-detail prompts in apps/api/test/unit/chatbot/lead-intent.service.spec.ts"
Task: "T049 [P] [US4] Add unit tests for public lead validation and initial status rules in apps/api/test/unit/leads/leads.service.spec.ts"
Task: "T050 [P] [US4] Add integration tests for chatbot lead capture, contact-form lead capture, and admin lead workflows in apps/api/test/integration/leads-management.e2e-spec.ts"
Task: "T051 [P] [US4] Create public lead and admin lead DTOs in apps/api/src/modules/leads/dto/leads.dto.ts"
Task: "T052 [P] [US4] Create lead intent extraction result DTOs in apps/api/src/modules/chatbot/dto/lead-intent.dto.ts"
```

## Parallel Example: User Story 5

```text
Task: "T059 [P] [US5] Add unit tests for notification payload, skipped, sent, and failed states in apps/api/test/unit/leads/lead-notification.service.spec.ts"
Task: "T060 [P] [US5] Add integration tests for successful, failed, and unconfigured notification delivery in apps/api/test/integration/lead-notifications.e2e-spec.ts"
Task: "T061 [P] [US5] Add lead notification configuration types in apps/api/src/modules/leads/lead-notification.config.ts"
```

## Parallel Example: User Story 6

```text
Task: "T067 [P] [US6] Add unit tests for visitor and source limit decisions in apps/api/test/unit/chatbot/chatbot-rate-limit.service.spec.ts"
Task: "T068 [P] [US6] Add integration tests for normal use, visitor limit, and source limit behavior in apps/api/test/integration/chatbot-rate-limits.e2e-spec.ts"
Task: "T069 [P] [US6] Add chatbot rate-limit configuration values to apps/api/src/config/env.schema.ts and apps/api/.env.example"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational persistence, repositories, module wiring, and shared safety utilities.
3. Complete Phase 3 User Story 1.
4. Stop and validate assistant behavior independently with unit, contract, and integration tests.

### Incremental Delivery

1. Deliver US1 assistant behavior for the visitor-facing MVP.
2. Deliver US2 knowledge management to make assistant content maintainable.
3. Deliver US3 chat session continuity and history.
4. Deliver US4 public and admin lead workflows.
5. Deliver US5 notification attempts.
6. Deliver US6 abuse limits.
7. Complete Phase 9 validation and documentation.

### Validation Commands

```powershell
pnpm --filter @digital-marketing-hub/api prisma:generate
pnpm --filter @digital-marketing-hub/api build
pnpm --filter @digital-marketing-hub/api test:unit
pnpm --filter @digital-marketing-hub/api test:contract
pnpm --filter @digital-marketing-hub/api test:integration
```

