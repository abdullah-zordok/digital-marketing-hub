# Tasks: Services, Blog, and Content Management

**Input**: Design documents from `specs/002-services-blog-content/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/services-blog-content.openapi.yaml`, `quickstart.md`

**Tests**: Included because the feature plan and quickstart require unit, contract, and integration validation for content workflows.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file and does not depend on another incomplete task.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Every task includes an exact file path.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing API project for Spec 2 content modules.

- [X] T001 Verify content module placeholders are imported by the API root module in `apps/api/src/app.module.ts`
- [X] T002 Create missing content module subdirectories for services, blog, uploads, DTOs, and shared support under `apps/api/src/modules/`
- [X] T003 [P] Add content upload environment variables and validation defaults in `apps/api/src/config/env.schema.ts`
- [X] T004 [P] Verify Multer-compatible upload dependency declarations for NestJS file uploads in `apps/api/package.json`
- [X] T005 [P] Add Spec 2 quickstart validation notes to `apps/api/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, helpers, and test support that block all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Extend Service, BlogPost, and UploadedFile schema fields for canonical URL, open graph image, popularity score, upload purpose, and soft-delete indexes in `apps/api/prisma/schema.prisma`
- [X] T007 Create Prisma migration for Spec 2 content schema changes in `apps/api/prisma/migrations/20260616180000_services_blog_content/migration.sql`
- [X] T008 Update database schema unit coverage for Spec 2 content fields in `apps/api/test/unit/database/schema-entities.spec.ts`
- [X] T009 [P] Create shared pagination query DTO in `apps/api/src/common/dto/pagination-query.dto.ts`
- [X] T010 [P] Create shared pagination result builder in `apps/api/src/common/utils/pagination.util.ts`
- [X] T011 [P] Create shared content status transition helper in `apps/api/src/common/utils/content-status.util.ts`
- [X] T012 [P] Create shared SEO metadata fallback service in `apps/api/src/common/services/seo-metadata.service.ts`
- [X] T013 [P] Create shared slug normalization and validation helper in `apps/api/src/common/utils/slug.util.ts`
- [X] T014 [P] Add content role test fixtures in `apps/api/test/support/content-auth.fixture.ts`
- [X] T015 [P] Add content data factories for services, blog categories, blog posts, and uploads in `apps/api/test/support/content-fixtures.ts`
- [X] T016 Add Prisma seed data for services, categories, posts, tags, and uploads in `apps/api/prisma/seed.ts`
- [X] T017 Register shared content providers for SEO, pagination, and status helpers in `apps/api/src/app.module.ts`

**Checkpoint**: Foundation ready. User story implementation can now begin in priority order or in parallel by story.

---

## Phase 3: User Story 1 - Manage Marketing Services (Priority: P1) MVP

**Goal**: Admins and editors can create, update, publish, unpublish, delete, reorder, and publicly expose marketing services.

**Independent Test**: Sign in as ADMIN or EDITOR, create a service draft, update its content and SEO metadata, publish it, confirm public visibility, unpublish it, confirm public invisibility, reorder published services, and verify VIEWER cannot mutate services.

### Tests for User Story 1

- [X] T018 [P] [US1] Add contract tests for public services endpoints in `apps/api/test/contract/services-public.contract-spec.ts`
- [X] T019 [P] [US1] Add contract tests for admin services endpoints in `apps/api/test/contract/services-admin.contract-spec.ts`
- [X] T020 [P] [US1] Add unit tests for service state transitions, duplicate slugs, soft deletes, and reorder validation in `apps/api/test/unit/services/services.service.spec.ts`
- [X] T021 [P] [US1] Add integration tests for the admin service management journey in `apps/api/test/integration/services-management.e2e-spec.ts`
- [X] T022 [P] [US1] Add integration tests for service role enforcement in `apps/api/test/integration/services-roles.e2e-spec.ts`

### Implementation for User Story 1

- [X] T023 [P] [US1] Create service write DTOs with validation for service content and SEO fields in `apps/api/src/modules/services/dto/service-write.dto.ts`
- [X] T024 [P] [US1] Create service query and reorder DTOs with validation in `apps/api/src/modules/services/dto/service-query.dto.ts`
- [X] T025 [P] [US1] Create service response mapper that hides internal fields and returns SEO metadata in `apps/api/src/modules/services/services.mapper.ts`
- [X] T026 [US1] Implement service repository for admin and public service persistence in `apps/api/src/modules/services/services.repository.ts`
- [X] T027 [US1] Implement service domain workflow for create, update, publish, unpublish, delete, reorder, and public reads in `apps/api/src/modules/services/services.service.ts`
- [X] T028 [US1] Implement protected admin services controller endpoints in `apps/api/src/modules/services/admin-services.controller.ts`
- [X] T029 [US1] Implement public services controller endpoints in `apps/api/src/modules/services/services.controller.ts`
- [X] T030 [US1] Register service controllers and providers in `apps/api/src/modules/services/services.module.ts`
- [X] T031 [US1] Update public/admin service endpoint documentation fixture references in `specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Publish Blog Posts and Categories (Priority: P1)

**Goal**: Admins and editors can manage blog categories and posts, publish or unpublish posts, and expose published posts and categories publicly.

**Independent Test**: Create a category, create a blog post draft assigned to that category, publish it, confirm public list/detail/category visibility, unpublish it, and confirm public visitors cannot access it while admins can still manage it.

### Tests for User Story 2

- [X] T032 [P] [US2] Add contract tests for public blog posts and categories endpoints in `apps/api/test/contract/blog-public.contract-spec.ts`
- [X] T033 [P] [US2] Add contract tests for admin blog posts and categories endpoints in `apps/api/test/contract/blog-admin.contract-spec.ts`
- [X] T034 [P] [US2] Add unit tests for blog category validation and deletion integrity rules in `apps/api/test/unit/blog/blog-categories.service.spec.ts`
- [X] T035 [P] [US2] Add unit tests for blog post publishing, unpublishing, duplicate slugs, tags, and soft deletes in `apps/api/test/unit/blog/blog-posts.service.spec.ts`
- [X] T036 [P] [US2] Add integration tests for the category and post publishing journey in `apps/api/test/integration/blog-management.e2e-spec.ts`
- [X] T037 [P] [US2] Add integration tests for blog role enforcement in `apps/api/test/integration/blog-roles.e2e-spec.ts`

### Implementation for User Story 2

- [X] T038 [P] [US2] Create blog category DTOs with slug validation in `apps/api/src/modules/blog/dto/blog-category.dto.ts`
- [X] T039 [P] [US2] Create blog post write DTOs with content, category, tags, author, status, and SEO validation in `apps/api/src/modules/blog/dto/blog-post.dto.ts`
- [X] T040 [P] [US2] Create blog response mapper that hides internal fields and includes category and SEO data in `apps/api/src/modules/blog/blog.mapper.ts`
- [X] T041 [US2] Implement blog repository for category and post admin/public persistence in `apps/api/src/modules/blog/blog.repository.ts`
- [X] T042 [US2] Implement blog category workflows for create, update, delete, admin list, and public list in `apps/api/src/modules/blog/blog-categories.service.ts`
- [X] T043 [US2] Implement blog post workflows for create, update, publish, unpublish, delete, admin list, public list, and public detail in `apps/api/src/modules/blog/blog-posts.service.ts`
- [X] T044 [US2] Implement protected admin blog categories controller in `apps/api/src/modules/blog/admin-blog-categories.controller.ts`
- [X] T045 [US2] Implement protected admin blog posts controller in `apps/api/src/modules/blog/admin-blog-posts.controller.ts`
- [X] T046 [US2] Implement public blog categories controller in `apps/api/src/modules/blog/blog-categories.controller.ts`
- [X] T047 [US2] Implement public blog posts controller in `apps/api/src/modules/blog/blog-posts.controller.ts`
- [X] T048 [US2] Register blog controllers and providers in `apps/api/src/modules/blog/blog.module.ts`
- [X] T049 [US2] Update public/admin blog endpoint documentation fixture references in `specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml`

**Checkpoint**: User Story 2 is independently functional and testable alongside User Story 1.

---

## Phase 5: User Story 3 - Discover Public Content (Priority: P2)

**Goal**: Public visitors can browse, search, filter, paginate, and sort published services and blog content without seeing drafts, archived content, or deleted content.

**Independent Test**: Seed at least 20 blog posts with categories and tags, then verify published-only list results, keyword search, category and tag filters, pagination metadata, and newest, oldest, and popular sort behavior.

### Tests for User Story 3

- [X] T050 [P] [US3] Add unit tests for pagination bounds and page metadata in `apps/api/test/unit/common/pagination.util.spec.ts`
- [X] T051 [P] [US3] Add unit tests for blog discovery query validation and deterministic popular sorting in `apps/api/test/unit/blog/blog-discovery.service.spec.ts`
- [X] T052 [P] [US3] Add integration tests for public blog search, filters, pagination, and sorting in `apps/api/test/integration/blog-discovery.e2e-spec.ts`
- [X] T053 [P] [US3] Add integration tests for published-only service and blog visibility rules in `apps/api/test/integration/public-content-visibility.e2e-spec.ts`

### Implementation for User Story 3

- [X] T054 [P] [US3] Create public blog discovery query DTO for page, limit, search, category, tag, and sort in `apps/api/src/modules/blog/dto/blog-discovery-query.dto.ts`
- [X] T055 [P] [US3] Create public service list query DTO for bounded public service reads in `apps/api/src/modules/services/dto/public-service-query.dto.ts`
- [X] T056 [US3] Implement published-only service list ordering and paging in `apps/api/src/modules/services/services.repository.ts`
- [X] T057 [US3] Implement blog search, category filter, tag filter, pagination, and sort queries in `apps/api/src/modules/blog/blog.repository.ts`
- [X] T058 [US3] Integrate blog discovery query handling and response metadata in `apps/api/src/modules/blog/blog-posts.service.ts`
- [X] T059 [US3] Expose discovery query parameters on public blog endpoints in `apps/api/src/modules/blog/blog-posts.controller.ts`
- [X] T060 [US3] Expose bounded published service listing behavior on public service endpoints in `apps/api/src/modules/services/services.controller.ts`
- [X] T061 [US3] Add seeded discovery dataset with at least 20 posts, categories, and tags in `apps/api/prisma/seed.ts`

**Checkpoint**: User Story 3 is independently testable against public discovery endpoints.

---

## Phase 6: User Story 4 - Support SEO Metadata (Priority: P2)

**Goal**: Public service and blog responses include explicit or safe fallback SEO metadata for frontend rendering.

**Independent Test**: Add SEO metadata to a published service and blog post, request each public detail endpoint, and verify SEO title, description, canonical URL, and social sharing image are returned; omit fields and verify safe fallbacks.

### Tests for User Story 4

- [X] T062 [P] [US4] Add unit tests for SEO fallback generation from service and blog visible fields in `apps/api/test/unit/common/seo-metadata.service.spec.ts`
- [X] T063 [P] [US4] Add integration tests for SEO metadata in public service responses in `apps/api/test/integration/services-seo.e2e-spec.ts`
- [X] T064 [P] [US4] Add integration tests for SEO metadata in public blog responses in `apps/api/test/integration/blog-seo.e2e-spec.ts`

### Implementation for User Story 4

- [X] T065 [US4] Add canonical URL and open graph image mapping for services in `apps/api/src/modules/services/services.mapper.ts`
- [X] T066 [US4] Add canonical URL and open graph image mapping for blog posts in `apps/api/src/modules/blog/blog.mapper.ts`
- [X] T067 [US4] Apply SEO fallback service to public service detail and list responses in `apps/api/src/modules/services/services.service.ts`
- [X] T068 [US4] Apply SEO fallback service to public blog detail and list responses in `apps/api/src/modules/blog/blog-posts.service.ts`
- [X] T069 [US4] Add SEO field validation limits and public URL validation to service and blog DTOs in `apps/api/src/modules/services/dto/service-write.dto.ts`
- [X] T070 [US4] Add SEO field validation limits and public URL validation to blog post DTOs in `apps/api/src/modules/blog/dto/blog-post.dto.ts`

**Checkpoint**: User Story 4 is independently testable through public content detail and list responses.

---

## Phase 7: User Story 5 - Upload Content Images (Priority: P3)

**Goal**: Admins and editors can upload validated image files for services and blog content and receive public URLs and safe metadata.

**Independent Test**: Sign in as ADMIN or EDITOR, upload valid image files for service and blog usage, confirm public URL and metadata are returned, then verify invalid file types, oversized files, and VIEWER uploads are rejected.

### Tests for User Story 5

- [X] T071 [P] [US5] Add contract tests for the admin upload endpoint in `apps/api/test/contract/uploads.contract-spec.ts`
- [X] T072 [P] [US5] Add unit tests for image type, size, empty file, and filename validation in `apps/api/test/unit/uploads/upload-validation.service.spec.ts`
- [X] T073 [P] [US5] Add integration tests for successful content image uploads in `apps/api/test/integration/uploads.e2e-spec.ts`
- [X] T074 [P] [US5] Add integration tests for upload role enforcement and invalid upload errors in `apps/api/test/integration/uploads-validation.e2e-spec.ts`

### Implementation for User Story 5

- [X] T075 [P] [US5] Create upload request and response DTOs for content image purpose and metadata in `apps/api/src/modules/uploads/dto/upload.dto.ts`
- [X] T076 [P] [US5] Create upload validation service for MIME type, size, empty file, and safe filename rules in `apps/api/src/modules/uploads/upload-validation.service.ts`
- [X] T077 [P] [US5] Create local upload storage service that writes public files and hides private storage paths in `apps/api/src/modules/uploads/local-upload-storage.service.ts`
- [X] T078 [US5] Implement upload metadata persistence and response mapping in `apps/api/src/modules/uploads/uploads.service.ts`
- [X] T079 [US5] Implement protected admin upload controller with file interceptor and role guards in `apps/api/src/modules/uploads/admin-uploads.controller.ts`
- [X] T080 [US5] Register upload providers and controller in `apps/api/src/modules/uploads/uploads.module.ts`
- [X] T081 [US5] Serve public upload files from the configured static uploads path in `apps/api/src/main.ts`
- [X] T082 [US5] Ensure service and blog image fields accept uploaded public URLs in `apps/api/src/modules/services/dto/service-write.dto.ts`
- [X] T083 [US5] Ensure blog cover and social image fields accept uploaded public URLs in `apps/api/src/modules/blog/dto/blog-post.dto.ts`

**Checkpoint**: User Story 5 is independently testable through the protected upload endpoint and public content image references.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all content stories.

- [X] T084 [P] Update Spec 2 quickstart with final endpoint examples and validation commands in `specs/002-services-blog-content/quickstart.md`
- [X] T085 [P] Update OpenAPI schemas with final request and response fields in `specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml`
- [X] T086 [P] Add content API smoke test coverage for standardized response envelopes in `apps/api/test/contract/content-response-envelope.contract-spec.ts`
- [X] T087 Review public response mappers for private field leaks across services, blog, and uploads in `apps/api/src/modules/`
- [X] T088 Run API formatting and lint cleanup for Spec 2 files in `apps/api/package.json`
- [X] T089 Run full API build validation with `pnpm --filter @digital-marketing-hub/api build` and record results in `specs/002-services-blog-content/quickstart.md`
- [X] T090 Run full API test validation with `pnpm --filter @digital-marketing-hub/api test` and record results in `specs/002-services-blog-content/quickstart.md`
- [X] T091 Run contract validation with `pnpm --filter @digital-marketing-hub/api test:contract` and record results in `specs/002-services-blog-content/quickstart.md`
- [X] T092 Run integration validation with `pnpm --filter @digital-marketing-hub/api test:integration` and record results in `specs/002-services-blog-content/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 - Setup**: No dependencies; can start immediately.
- **Phase 2 - Foundational**: Depends on Phase 1 and blocks all user story phases.
- **Phase 3 - User Story 1**: Depends on Phase 2; delivers MVP service management.
- **Phase 4 - User Story 2**: Depends on Phase 2; can run alongside US1 after shared foundation, but should be validated after blog schema and helpers are ready.
- **Phase 5 - User Story 3**: Depends on Phase 3 and Phase 4 because discovery needs published services, blog posts, categories, and seeded content.
- **Phase 6 - User Story 4**: Depends on Phase 3 and Phase 4 because SEO metadata is returned by service and blog mappers.
- **Phase 7 - User Story 5**: Depends on Phase 2; can be implemented independently, then integrated with service and blog image fields.
- **Phase 8 - Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 - Manage Marketing Services (P1)**: Start after Phase 2; no dependency on other stories.
- **US2 - Publish Blog Posts and Categories (P1)**: Start after Phase 2; no dependency on US1.
- **US3 - Discover Public Content (P2)**: Depends on US1 and US2 for public content to discover.
- **US4 - Support SEO Metadata (P2)**: Depends on US1 and US2 mappers and public responses.
- **US5 - Upload Content Images (P3)**: Depends on Phase 2 and can be integrated after US1/US2 DTOs exist.

### Within Each User Story

- Tests are listed first and should fail before implementation.
- DTOs and mappers come before repositories and services.
- Repositories come before services.
- Services come before controllers.
- Module registration comes after controllers and providers.
- Each checkpoint should be validated before moving to lower-priority stories.

---

## Parallel Opportunities

- Phase 1 tasks T003, T004, and T005 can run in parallel.
- Phase 2 helper, DTO, and test fixture tasks T009 through T015 can run in parallel after schema planning is understood.
- US1 test tasks T018 through T022 can run in parallel.
- US1 DTO and mapper tasks T023 through T025 can run in parallel.
- US2 test tasks T032 through T037 can run in parallel.
- US2 DTO and mapper tasks T038 through T040 can run in parallel.
- US3 test tasks T050 through T053 can run in parallel.
- US4 test tasks T062 through T064 can run in parallel.
- US5 test tasks T071 through T074 can run in parallel.
- US5 upload DTO, validation, and local storage tasks T075 through T077 can run in parallel.

---

## Parallel Example: User Story 1

```text
Task: "T018 [P] [US1] Add contract tests for public services endpoints in apps/api/test/contract/services-public.contract-spec.ts"
Task: "T019 [P] [US1] Add contract tests for admin services endpoints in apps/api/test/contract/services-admin.contract-spec.ts"
Task: "T020 [P] [US1] Add unit tests for service state transitions, duplicate slugs, soft deletes, and reorder validation in apps/api/test/unit/services/services.service.spec.ts"
Task: "T021 [P] [US1] Add integration tests for the admin service management journey in apps/api/test/integration/services-management.e2e-spec.ts"
Task: "T022 [P] [US1] Add integration tests for service role enforcement in apps/api/test/integration/services-roles.e2e-spec.ts"
```

---

## Parallel Example: User Story 2

```text
Task: "T032 [P] [US2] Add contract tests for public blog posts and categories endpoints in apps/api/test/contract/blog-public.contract-spec.ts"
Task: "T033 [P] [US2] Add contract tests for admin blog posts and categories endpoints in apps/api/test/contract/blog-admin.contract-spec.ts"
Task: "T034 [P] [US2] Add unit tests for blog category validation and deletion integrity rules in apps/api/test/unit/blog/blog-categories.service.spec.ts"
Task: "T035 [P] [US2] Add unit tests for blog post publishing, unpublishing, duplicate slugs, tags, and soft deletes in apps/api/test/unit/blog/blog-posts.service.spec.ts"
Task: "T036 [P] [US2] Add integration tests for the category and post publishing journey in apps/api/test/integration/blog-management.e2e-spec.ts"
```

---

## Parallel Example: User Story 5

```text
Task: "T071 [P] [US5] Add contract tests for the admin upload endpoint in apps/api/test/contract/uploads.contract-spec.ts"
Task: "T072 [P] [US5] Add unit tests for image type, size, empty file, and filename validation in apps/api/test/unit/uploads/upload-validation.service.spec.ts"
Task: "T075 [P] [US5] Create upload request and response DTOs for content image purpose and metadata in apps/api/src/modules/uploads/dto/upload.dto.ts"
Task: "T076 [P] [US5] Create upload validation service for MIME type, size, empty file, and safe filename rules in apps/api/src/modules/uploads/upload-validation.service.ts"
Task: "T077 [P] [US5] Create local upload storage service that writes public files and hides private storage paths in apps/api/src/modules/uploads/local-upload-storage.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational schema, helpers, and fixtures.
3. Complete Phase 3 User Story 1.
4. Stop and validate the admin service workflow independently with `apps/api/test/integration/services-management.e2e-spec.ts`.
5. Confirm public services expose only published, non-deleted records.

### Incremental Delivery

1. Deliver US1 for service management MVP.
2. Add US2 for blog categories and posts.
3. Add US3 for public discovery.
4. Add US4 for SEO metadata completeness.
5. Add US5 for image uploads.
6. Run Phase 8 validation after each desired release slice.

### Parallel Team Strategy

1. One developer completes schema and shared helpers in Phase 2.
2. After Phase 2, US1 and US2 can be developed by separate developers.
3. US5 can begin in parallel after Phase 2 because uploads are isolated.
4. US3 and US4 should start after US1 and US2 expose stable service and blog response mappers.

---

## Notes

- `[P]` tasks use different files and can be executed concurrently once their phase prerequisites are met.
- Tests appear before implementation tasks for each story and should fail before the related production code is written.
- Keep public response mappers strict so private storage paths, deleted timestamps, and admin-only fields are not exposed.
- Preserve the existing Spec 1 response envelope, auth guards, role guards, validation pipe, and test support patterns.
