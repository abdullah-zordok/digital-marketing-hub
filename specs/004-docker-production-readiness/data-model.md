# Data Model: Docker, Performance, Security, and Production Readiness

## RuntimeEnvironment

**Purpose**: Describes a supported backend operating mode and required runtime services.

**Fields**:
- `name`: `development` or `production`
- `requiredServices`: application, data store, cache store
- `optionalServices`: worker, object storage emulator, database administration UI
- `startupCommand`: documented command for starting the environment
- `healthExpectation`: required healthy dependency states
- `persistentVolumes`: named persistent data stores
- `trustedOrigins`: configured browser origins allowed for the mode

**Relationships**:
- Has many `RuntimeConfiguration` entries
- Has many `HealthStatus` checks
- Has many `ReleaseReadinessCheck` results

**Validation Rules**:
- Production mode requires explicit secrets and trusted origins.
- Development mode may use safe local defaults only when documented.

## RuntimeConfiguration

**Purpose**: Defines runtime environment values, validation rules, and secret classification.

**Fields**:
- `key`: environment variable name
- `description`: operator-facing purpose
- `requiredIn`: supported modes where the value is required
- `exampleValue`: placeholder-safe example
- `secretClassification`: `secret`, `sensitive`, or `public`
- `validationRule`: expected format or allowed values
- `failureBehavior`: startup failure or optional warning

**Relationships**:
- Belongs to one or more `RuntimeEnvironment` modes
- Feeds `SecurityControl` and `HealthStatus`

**Validation Rules**:
- Secret values must not be real in sample files.
- Critical production values must fail startup when missing or unsafe.

## HealthStatus

**Purpose**: Reports application and dependency readiness without exposing secret data.

**Fields**:
- `status`: `ready`, `not_ready`, or `degraded`
- `environment`: current runtime mode
- `timestamp`: server timestamp
- `checks`: named dependency check outcomes
- `message`: operator-safe summary

**Relationships**:
- Reads dependency state from runtime services
- Supports `ReleaseReadinessCheck`

**Validation Rules**:
- Must not include connection strings, passwords, tokens, or raw secrets.
- Must distinguish application readiness from dependency outages.

## CachePolicy

**Purpose**: Defines cacheable public content and invalidation behavior.

**Fields**:
- `resource`: public resource category
- `keyPattern`: stable cache key format
- `ttlSeconds`: freshness window
- `invalidationTrigger`: admin action that refreshes or removes cached content
- `privacyLevel`: public-only or not cacheable

**Relationships**:
- Applies to public services, blog content, and public settings
- Invalidated by admin content changes

**Validation Rules**:
- Authenticated admin responses are not cached as public content.
- Cache keys must distinguish query parameters that affect response content.

## TrafficLimitPolicy

**Purpose**: Defines abuse protection for public and authentication-heavy flows.

**Fields**:
- `endpointGroup`: login, chatbot, lead capture, upload, or general API
- `identityKey`: visitor, account, network address, or combined key
- `maxRequests`: allowed count
- `windowSeconds`: measurement period
- `cooldownSeconds`: rejection period when exceeded
- `responseMessage`: public-safe rejection summary

**Relationships**:
- Uses runtime cache store for counters
- Supports `SecurityControl` and `ReleaseReadinessCheck`

**Validation Rules**:
- Protected public flows must have explicit limits.
- Rejections must not reveal account existence or sensitive internals.

## SecurityControl

**Purpose**: Tracks security safeguards required before production release.

**Fields**:
- `name`: safeguard name
- `scope`: global, public API, admin API, upload, chatbot, lead, auth
- `required`: boolean
- `configurationSource`: runtime configuration or static application setting
- `verificationMethod`: unit, contract, integration, smoke, or manual review

**Relationships**:
- Depends on `RuntimeConfiguration`
- Produces `ReleaseReadinessCheck` evidence

**Validation Rules**:
- Admin controls must require authentication and role checks.
- Public exposure controls must prevent private fields and secrets from leaking.

## OperationalEvent

**Purpose**: Represents production-relevant events emitted to logs or operational records.

**Fields**:
- `eventType`: startup, dependency readiness, API error, auth failure, lead created, chatbot failure, notification failure
- `severity`: info, warning, error
- `timestamp`: event time
- `correlationId`: request or operation correlation reference
- `safeContext`: redacted context for investigation

**Relationships**:
- May reference leads, chat sessions, or external notification attempts by safe identifiers
- Supports troubleshooting and readiness evidence

**Validation Rules**:
- Must redact passwords, tokens, raw secrets, full credentials, and unnecessary personal data.
- Must include enough non-sensitive context for operators to investigate.

## BackgroundJob

**Purpose**: Represents deferred production work that should not block public request completion.

**Fields**:
- `jobType`: lead notification, knowledge processing, email delivery, external sync
- `status`: queued, processing, succeeded, failed, retrying, abandoned
- `attemptCount`: number of processing attempts
- `nextRetryAt`: next retry timestamp when applicable
- `safePayloadReference`: redacted or indirect payload reference

**Relationships**:
- May originate from lead creation, chatbot knowledge changes, or integration events
- Emits `OperationalEvent` entries on failure

**State Transitions**:
- `queued` -> `processing` -> `succeeded`
- `queued` -> `processing` -> `failed` -> `retrying` -> `processing`
- `retrying` -> `abandoned` after retry policy is exhausted

## AnalyticsOverview

**Purpose**: Aggregates admin dashboard production metrics.

**Fields**:
- `totalLeads`
- `newLeads`
- `qualifiedLeads`
- `totalBlogPosts`
- `publishedBlogPosts`
- `totalServices`
- `publishedServices`
- `totalChatbotSessions`
- `totalChatbotMessages`
- `generatedAt`

**Relationships**:
- Reads aggregate counts from leads, blog, services, chat sessions, and chat messages.

**Validation Rules**:
- Accessible only to authenticated admin users with permitted roles.
- Counts must be non-negative integers and generated at request time or from a documented safe cache.

## ReleaseReadinessCheck

**Purpose**: Records verification status for launch readiness.

**Fields**:
- `checkId`: stable identifier
- `category`: docker, configuration, security, performance, observability, documentation, recovery, API
- `status`: pass, fail, skipped
- `blocking`: boolean
- `evidence`: link or summary of verification evidence
- `owner`: responsible role
- `checkedAt`: timestamp

**Relationships**:
- Uses `RuntimeEnvironment`, `SecurityControl`, `HealthStatus`, and `RecoveryProcedure`

**Validation Rules**:
- Skipped checks require justification.
- Blocking failures prevent release approval.

## RecoveryProcedure

**Purpose**: Defines backup, restore, rollback, and troubleshooting guidance.

**Fields**:
- `procedureName`: backup, restore, rollback, smoke test, dependency outage
- `trigger`: condition requiring the procedure
- `stepsReference`: documentation location
- `targetDurationMinutes`: expected completion time
- `lastRehearsedAt`: optional rehearsal timestamp
- `lastResult`: pass, fail, or not rehearsed

**Relationships**:
- Produces `ReleaseReadinessCheck` evidence
- References `RuntimeEnvironment`

**Validation Rules**:
- Restore procedure must be rehearsed before production launch.
- Failure must produce actionable troubleshooting notes.
