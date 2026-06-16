# Quickstart: Services, Blog, and Content Management

This guide validates Spec 2 after implementation.

## Prerequisites

- Spec 1 backend foundation is implemented.
- `.env` exists with valid values from `.env.example`.
- Dependencies are installed with `pnpm install`.
- Database migrations and seed data are applied.
- An ADMIN or EDITOR account is available for protected content operations.

## Setup

```powershell
pnpm install
pnpm --filter @digital-marketing-hub/api prisma:generate
pnpm --filter @digital-marketing-hub/api prisma:deploy
pnpm --filter @digital-marketing-hub/api seed
pnpm --filter @digital-marketing-hub/api dev
```

## Validation Scenarios

### 1. Admin Service Management

1. Sign in as ADMIN or EDITOR.
2. Create a service draft.
3. Update its content, structured sections, images, and SEO metadata.
4. Publish the service.
5. Request the public services list and service detail by slug.
6. Unpublish the service.
7. Confirm public service detail no longer returns it.
8. Reorder multiple published services.

Expected outcome:

- Admin/editor can complete the workflow.
- Public visitors see only published services.
- Reordered services appear in the requested order.
- VIEWER and unauthenticated users cannot mutate services.

### 2. Blog Category and Post Publishing

1. Sign in as ADMIN or EDITOR.
2. Create a blog category.
3. Create a blog post draft assigned to that category.
4. Publish the blog post.
5. Request public blog post list, detail by slug, category list, and category posts.
6. Unpublish the blog post.
7. Confirm public visitors cannot read the unpublished post.

Expected outcome:

- Admin/editor can manage categories and posts.
- Public visitors see only published posts.
- Category browsing returns only published posts for the selected category.

### 3. Public Discovery

Seed at least 20 blog posts with categories and tags.

Validate:

```powershell
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&search=seo"
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&category=paid-ads"
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&tag=strategy"
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&sort=newest"
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&sort=oldest"
Invoke-RestMethod "http://localhost:3000/api/v1/blog/posts?page=1&limit=10&sort=popular"
```

Expected outcome:

- Results match search, category, tag, pagination, and sort requests.
- Draft, archived, and deleted content is excluded.
- Response includes page metadata.

### 4. SEO Metadata

Create a published service and blog post with explicit SEO metadata, then request each public detail endpoint.

Expected outcome:

- SEO title, SEO description, canonical URL, and social sharing image are returned.
- If explicit metadata is missing, safe fallback metadata is returned.

### 5. Image Uploads

Sign in as ADMIN or EDITOR and upload a valid content image.

Expected outcome:

- The response includes public URL and metadata.
- Unsupported file types are rejected.
- Oversized files are rejected.
- Public content responses never expose private storage paths.

## Automated Checks

```powershell
pnpm --filter @digital-marketing-hub/api build
pnpm --filter @digital-marketing-hub/api test
pnpm --filter @digital-marketing-hub/api test:unit
pnpm --filter @digital-marketing-hub/api test:contract
pnpm --filter @digital-marketing-hub/api test:integration
```

Expected outcome:

- Unit tests pass for service rules, blog rules, SEO fallback, upload validation, and pagination helpers.
- Contract tests pass for the content API.
- Integration tests pass for admin service management, blog publishing, public discovery, role enforcement, and uploads.

Latest validation result on 2026-06-16:

- `pnpm --filter @digital-marketing-hub/api prisma:generate`: PASS
- `pnpm --filter @digital-marketing-hub/api build`: PASS
- `pnpm --filter @digital-marketing-hub/api test`: PASS, 38 suites and 85 tests
- `pnpm --filter @digital-marketing-hub/api test:unit`: PASS, 14 suites and 36 tests
- `pnpm --filter @digital-marketing-hub/api test:contract`: PASS, 9 suites and 34 tests
- `pnpm --filter @digital-marketing-hub/api test:integration`: PASS, 15 suites and 15 tests

## Contract Reference

The content API contract is documented in [contracts/services-blog-content.openapi.yaml](./contracts/services-blog-content.openapi.yaml).
