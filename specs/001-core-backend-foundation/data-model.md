# Data Model: Core Backend Foundation

## Shared Rules

- All foundational business records use UUID identifiers.
- Records include `createdAt` and `updatedAt` unless explicitly creation-only.
- Records that may need historical preservation use `deletedAt` for non-destructive removal.
- Public content entities use slugs that are unique within their content type.
- Private credential fields are never returned in public or admin identity responses.
- Search-heavy and lookup-heavy fields are indexed during implementation planning and migration work.

## User

Represents a person who can access protected admin capabilities.

**Fields**

- `id`: UUID, required
- `email`: required, unique, normalized email address
- `name`: optional display name
- `passwordHash`: required, private
- `role`: required enum, one of `ADMIN`, `EDITOR`, `VIEWER`
- `status`: required enum, one of `ACTIVE`, `DISABLED`
- `lastLoginAt`: optional timestamp
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May author future blog posts.
- May be assigned future leads.

**Validation Rules**

- Email must be valid and unique.
- Password hash must never be exposed in responses.
- Role must be one of the supported role values.

**State Transitions**

- `ACTIVE` -> `DISABLED`
- `DISABLED` -> `ACTIVE`
- Any non-deleted state -> soft deleted

## Service

Represents a marketing service reserved for future content management and public display.

**Fields**

- `id`: UUID, required
- `name`: required
- `title`: required
- `slug`: required, unique
- `shortDescription`: optional
- `fullDescription`: optional
- `icon`: optional
- `coverImage`: optional
- `benefits`: optional structured content
- `processSteps`: optional structured content
- `targetAudience`: optional structured content
- `expectedResults`: optional structured content
- `faqs`: optional structured content
- `status`: required enum, one of `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `sortOrder`: required number, defaults to 0
- `seoTitle`: optional
- `seoDescription`: optional
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May be referenced by leads as service interest in later phases.
- May feed future knowledge base items.

**Validation Rules**

- Slug must be unique among services.
- Public interfaces may only expose published, non-deleted services in later specs.

**State Transitions**

- `DRAFT` -> `PUBLISHED`
- `PUBLISHED` -> `DRAFT`
- `DRAFT` or `PUBLISHED` -> `ARCHIVED`
- Any non-deleted state -> soft deleted

## BlogCategory

Represents a grouping for blog posts.

**Fields**

- `id`: UUID, required
- `name`: required
- `slug`: required, unique
- `description`: optional
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Has many blog posts.

**Validation Rules**

- Slug must be unique among blog categories.
- Category cannot be hard-deleted while active posts depend on it.

## BlogPost

Represents a marketing article reserved for future blog functionality.

**Fields**

- `id`: UUID, required
- `title`: required
- `slug`: required, unique
- `excerpt`: optional
- `content`: optional rich content
- `coverImage`: optional
- `authorId`: optional user reference
- `categoryId`: optional blog category reference
- `tags`: optional list of labels
- `status`: required enum, one of `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `publishedAt`: optional timestamp
- `seoTitle`: optional
- `seoDescription`: optional
- `readingTime`: optional number
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Belongs to one author user when assigned.
- Belongs to one blog category when assigned.

**Validation Rules**

- Slug must be unique among blog posts.
- `publishedAt` is required when status is `PUBLISHED`.

**State Transitions**

- `DRAFT` -> `PUBLISHED`
- `PUBLISHED` -> `DRAFT`
- `DRAFT` or `PUBLISHED` -> `ARCHIVED`
- Any non-deleted state -> soft deleted

## Lead

Represents a potential client inquiry reserved for future lead capture and admin management.

**Fields**

- `id`: UUID, required
- `name`: optional
- `email`: optional
- `phone`: optional
- `companyName`: optional
- `serviceInterest`: optional
- `budgetRange`: optional
- `message`: optional
- `source`: required enum, one of `CHATBOT`, `CONTACT_FORM`, `SERVICE_PAGE`, `BLOG_PAGE`, `MANUAL`
- `status`: required enum, one of `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`
- `assignedTo`: optional user reference
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May be assigned to a user.
- May be linked to chat sessions.

**Validation Rules**

- At least one contact method is required when a lead is created in later lead workflows.
- Status must be one of the supported lead status values.

**State Transitions**

- `NEW` -> `CONTACTED`
- `CONTACTED` -> `QUALIFIED`
- `QUALIFIED` -> `PROPOSAL_SENT`
- `PROPOSAL_SENT` -> `WON`
- `PROPOSAL_SENT` -> `LOST`
- Any active status -> soft deleted

## ChatSession

Represents a visitor conversation container reserved for future chatbot functionality.

**Fields**

- `id`: UUID, required
- `visitorId`: optional visitor reference
- `leadId`: optional lead reference
- `status`: required enum, one of `OPEN`, `CLOSED`
- `sourcePage`: optional
- `userAgent`: optional
- `ipAddress`: optional, private operational data
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Has many chat messages.
- May link to one lead.

**Validation Rules**

- Private request-context fields are not exposed publicly unless explicitly safe.

**State Transitions**

- `OPEN` -> `CLOSED`
- Any non-deleted state -> soft deleted

## ChatMessage

Represents a single message in a chat session.

**Fields**

- `id`: UUID, required
- `sessionId`: required chat session reference
- `role`: required enum, one of `USER`, `ASSISTANT`, `SYSTEM`, `TOOL`
- `content`: required
- `metadata`: optional structured metadata
- `createdAt`: required timestamp

**Relationships**

- Belongs to one chat session.

**Validation Rules**

- Content must not be empty.
- System and tool messages are internal unless explicitly exposed by future chatbot contracts.

## KnowledgeBaseItem

Represents future chatbot knowledge content.

**Fields**

- `id`: UUID, required
- `title`: required
- `slug`: required, unique
- `content`: required
- `category`: optional
- `tags`: optional list of labels
- `sourceType`: required enum, one of `SERVICE`, `FAQ`, `POLICY`, `GENERAL`, `BLOG`
- `status`: required enum, one of `DRAFT`, `ACTIVE`, `ARCHIVED`
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May reference service or blog content in later specs.

**Validation Rules**

- Slug must be unique among knowledge base items.
- Only active items are eligible for future chatbot retrieval.

**State Transitions**

- `DRAFT` -> `ACTIVE`
- `ACTIVE` -> `ARCHIVED`
- `ARCHIVED` -> `ACTIVE`
- Any non-deleted state -> soft deleted

## SiteSetting

Represents configurable platform settings.

**Fields**

- `id`: UUID, required
- `key`: required, unique
- `value`: required structured value
- `isPublic`: required boolean
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- None required for the foundation.

**Validation Rules**

- Key must be unique.
- Private settings must never be returned from public interfaces.

## UploadedFile

Represents metadata for files stored by future upload workflows.

**Fields**

- `id`: UUID, required
- `filename`: required
- `originalName`: required
- `storageDriver`: required
- `storagePath`: required, private
- `publicUrl`: optional
- `mimeType`: required
- `sizeBytes`: required number
- `purpose`: optional
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May be referenced by services, blog posts, knowledge base items, or settings in later phases.

**Validation Rules**

- File metadata must preserve the original upload name and stored location.
- Private storage paths are not exposed unless they are also safe public URLs.
