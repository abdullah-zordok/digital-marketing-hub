# Research: AI Chatbot, Knowledge Base, and Lead Capture

## Decision: Use active knowledge items as the first grounding source

**Rationale**: The specification requires the assistant to answer from approved company knowledge and excludes advanced RAG infrastructure from this feature. Existing `KnowledgeBaseItem` records already represent the required content boundary and can be searched by active status, title, category, tags, and content.

**Alternatives considered**: Automatic embeddings and vector search were deferred because the source specification says future RAG support is expected but not required for this controlled backend phase.

## Decision: Centralize chatbot safety rules before and after response generation

**Rationale**: The assistant must not invent prices, guarantee results, claim unavailable services, provide legal or financial advice, expose prompts, or reveal internal data. Safety checks should exist around prompt construction and response persistence so public responses are safe even when knowledge is missing.

**Alternatives considered**: Relying only on the assistant provider was rejected because the backend must enforce product-specific safety rules.

## Decision: Provide a deterministic fallback assistant response when AI generation is unavailable

**Rationale**: Acceptance scenarios require a safe fallback when no relevant knowledge exists or response generation is unavailable. The fallback should acknowledge limits, avoid unsupported claims, and offer lead capture or follow-up.

**Alternatives considered**: Failing the conversation outright was rejected because it creates a poor visitor experience and blocks lead capture.

## Decision: Detect buying intent with explicit rule-based signals in the first version

**Rationale**: The feature needs predictable validation for phrases such as quote requests, consultation requests, contact details, and service help. Rule-based detection is transparent, testable, and sufficient for the first version.

**Alternatives considered**: AI-only lead scoring was deferred because it is harder to validate deterministically and can be added later as a scoring enhancement.

## Decision: Store partial leads only when contact or service-interest details are present

**Rationale**: The assistant should ask for missing details when intent is detected, but the lead list should remain useful. A lead should be created when enough information exists to support follow-up, while incomplete conversations remain in chat history.

**Alternatives considered**: Creating a lead for every buying-intent message was rejected because it would create noisy admin workflows.

## Decision: New leads start as NEW

**Rationale**: The existing lead status model includes `NEW`, and the success criteria describe sales follow-up. `NEW` is the correct initial status for chatbot and contact-form leads.

**Alternatives considered**: Starting chatbot leads as `QUALIFIED` was rejected because qualification requires follow-up or richer scoring outside this feature.

## Decision: Lead notifications are best-effort and non-blocking

**Rationale**: The specification requires the lead to remain stored even when notification fails. Notification attempts should be recorded for operational review without blocking the visitor.

**Alternatives considered**: Making notification success mandatory was rejected because it risks losing valid leads during external workflow outages.

## Decision: Add a lead notification attempt entity

**Rationale**: The existing schema has leads but no durable record for webhook attempts or failures. The specification requires failed delivery to be visible for investigation.

**Alternatives considered**: Logging failures only was rejected because logs are less discoverable for admin workflows and are not naturally tied to a lead record.

## Decision: Enforce chatbot abuse limits by visitor and source

**Rationale**: The source specification recommends visitor and IP limits. The first version should enforce 20 messages per visitor per 10 minutes and 100 messages per source per hour, while keeping the thresholds configurable during implementation.

**Alternatives considered**: A single global limit was rejected because it can unfairly block normal users or fail to stop concentrated abuse.

## Decision: Keep public session access tied to visitor/session identifiers

**Rationale**: Public visitors do not authenticate, but they need to retrieve their own session messages. The session flow should use a visitor identifier and session identifier to avoid exposing other conversations.

**Alternatives considered**: Making chat history fully public by session ID alone was rejected because guessed IDs could expose conversation data.
