# Quickstart: AI Chatbot, Knowledge Base, and Lead Capture

This guide validates Spec 3 after implementation.

## Prerequisites

- Spec 1 backend foundation is implemented.
- Spec 2 services, blog, and content management is implemented.
- `.env` exists with valid values from `.env.example`.
- Dependencies are installed with `pnpm install`.
- Database migrations and seed data are applied.
- An ADMIN account is available for lead administration.
- An ADMIN or EDITOR account is available for knowledge base administration.
- At least one active knowledge item exists for chatbot answer validation.
- `LEAD_NOTIFICATION_WEBHOOK_URL` may be blank; blank configuration stores leads and records skipped notification attempts.
- Chatbot limits can be tuned with `CHATBOT_VISITOR_LIMIT`, `CHATBOT_VISITOR_WINDOW_SECONDS`, `CHATBOT_SOURCE_LIMIT`, and `CHATBOT_SOURCE_WINDOW_SECONDS`.

## Setup

```powershell
pnpm install
pnpm --filter @digital-marketing-hub/api prisma:generate
pnpm --filter @digital-marketing-hub/api prisma:deploy
pnpm --filter @digital-marketing-hub/api seed
pnpm --filter @digital-marketing-hub/api dev
```

## Validation Scenarios

### 1. Knowledge Base Management

1. Sign in as ADMIN or EDITOR.
2. Create a draft knowledge item with title, slug, content, category, source type, and tags.
3. Update its content and tags.
4. Activate the item.
5. Confirm it appears in active knowledge filters.
6. Archive the item.
7. Confirm it is no longer eligible for chatbot answers.

Expected outcome:

- ADMIN and EDITOR can manage knowledge.
- VIEWER and unauthenticated users cannot mutate knowledge.
- Only active knowledge is used for public chatbot answers.

### 2. Visitor Chatbot Conversation

1. Start a public chatbot session from a source page.
2. Send a question about a published agency service.
3. Confirm the visitor message and assistant response are saved.
4. Fetch the session messages.
5. Ask about fake pricing, guaranteed results, legal advice, financial advice, and internal prompts.

Expected outcome:

- Messages are stored in chronological order.
- Assistant answers use active company knowledge when available.
- Assistant refuses unsafe or unsupported claims.
- Public responses do not expose internal prompts, private fields, or secrets.

### 3. Chatbot Lead Capture

1. Start a public chatbot session.
2. Send a buying-intent message such as a quote or consultation request.
3. Confirm the assistant asks for missing lead details when needed.
4. Provide contact details and service interest.
5. Confirm a lead is created and linked to the chat session.

Expected outcome:

- Chatbot-created leads use source `CHATBOT`.
- New leads start in `NEW` status.
- Related chat context is available to authorized admins.

### 4. Contact Form Lead Capture

1. Submit a public contact-form lead with a valid contact channel and message.
2. Sign in as ADMIN.
3. Open the admin lead list and detail view.
4. Update lead status, assignment, and details.
5. Delete the lead from normal workflows.

Expected outcome:

- Contact-form leads use source `CONTACT_FORM`.
- ADMIN can manage lead workflows.
- Public visitors cannot read admin lead details.

### 5. Lead Notifications

1. Configure new-lead notification delivery.
2. Create a chatbot lead.
3. Confirm a notification attempt includes contact details, service interest, message, and source.
4. Simulate notification failure.
5. Confirm the lead remains stored and failure details are visible for review.

Expected outcome:

- Notification delivery is attempted for new leads when configured.
- Notification failures do not block lead creation.
- Failed attempts are recorded without exposing secrets.

### 6. Chatbot Abuse Limits

1. Send messages within the normal visitor limit.
2. Send messages beyond the visitor limit.
3. Send messages beyond the broader source limit.

Expected outcome:

- Normal use remains allowed.
- Excessive use is temporarily rejected with retry guidance.
- Existing sessions and messages are not deleted when limits are exceeded.

## Automated Checks

```powershell
pnpm --filter @digital-marketing-hub/api build
pnpm --filter @digital-marketing-hub/api test
pnpm --filter @digital-marketing-hub/api test:unit
pnpm --filter @digital-marketing-hub/api test:contract
pnpm --filter @digital-marketing-hub/api test:integration
```

Expected outcome:

- Unit tests pass for safe assistant behavior, knowledge rules, lead intent detection, notification behavior, and abuse limits.
- Contract tests pass for chatbot, knowledge base, and lead APIs.
- Integration tests pass for public chatbot sessions, message persistence, lead capture, admin lead management, role enforcement, notification failure handling, and abuse limits.

## Contract Reference

The content API contract is documented in [contracts/ai-chatbot-leads.openapi.yaml](./contracts/ai-chatbot-leads.openapi.yaml).
