# Implementation Plan: AI Chatbot, Knowledge Base, and Lead Capture

**Branch**: `N/A - no git branch detected` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-ai-chatbot-leads/spec.md`

**Note**: This plan builds on Spec 1 and Spec 2. It extends the existing NestJS API, Prisma schema, JWT auth and role guards, response envelope, validation behavior, and placeholder `chatbot` and `leads` modules.

## Summary

Implement public chatbot sessions and messages, approved knowledge base management, safe assistant responses, chatbot-driven and contact-form lead capture, admin lead management, new-lead notification attempts, and chatbot abuse limits. Public visitors can start conversations, send messages, receive safe company-grounded answers, and submit leads. Admins and editors manage chatbot knowledge; admins manage leads. The implementation reuses the current backend foundation, PostgreSQL data model, Redis capability, standardized responses, and Jest/Supertest test setup.

## Technical Context

**Language/Version**: TypeScript on Node.js LTS

**Primary Dependencies**: Existing NestJS API, Prisma Client, PostgreSQL, Redis client, JWT auth and role guards, class-validator/class-transformer, OpenAI-compatible AI client boundary, Jest, Supertest

**Storage**: PostgreSQL for knowledge base items, chat sessions, messages, leads, and lead notification attempts; Redis for chatbot abuse counters; existing service/blog content can seed or support knowledge content

**Testing**: Jest unit tests for knowledge status rules, safe assistant behavior, lead intent/detail extraction, notification behavior, and rate-limit rules; Supertest integration tests for public chatbot and lead flows plus protected admin workflows; contract tests against OpenAPI documentation

**Target Platform**: Linux-compatible backend service running under the existing Docker Compose environment

**Project Type**: Backend web service

**Performance Goals**: Chat message submission returns a stored visitor message and assistant reply within an acceptable interactive wait during validation; message history returns chronologically ordered bounded results; admin lists are paginated; abuse-limit checks run before costly assistant response generation

**Constraints**: Public chatbot responses must not expose internal prompts, private fields, secrets, or ranking internals; assistant must refuse unsafe claims; only active knowledge can ground public answers; ADMIN can manage leads and knowledge; EDITOR can manage knowledge; VIEWER cannot mutate this feature; lead creation must not fail solely because notification delivery fails

**Scale/Scope**: Chatbot conversations, knowledge management, lead capture, admin lead workflows, lead webhook notification attempts, and chatbot abuse limits for the Digital Marketing Hub backend; no public frontend screens, multilingual chatbot behavior, analytics dashboard, CRM sync, Google Sheets sync, or production monitoring in this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file still contains placeholder text and no ratified project principles. No custom governance gates are enforceable at this time.

Baseline gates applied for this feature:

- PASS: Scope is limited to chatbot, knowledge, leads, notifications, and abuse limits.
- PASS: Plan reuses the existing backend architecture from Specs 1 and 2.
- PASS: Protected admin write workflows are role-gated.
- PASS: Public responses are explicitly limited to safe fields and exclude internal prompts, secrets, and admin-only data.
- PASS: Plan includes unit, integration, and contract validation for chatbot, knowledge, lead, notification, and rate-limit behavior.

Post-design re-check:

- PASS: `research.md` resolves safe response behavior, knowledge retrieval, lead intent detection, notification delivery, and abuse-limit decisions.
- PASS: `data-model.md` maps all entities, relationships, validation rules, and state transitions needed by the specification.
- PASS: `contracts/ai-chatbot-leads.openapi.yaml` documents public and admin interfaces.
- PASS: `quickstart.md` defines end-to-end validation scenarios for chatbot, knowledge management, leads, notifications, roles, and abuse limits.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot-leads/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ai-chatbot-leads.openapi.yaml
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
    |   |   |-- types/
    |   |   `-- utils/
    |   |-- modules/
    |   |   |-- chatbot/
    |   |   |   |-- dto/
    |   |   |   |-- chatbot.module.ts
    |   |   |   |-- chatbot-sessions.controller.ts
    |   |   |   |-- chatbot.service.ts
    |   |   |   |-- chatbot.repository.ts
    |   |   |   |-- knowledge-base.controller.ts
    |   |   |   |-- knowledge-base.service.ts
    |   |   |   |-- ai-response.service.ts
    |   |   |   |-- lead-intent.service.ts
    |   |   |   `-- chatbot-rate-limit.service.ts
    |   |   |-- leads/
    |   |   |   |-- dto/
    |   |   |   |-- leads.module.ts
    |   |   |   |-- leads.controller.ts
    |   |   |   |-- admin-leads.controller.ts
    |   |   |   |-- leads.service.ts
    |   |   |   |-- leads.repository.ts
    |   |   |   `-- lead-notification.service.ts
    |   |   `-- auth/
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

**Structure Decision**: Extend the existing `apps/api` backend. Keep chatbot/session/knowledge behavior in `chatbot`, keep lead capture/admin/notification behavior in `leads`, and share auth, role guards, validation, response envelopes, Prisma, Redis, and test support from the existing backend.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
