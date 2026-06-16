# Data Model: AI Chatbot, Knowledge Base, and Lead Capture

## Shared Rules

- Public chatbot responses expose only safe assistant content, session identifiers, message identifiers, roles, metadata intended for frontend rendering, and timestamps.
- Public chatbot responses never expose internal prompts, knowledge ranking internals, secrets, credential data, deleted records, or admin-only fields.
- Knowledge is eligible for chatbot answers only when status is `ACTIVE` and the record is not deleted.
- Mutating knowledge actions require ADMIN or EDITOR role.
- Mutating lead administration actions require ADMIN role.
- VIEWER cannot mutate chatbot, knowledge, lead, or notification records.
- Lead creation is not blocked by notification delivery failure.

## KnowledgeBaseItem

Represents company-approved knowledge used to answer visitor questions.

**Fields**

- `id`: UUID, required
- `title`: required
- `slug`: required, unique public/admin address
- `content`: required approved knowledge body
- `category`: optional grouping
- `tags`: optional normalized labels
- `sourceType`: required enum, one of `SERVICE`, `FAQ`, `POLICY`, `GENERAL`, `BLOG`
- `status`: required enum, one of `DRAFT`, `ACTIVE`, `ARCHIVED`
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May reference service or blog concepts by source type and content, but does not require direct source synchronization in this feature.

**Validation Rules**

- `title`, `slug`, `content`, and `sourceType` are required.
- `slug` must be unique among non-deleted knowledge items.
- `content` must be non-empty before activation.
- Tags must be normalized for filtering and retrieval.
- Draft or archived items must not be used in public chatbot answers.

**State Transitions**

- `DRAFT` -> `ACTIVE`
- `ACTIVE` -> `ARCHIVED`
- `ARCHIVED` -> `ACTIVE`
- Any non-deleted state -> soft deleted

## ChatSession

Represents a visitor conversation.

**Fields**

- `id`: UUID, required
- `visitorId`: optional visitor identifier
- `leadId`: optional related lead reference
- `status`: required enum, one of `OPEN`, `CLOSED`
- `sourcePage`: optional page where the chat started
- `userAgent`: optional visitor browser context
- `ipAddress`: optional source address for abuse controls
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Has many chat messages.
- May belong to one lead when a conversation becomes a lead.

**Validation Rules**

- New sessions start as `OPEN`.
- Messages can be added only to open, non-deleted sessions.
- Public message retrieval must be scoped to the session and visitor context.

**State Transitions**

- `OPEN` -> `CLOSED`
- Any non-deleted state -> soft deleted if needed for administrative cleanup

## ChatMessage

Represents one message in a chat session.

**Fields**

- `id`: UUID, required
- `sessionId`: required session reference
- `role`: required enum, one of `USER`, `ASSISTANT`, `SYSTEM`, `TOOL`
- `content`: required message text
- `metadata`: optional structured metadata for public-safe rendering or internal tracing
- `createdAt`: required timestamp

**Relationships**

- Belongs to one chat session.

**Validation Rules**

- Public visitors can create only `USER` messages.
- Assistant generation creates `ASSISTANT` messages.
- Public history responses return messages in chronological order.
- Empty or excessively long content is rejected.
- Internal prompt content is not exposed in public history.

## Lead

Represents a potential client captured from chatbot, contact form, or other public sources.

**Fields**

- `id`: UUID, required
- `name`: optional contact name
- `email`: optional contact email
- `phone`: optional phone number
- `companyName`: optional company
- `serviceInterest`: optional service interest
- `budgetRange`: optional budget range
- `message`: optional visitor message
- `source`: required enum, one of `CHATBOT`, `CONTACT_FORM`, `SERVICE_PAGE`, `BLOG_PAGE`, `MANUAL`
- `status`: required enum, one of `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`
- `assignedTo`: optional user assignment
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May be assigned to one user.
- May have one or more related chat sessions.
- May have many lead notification attempts.

**Validation Rules**

- New public leads require at least one valid contact channel and either service interest or message.
- Contact-form leads use source `CONTACT_FORM`.
- Chatbot-created leads use source `CHATBOT` and link to the related chat session when available.
- New leads start with status `NEW`.
- Status changes must use a valid lead status.
- Deleted leads are excluded from normal admin workflows.

**State Transitions**

- `NEW` -> `CONTACTED`
- `CONTACTED` -> `QUALIFIED`
- `QUALIFIED` -> `PROPOSAL_SENT`
- Any active sales state -> `WON` or `LOST`
- Any non-deleted state -> soft deleted

## LeadNotification

Represents a new-lead external workflow notification attempt.

**Fields**

- `id`: UUID, required
- `leadId`: required lead reference
- `target`: notification target label or URL-safe identifier
- `status`: required enum, one of `PENDING`, `SENT`, `FAILED`, `SKIPPED`
- `payload`: structured summary of the notification payload
- `errorMessage`: optional failure reason
- `attemptedAt`: optional delivery timestamp
- `createdAt`: required timestamp
- `updatedAt`: required timestamp

**Relationships**

- Belongs to one lead.

**Validation Rules**

- A lead notification attempt is created for new leads when notification delivery is configured.
- Failure does not rollback or delete the lead.
- Payload summaries must not contain secrets.

**State Transitions**

- `PENDING` -> `SENT`
- `PENDING` -> `FAILED`
- `PENDING` -> `SKIPPED`

## User

Represents an authenticated admin-side user.

**Fields Used by This Feature**

- `id`: UUID
- `email`: unique identity
- `role`: `ADMIN`, `EDITOR`, or `VIEWER`
- `status`: active or disabled

**Relationships**

- Can be assigned leads.
- Can manage knowledge when authorized.

**Validation Rules**

- Only active ADMIN users can mutate lead admin workflows.
- Active ADMIN and EDITOR users can mutate knowledge base workflows.
