# Feature Specification: AI Chatbot, Knowledge Base, and Lead Capture

**Feature Branch**: `003-ai-chatbot-leads`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Read all the file digital-marketing-hub-backend-specs.md and Create the specification of this Spec 3 - AI Chatbot, Knowledge Base, and Lead Capture"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask the Marketing Assistant (Priority: P1)

As a website visitor, I need to ask questions about the agency's services and marketing approach, so I can understand whether the agency can help my business before speaking to a person.

**Why this priority**: The chatbot is the primary visitor-facing value of this feature and must provide useful, safe answers before lead capture or admin workflows matter.

**Independent Test**: Start a visitor conversation, ask questions about services, business fit, process, quotation requests, and consultation booking, then verify the assistant answers from approved company knowledge and refuses unsafe or unsupported claims.

**Acceptance Scenarios**:

1. **Given** active company knowledge exists, **When** a visitor asks which service fits their business, **Then** the assistant recommends relevant service options and explains the reasoning in plain language.
2. **Given** a visitor asks for fake pricing, guaranteed results, unavailable services, legal advice, financial advice, or internal instructions, **When** the assistant responds, **Then** it avoids the unsafe claim and provides a safe alternative or escalation path.
3. **Given** a visitor asks how to get a quotation or book a consultation, **When** the assistant responds, **Then** it explains the next step and can invite the visitor to share contact details.
4. **Given** no relevant active knowledge is available for a question, **When** the assistant responds, **Then** it acknowledges the limitation and offers to collect the visitor's question for follow-up.

---

### User Story 2 - Manage Chatbot Knowledge (Priority: P1)

As an admin or editor, I need to create, update, activate, archive, delete, and browse chatbot knowledge items, so the assistant answers from accurate and approved company information.

**Why this priority**: Reliable assistant answers depend on controlled knowledge. Without this workflow, the chatbot cannot be trusted for public visitor guidance.

**Independent Test**: Sign in as an authorized content user, create a draft knowledge item, update its content and classification, activate it, verify the assistant can use it, archive it, and verify it is no longer used for public answers.

**Acceptance Scenarios**:

1. **Given** an authorized admin or editor is signed in, **When** they create a knowledge item with required fields, **Then** it is saved as manageable knowledge content.
2. **Given** a draft knowledge item exists, **When** an authorized user activates it, **Then** it becomes eligible for chatbot answers.
3. **Given** an active knowledge item exists, **When** an authorized user archives it, **Then** it is excluded from new chatbot answers while remaining available for admin review.
4. **Given** a viewer or unauthenticated user attempts to change knowledge content, **When** the request is evaluated, **Then** the change is rejected.
5. **Given** admins browse knowledge content, **When** they filter by status, category, source type, or tag, **Then** matching items are returned without exposing unrelated private information.

---

### User Story 3 - Preserve Chat Sessions and Messages (Priority: P1)

As a website visitor, I need my conversation to continue across messages, so the assistant can respond with context and the business can review conversations that become leads.

**Why this priority**: Chat sessions and message history are required for a coherent assistant experience and for tying qualified conversations to leads.

**Independent Test**: Start a conversation, send multiple visitor messages, receive assistant replies, fetch the conversation history, and verify the message order, roles, source page, and session status are preserved.

**Acceptance Scenarios**:

1. **Given** a visitor opens the chatbot, **When** a new conversation starts, **Then** a session is created with visitor context and an open status.
2. **Given** an open session exists, **When** the visitor sends a message, **Then** the visitor message and assistant response are both saved in the conversation history.
3. **Given** a visitor requests session messages, **When** the session exists and is accessible, **Then** messages are returned in chronological order.
4. **Given** a visitor sends a message to a closed, missing, or inaccessible session, **When** the system evaluates it, **Then** the message is rejected with a friendly error.

---

### User Story 4 - Capture Qualified Leads (Priority: P2)

As a potential client, I need to share my contact details and service needs through the chatbot or contact form, so the agency can follow up with a relevant proposal or consultation.

**Why this priority**: Lead capture converts helpful chatbot interactions into business opportunities, but initial assistant answers can still deliver value before full lead workflows are complete.

**Independent Test**: Create leads from a chatbot conversation and from a contact form, verify required details and source are stored, confirm missing details are requested when buying intent is detected, and verify admins can view, update, assign, status-change, and delete leads.

**Acceptance Scenarios**:

1. **Given** a visitor shows buying intent in chat, **When** required lead details are missing, **Then** the assistant asks for the missing details without interrupting unrelated questions.
2. **Given** a visitor provides enough contact and interest information, **When** a lead is created, **Then** it is stored with source, message, status, and any related chat session.
3. **Given** a visitor submits a contact form, **When** required fields are valid, **Then** a new lead is created with the correct source.
4. **Given** an authorized admin views leads, **When** they filter or open a lead, **Then** they can see the lead details and related conversation context where available.
5. **Given** an authorized admin updates a lead's status, assignment, or details, **When** the update is saved, **Then** the lead reflects the change in admin workflows.

---

### User Story 5 - Notify External Workflows of New Leads (Priority: P2)

As an agency operator, I need new leads to trigger an external notification, so the sales process can begin quickly outside the website backend.

**Why this priority**: Timely lead notification improves follow-up speed and supports operational workflows, but the system still stores leads even if notification delivery is unavailable.

**Independent Test**: Create a new chatbot lead and contact-form lead, verify a notification payload is prepared and sent to the configured external workflow, then simulate delivery failure and verify the lead is still stored and the failure is recorded for admin attention.

**Acceptance Scenarios**:

1. **Given** a new lead is created and notification delivery is configured, **When** the lead is saved, **Then** the notification includes the lead's name, phone, email, service interest, message, and source.
2. **Given** notification delivery fails, **When** a new lead is created, **Then** the lead remains stored and the failure is visible for operational review.
3. **Given** notification delivery is not configured, **When** a new lead is created, **Then** the system stores the lead and does not block the visitor experience.

---

### User Story 6 - Prevent Chatbot Abuse (Priority: P3)

As the agency, I need chatbot usage limits, so public visitor messaging cannot be abused or used to degrade service for real prospects.

**Why this priority**: Abuse protection is important for public availability and cost control, but it can be layered after the core chat and lead workflows exist.

**Independent Test**: Send repeated messages from the same visitor and source over defined windows, verify normal use remains allowed, and verify excessive use is rejected with a friendly retry message.

**Acceptance Scenarios**:

1. **Given** a visitor sends messages within the allowed amount, **When** messages are submitted, **Then** the chatbot continues responding normally.
2. **Given** a visitor sends too many messages in a short period, **When** another message is submitted, **Then** the request is rejected with a clear retry message.
3. **Given** many visitors use the chatbot from the same network source, **When** combined usage exceeds the broader abuse threshold, **Then** additional messages are temporarily limited without deleting existing sessions.

### Edge Cases

- A visitor asks about pricing, guarantees, unavailable services, legal advice, financial advice, or internal instructions.
- A visitor asks a question that has no relevant active knowledge.
- The assistant response cannot be generated or is unavailable.
- A visitor submits empty, excessively long, unsafe, or repeated messages.
- A visitor tries to read or write messages for a missing, closed, or inaccessible session.
- Knowledge items have duplicate public addresses, invalid status transitions, unsafe content, or archived source material.
- An editor attempts an action outside allowed content permissions.
- A viewer attempts to create, update, activate, archive, delete, or assign restricted records.
- A lead is missing required contact or service-interest information.
- A lead notification fails, times out, or is not configured.
- Lead details include invalid email, phone, budget, or service-interest values.
- A visitor or network source exceeds normal chatbot usage limits.
- Existing chat sessions reference deleted or merged leads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow public visitors to start a chatbot conversation.
- **FR-002**: The system MUST allow public visitors to send messages within an open conversation.
- **FR-003**: The system MUST save visitor messages and assistant messages with role, content, metadata where relevant, and creation time.
- **FR-004**: The system MUST allow public visitors to retrieve messages for their active conversation.
- **FR-005**: The system MUST preserve conversation context across multiple messages in the same session.
- **FR-006**: The chatbot MUST answer as a professional digital marketing assistant representing the agency.
- **FR-007**: The chatbot MUST help visitors understand available services, business fit, general marketing strategy, company process, quotation requests, and consultation booking.
- **FR-008**: The chatbot MUST use active approved knowledge content when answering company-specific questions.
- **FR-009**: The chatbot MUST avoid inventing prices, guarantees, unavailable services, legal advice, financial advice, system instructions, or internal data.
- **FR-010**: The chatbot MUST provide a safe fallback when relevant active knowledge is unavailable.
- **FR-011**: The system MUST allow authorized admins and editors to create knowledge base items.
- **FR-012**: The system MUST allow authorized admins and editors to update knowledge base items.
- **FR-013**: The system MUST allow authorized admins and editors to activate and archive knowledge base items.
- **FR-014**: The system MUST allow authorized admins and editors to delete knowledge base items from normal workflows while preserving historical integrity where required.
- **FR-015**: The system MUST allow authorized users to browse and filter knowledge base items by status, category, source type, tag, and search text.
- **FR-016**: The system MUST prevent inactive, archived, deleted, or draft knowledge from being used for public chatbot answers.
- **FR-017**: The system MUST detect buying intent during chatbot conversations.
- **FR-018**: The system MUST ask for missing lead details when buying intent is detected and details are not yet available.
- **FR-019**: The system MUST create a lead from chatbot conversations when enough contact and interest information is provided.
- **FR-020**: The system MUST allow public visitors to submit a contact-form lead outside the chatbot.
- **FR-021**: The system MUST store lead name, email, phone, company name, service interest, budget range, message, source, status, assignment, and audit timestamps where available.
- **FR-022**: The system MUST link chatbot-created leads to the related chat session.
- **FR-023**: The system MUST assign new leads an initial status suitable for sales follow-up.
- **FR-024**: The system MUST allow authorized admins to list, read, update, assign, status-change, and delete leads from normal workflows.
- **FR-025**: The system MUST prevent public visitors from reading admin-only lead details.
- **FR-026**: The system MUST send a new-lead notification to a configured external workflow when notification delivery is available.
- **FR-027**: The system MUST include lead identity, contact details, service interest, message, and source in new-lead notifications.
- **FR-028**: The system MUST store leads even when external notification delivery fails.
- **FR-029**: The system MUST record notification failures in a way that admins or operators can investigate.
- **FR-030**: The system MUST limit excessive chatbot messages by visitor and by broader source to reduce abuse.
- **FR-031**: The system MUST return friendly retry guidance when a chatbot usage limit is exceeded.
- **FR-032**: The system MUST validate all chatbot, knowledge base, lead, and notification inputs before saving or acting on them.
- **FR-033**: The system MUST return clear, friendly errors for invalid messages, inaccessible sessions, invalid knowledge content, invalid leads, permission failures, notification issues, and usage limits.
- **FR-034**: The system MUST enforce role-based access so ADMIN can manage leads and knowledge, EDITOR can manage knowledge and content-related chatbot material, and VIEWER can only read permitted dashboard data.
- **FR-035**: The system MUST ensure public chatbot and lead responses do not expose private admin-only fields, internal prompts, internal ranking details, credentials, or operational secrets.

### Scope Boundaries

- **SB-001**: This feature covers chatbot conversations, company knowledge management, lead capture, admin lead management, new-lead notifications, and chatbot abuse limits.
- **SB-002**: This feature does not cover public frontend screens, advanced analytics dashboards, production monitoring, multilingual chatbot behavior, paid advertising integrations, CRM sync, Google Sheets sync, or background-job infrastructure beyond the initial notification behavior.
- **SB-003**: This feature relies on the existing backend foundation for authentication, role enforcement, validation, standardized responses, persistent storage, and existing service/blog content.
- **SB-004**: This feature assumes Spec 2 service and blog content can inform knowledge, but it does not require automatic knowledge generation from those records in the first version.

### Key Entities *(include if feature involves data)*

- **KnowledgeBaseItem**: Approved or draft company knowledge used by the assistant; key attributes include title, public address, content, category, tags, source type, status, and audit timestamps.
- **ChatSession**: A visitor conversation; key attributes include visitor identifier, related lead, status, source page, visitor context, and audit timestamps.
- **ChatMessage**: A single message in a conversation; key attributes include session, role, content, metadata, and creation time.
- **Lead**: A potential client captured from chatbot or contact form; key attributes include contact details, company details, service interest, budget range, message, source, status, assignment, and audit timestamps.
- **LeadNotification**: A delivery attempt or operational record for notifying an external workflow about a new lead; key attributes include target, payload summary, delivery status, error details, and timestamps.
- **User**: An authenticated admin-side user who manages knowledge or leads; key attributes relevant to this feature include identity, role, and active status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of chatbot questions with matching active knowledge return a relevant answer during validation scenarios.
- **SC-002**: The chatbot refuses or safely redirects 100% of validation prompts requesting fake prices, guarantees, unavailable services, legal advice, financial advice, internal prompts, or private data.
- **SC-003**: Authorized content users can create, update, activate, archive, and verify a knowledge item in under 4 minutes during acceptance testing.
- **SC-004**: Public conversations preserve 100% of visitor and assistant messages in the correct order during multi-message validation scenarios.
- **SC-005**: Chatbot buying-intent scenarios request missing lead details or create a lead correctly in at least 95% of validation cases.
- **SC-006**: Contact-form lead submissions create a valid lead in under 1 minute during acceptance testing.
- **SC-007**: Authorized admins can find and update a newly captured lead in under 2 minutes during acceptance testing.
- **SC-008**: New-lead notification delivery is attempted for 100% of newly created leads when notification delivery is configured.
- **SC-009**: Notification delivery failures do not prevent lead creation in 100% of failure simulation tests.
- **SC-010**: Excessive chatbot usage is limited in 100% of configured abuse-threshold validation tests while normal usage remains unaffected.
- **SC-011**: Unauthorized or insufficient-role attempts to manage knowledge or leads are rejected in 100% of role validation tests.
- **SC-012**: Public chatbot and lead responses expose 0 internal prompts, operational secrets, private admin-only fields, or deleted records in validation tests.

## Assumptions

- Spec 1 - Core Backend Foundation is complete and provides authentication, role enforcement, validation, standardized responses, persistent storage, and admin users.
- Spec 2 - Services, Blog, and Content Management is complete and provides published service and blog content that can inform the assistant's company knowledge.
- ADMIN can manage knowledge and leads; EDITOR can manage knowledge and content-related chatbot material; VIEWER cannot mutate knowledge, chatbot configuration, or leads.
- Public visitors do not need authentication to start chatbot conversations, send messages, retrieve their own session messages, or submit contact-form leads.
- The first version uses approved active knowledge items as the primary company-specific source for chatbot answers.
- The first version supports an external workflow notification for new leads; email, CRM, Google Sheets, and other integrations can be added later.
- Buying intent can be inferred from phrases such as requesting a quote, asking for a consultation, asking for service help, or providing contact details.
- Chatbot abuse limits use common public-site defaults unless stricter operational limits are introduced later.
