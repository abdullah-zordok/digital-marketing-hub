# Feature Specification: Services, Blog, and Content Management

**Feature Branch**: `002-services-blog-content`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Read all the file digital-marketing-hub-backend-specs.md and Create the specification of this Spec 2 - Services, Blog, and Content Management"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Marketing Services (Priority: P1)

As an admin or editor, I need to create, update, publish, unpublish, delete, and reorder marketing service pages, so the agency can keep its public service offering accurate without code changes.

**Why this priority**: Service pages are a primary business surface for a marketing agency website and directly support client education and lead generation.

**Independent Test**: Sign in as an authorized content user, create a service draft, update its content and SEO metadata, publish it, confirm it appears publicly, unpublish it, confirm it is hidden publicly, then reorder services and verify the public order changes.

**Acceptance Scenarios**:

1. **Given** an authorized admin or editor is signed in, **When** they create a service with required fields, **Then** the service is stored as a draft and is available in the admin service list.
2. **Given** a service is in draft status, **When** an authorized user publishes it, **Then** public visitors can view it by its public address.
3. **Given** a published service exists, **When** an authorized user unpublishes it, **Then** public visitors can no longer view it while admins can still manage it.
4. **Given** multiple published services exist, **When** an authorized user changes their ordering, **Then** public visitors see the services in the updated order.
5. **Given** an authorized user deletes a service, **When** service lists are requested, **Then** the service is removed from normal admin and public workflows while preserving historical integrity where required.

---

### User Story 2 - Publish Blog Posts and Categories (Priority: P1)

As an admin or editor, I need to manage blog posts and blog categories, so the agency can publish marketing articles and organize educational content for website visitors.

**Why this priority**: Blog content is a core channel for educating visitors, improving discoverability, and supporting the agency's authority in marketing topics.

**Independent Test**: Create a category, create a blog post draft assigned to that category, publish the post, confirm public visitors can read it, unpublish it, and confirm public visitors cannot access it while admins retain management access.

**Acceptance Scenarios**:

1. **Given** an authorized admin or editor is signed in, **When** they create a blog category with a unique public address, **Then** the category is available for assigning blog posts.
2. **Given** an authorized admin or editor creates a blog post with required fields, **When** they save it, **Then** it is stored as a draft and appears in the admin blog post list.
3. **Given** a draft blog post exists, **When** an authorized user publishes it, **Then** public visitors can read it by its public address and see its category and metadata.
4. **Given** a published blog post exists, **When** an authorized user unpublishes it, **Then** public visitors can no longer read it while admins can still manage it.
5. **Given** a category has published posts, **When** public visitors browse that category, **Then** only published posts in that category are shown.

---

### User Story 3 - Discover Public Content (Priority: P2)

As a website visitor, I need to browse, search, filter, and sort published services and blog content, so I can quickly find relevant marketing information.

**Why this priority**: Public discovery makes the content useful to visitors and supports conversion from education to inquiry.

**Independent Test**: Publish multiple services, blog posts, categories, and tags, then verify public visitors can list published content, search by keyword, filter by category or tag, page through results, and sort results without seeing drafts or archived content.

**Acceptance Scenarios**:

1. **Given** published and unpublished services exist, **When** a public visitor browses services, **Then** only published services are returned.
2. **Given** published and unpublished blog posts exist, **When** a public visitor browses blog posts, **Then** only published posts are returned.
3. **Given** multiple blog posts with categories and tags exist, **When** a public visitor searches or filters content, **Then** results match the requested keyword, category, tag, and publication status.
4. **Given** many public blog posts exist, **When** a visitor requests a page of results, **Then** the response includes a bounded set of items and enough paging information to request the next or previous page.
5. **Given** a visitor sorts content by newest, oldest, or popular, **When** results are returned, **Then** the order matches the selected sort option.

---

### User Story 4 - Support SEO Metadata (Priority: P2)

As a website frontend integrator, I need public service and blog responses to include SEO metadata, so pages can render accurate titles, descriptions, canonical links, and social sharing images.

**Why this priority**: Marketing content needs search and sharing metadata to perform well and represent the agency professionally.

**Independent Test**: Add SEO metadata to a published service and blog post, request each as a public visitor, and verify the metadata is returned with the content.

**Acceptance Scenarios**:

1. **Given** a published service has SEO title, SEO description, canonical URL, and social sharing image, **When** the service is requested publicly, **Then** all SEO metadata is available to the frontend.
2. **Given** a published blog post has SEO title, SEO description, canonical URL, and social sharing image, **When** the post is requested publicly, **Then** all SEO metadata is available to the frontend.
3. **Given** SEO metadata is omitted, **When** public content is returned, **Then** safe fallback metadata can be derived from visible content fields.

---

### User Story 5 - Upload Content Images (Priority: P3)

As an admin or editor, I need to upload images for services and blog content, so public pages can include service icons, cover images, blog images, and general content media.

**Why this priority**: Images enrich public content, but the content management workflows can still deliver initial value before uploads are complete.

**Independent Test**: Sign in as an authorized content user, upload valid image files for service and blog usage, confirm public URLs and file metadata are returned, then verify invalid file types and oversized files are rejected.

**Acceptance Scenarios**:

1. **Given** an authorized admin or editor uploads a valid image, **When** the upload completes, **Then** the response includes a public URL and stored file metadata.
2. **Given** an uploaded image is used by a service or blog post, **When** that content is returned publicly, **Then** the image reference is available to the frontend.
3. **Given** a file has an unsupported type, **When** an authorized user attempts to upload it, **Then** the upload is rejected with a clear validation error.
4. **Given** a file exceeds the allowed size, **When** an authorized user attempts to upload it, **Then** the upload is rejected with a clear validation error.

### Edge Cases

- A public visitor requests a draft, archived, deleted, or unpublished service or blog post.
- An admin attempts to create a service, blog post, or category with a duplicate public address.
- An editor attempts an action outside their allowed content permissions.
- A viewer attempts to create, update, publish, unpublish, delete, reorder, or upload content.
- A category with assigned blog posts is deleted or renamed.
- Blog search returns no matches.
- Pagination requests use invalid page numbers, limits, or sort values.
- Uploaded files have unsupported types, excessive size, empty content, or unsafe filenames.
- SEO metadata is missing, overly long, or includes invalid public links.
- Reordering services includes missing, duplicate, archived, or deleted services.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authorized admins and editors to create marketing services.
- **FR-002**: The system MUST allow authorized admins and editors to update marketing service content, structured benefits, process steps, target audience, expected results, FAQs, images, ordering, and SEO metadata.
- **FR-003**: The system MUST allow authorized admins and editors to publish and unpublish services.
- **FR-004**: The system MUST allow authorized admins and editors to delete services from normal workflows while preserving historical integrity where required.
- **FR-005**: The system MUST allow authorized admins and editors to reorder services.
- **FR-006**: The system MUST expose published services to public visitors as a list.
- **FR-007**: The system MUST expose a single published service to public visitors by its stable public address.
- **FR-008**: The system MUST prevent public visitors from seeing draft, archived, deleted, or unpublished services.
- **FR-009**: The system MUST allow authorized admins and editors to create blog categories.
- **FR-010**: The system MUST allow authorized admins and editors to update blog categories.
- **FR-011**: The system MUST allow authorized admins and editors to delete blog categories when deletion does not break published content integrity.
- **FR-012**: The system MUST allow authorized admins and editors to create blog post drafts.
- **FR-013**: The system MUST allow authorized admins and editors to update blog post title, excerpt, content, cover image, author, category, tags, publication status, reading time, and SEO metadata.
- **FR-014**: The system MUST allow authorized admins and editors to publish and unpublish blog posts.
- **FR-015**: The system MUST allow authorized admins and editors to delete blog posts from normal workflows while preserving historical integrity where required.
- **FR-016**: The system MUST expose published blog posts to public visitors as a paginated list.
- **FR-017**: The system MUST expose a single published blog post to public visitors by its stable public address.
- **FR-018**: The system MUST expose blog categories to public visitors.
- **FR-019**: The system MUST expose published blog posts for a selected public category.
- **FR-020**: The system MUST prevent public visitors from seeing draft, archived, deleted, or unpublished blog posts.
- **FR-021**: Public content lists MUST support bounded pagination with page metadata.
- **FR-022**: Public blog content lists MUST support keyword search.
- **FR-023**: Public blog content lists MUST support filtering by category.
- **FR-024**: Public blog content lists MUST support filtering by tag.
- **FR-025**: Public blog content lists MUST support sorting by newest, oldest, and popular.
- **FR-026**: Public service and blog content MUST include SEO title, SEO description, canonical URL, and social sharing image when available.
- **FR-027**: The system MUST provide safe fallback SEO metadata when explicit SEO metadata is missing.
- **FR-028**: The system MUST require stable unique public addresses for services, blog posts, and blog categories.
- **FR-029**: The system MUST validate all service, blog, category, and upload inputs before saving changes.
- **FR-030**: The system MUST enforce role-based access so ADMIN and EDITOR can manage content while VIEWER can only read admin dashboard data.
- **FR-031**: The system MUST ensure public content responses do not expose private admin-only fields, credential data, internal storage paths, or operational details.
- **FR-032**: The system MUST allow authorized admins and editors to upload image files for service icons, service cover images, blog cover images, and general content images.
- **FR-033**: The system MUST validate uploaded file type and file size before storing file metadata.
- **FR-034**: The system MUST return a public URL and file metadata for successful uploads.
- **FR-035**: The system MUST store upload metadata so uploaded images can be associated with services and blog posts.
- **FR-036**: The system MUST return clear, friendly errors for duplicate public addresses, invalid filters, invalid publication transitions, invalid uploads, unauthorized access, and missing content.

### Scope Boundaries

- **SB-001**: This feature covers services, blog posts, blog categories, public content discovery, SEO metadata, and content image uploads.
- **SB-002**: This feature does not cover AI chatbot behavior, knowledge base management, lead capture, lead notifications, analytics dashboards, public frontend screens, or production monitoring.
- **SB-003**: This feature relies on the existing backend foundation for authentication, authorization, validation, standardized responses, data storage, and uploaded file metadata.
- **SB-004**: This feature does not require multilingual content management, though content fields should not prevent future multilingual support.

### Key Entities *(include if feature involves data)*

- **Service**: A marketing service page presented to public visitors; key attributes include name, title, public address, short description, full description, icon, cover image, benefits, process steps, target audience, expected results, FAQs, publication status, sort order, SEO metadata, and audit timestamps.
- **BlogPost**: A marketing article presented to public visitors; key attributes include title, public address, excerpt, content, cover image, author, category, tags, publication status, publication date, SEO metadata, reading time, and audit timestamps.
- **BlogCategory**: A public grouping for blog posts; key attributes include name, public address, description, relationships to blog posts, and audit timestamps.
- **UploadedFile**: Metadata for an uploaded content image; key attributes include original filename, stored filename, file type, file size, storage location, public URL, usage purpose, and audit timestamps.
- **User**: An authenticated admin-side user who authors or manages content; key attributes relevant to this feature include identity, role, and active status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authorized content users can create and publish a service in under 3 minutes during acceptance testing.
- **SC-002**: Public service listings show 100% of published services and 0 draft, archived, deleted, or unpublished services in validation tests.
- **SC-003**: Authorized content users can create a category, create a blog post, publish it, and verify public visibility in under 5 minutes during acceptance testing.
- **SC-004**: Public blog listings show 100% of matching published posts and 0 draft, archived, deleted, or unpublished posts in validation tests.
- **SC-005**: Public search, category filtering, tag filtering, pagination, and sorting return correct results for at least 20 seeded blog posts across acceptance scenarios.
- **SC-006**: Public content detail responses include SEO metadata or safe fallback SEO metadata for 100% of published services and blog posts.
- **SC-007**: Duplicate public address attempts for services, blog posts, and categories are rejected in 100% of validation tests.
- **SC-008**: Unauthorized or insufficient-role content management attempts are rejected in 100% of role validation tests.
- **SC-009**: Valid image uploads return public URL and metadata in under 10 seconds for files within allowed limits.
- **SC-010**: Invalid image uploads by type or size are rejected in 100% of validation tests with user-friendly errors.

## Assumptions

- Spec 1 - Core Backend Foundation is complete and provides authentication, roles, standardized responses, validation, data storage, and the base uploaded file concept.
- ADMIN and EDITOR can manage services, blog posts, blog categories, and content uploads; VIEWER can read admin dashboard data only.
- Public visitors do not need authentication to browse published services, published blog posts, and public categories.
- Public address slugs are unique within each content type.
- Deleted content is removed from normal workflows but may be retained internally for history and integrity.
- Published blog posts must have enough visible content to render a public page, including title, slug, excerpt or content, and publication status.
- "Popular" sorting uses a popularity signal available to the backend; if no analytics signal exists during implementation, a documented deterministic fallback may be used until analytics is added.
- Uploads in this feature are limited to images for content use.
- File size and file type limits will use common web content defaults during planning unless stricter operational requirements are introduced.
