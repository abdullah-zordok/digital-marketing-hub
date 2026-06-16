# Data Model: Services, Blog, and Content Management

## Shared Rules

- Public content is visible only when `status` is `PUBLISHED` and `deletedAt` is empty.
- Admin content lists can include draft and archived content unless explicitly filtered.
- Services, blog posts, and categories require slugs unique within their content type.
- SEO metadata returned publicly includes explicit values when present and safe fallbacks otherwise.
- Mutating content actions require ADMIN or EDITOR role.
- VIEWER cannot create, update, publish, unpublish, delete, reorder, or upload content.

## Service

Represents a marketing service page managed by admins and editors and displayed publicly when published.

**Fields**

- `id`: UUID, required
- `name`: required internal/service name
- `title`: required public title
- `slug`: required, unique public address
- `shortDescription`: optional public summary
- `fullDescription`: optional public body content
- `icon`: optional public image reference
- `coverImage`: optional public image reference
- `benefits`: optional structured list
- `processSteps`: optional structured list
- `targetAudience`: optional structured content
- `expectedResults`: optional structured content
- `faqs`: optional structured content
- `status`: required enum, one of `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `sortOrder`: required number for public ordering
- `seoTitle`: optional explicit SEO title
- `seoDescription`: optional explicit SEO description
- `canonicalUrl`: optional explicit canonical URL
- `openGraphImage`: optional explicit social sharing image
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May reference uploaded files through icon, cover image, or open graph image URLs.

**Validation Rules**

- `name`, `title`, and `slug` are required for creation.
- `slug` must be unique among non-deleted services.
- Published services must have enough visible content to render a public page.
- `sortOrder` must be non-negative.
- SEO metadata length and URL fields must be valid for public page rendering.

**State Transitions**

- `DRAFT` -> `PUBLISHED`
- `PUBLISHED` -> `DRAFT`
- `DRAFT` or `PUBLISHED` -> `ARCHIVED`
- Any non-deleted state -> soft deleted

## BlogCategory

Represents a public grouping for blog posts.

**Fields**

- `id`: UUID, required
- `name`: required
- `slug`: required, unique public address
- `description`: optional
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Has many blog posts.

**Validation Rules**

- `name` and `slug` are required.
- `slug` must be unique among non-deleted categories.
- A category with published posts cannot be deleted in a way that breaks public post integrity.

**State Transitions**

- Active -> soft deleted when safe

## BlogPost

Represents a marketing article managed by admins and editors and displayed publicly when published.

**Fields**

- `id`: UUID, required
- `title`: required
- `slug`: required, unique public address
- `excerpt`: optional public summary
- `content`: optional public body content
- `coverImage`: optional public image reference
- `authorId`: optional user reference
- `categoryId`: optional category reference
- `tags`: optional list of labels
- `status`: required enum, one of `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `publishedAt`: optional timestamp
- `seoTitle`: optional explicit SEO title
- `seoDescription`: optional explicit SEO description
- `canonicalUrl`: optional explicit canonical URL
- `openGraphImage`: optional explicit social sharing image
- `readingTime`: optional number
- `popularityScore`: number used for popular sorting when analytics is unavailable
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- May belong to one blog category.
- May reference one author user.
- May reference uploaded files through cover image or open graph image URLs.

**Validation Rules**

- `title` and `slug` are required for creation.
- `slug` must be unique among non-deleted blog posts.
- Published posts must have visible title, slug, body content or excerpt, and publication date.
- Tags must be normalized so filtering is consistent.
- `readingTime` and `popularityScore` must be non-negative when provided.

**State Transitions**

- `DRAFT` -> `PUBLISHED` and sets `publishedAt` if missing
- `PUBLISHED` -> `DRAFT`
- `DRAFT` or `PUBLISHED` -> `ARCHIVED`
- Any non-deleted state -> soft deleted

## UploadedFile

Represents metadata for a content image uploaded by an authorized user.

**Fields**

- `id`: UUID, required
- `filename`: stored filename
- `originalName`: original uploaded filename
- `storageDriver`: storage backend identifier
- `storagePath`: private storage location
- `publicUrl`: public URL for rendering
- `mimeType`: file media type
- `sizeBytes`: file size
- `purpose`: service icon, service cover, blog cover, or general content image
- `createdAt`: required timestamp
- `updatedAt`: required timestamp
- `deletedAt`: optional timestamp

**Relationships**

- Can be referenced by service and blog image fields through `publicUrl`.

**Validation Rules**

- File must be an accepted image type.
- File size must be within the configured content-image limit.
- Original filename must be sanitized before any stored filename is produced.
- Private storage paths are not returned from public content responses.

## User

Represents an authenticated admin-side user.

**Fields Used by This Feature**

- `id`: UUID
- `email`: unique identity
- `role`: `ADMIN`, `EDITOR`, or `VIEWER`
- `status`: active or disabled

**Relationships**

- Can author blog posts.
- Can perform admin/editor content actions when authorized.

**Validation Rules**

- Only active users with ADMIN or EDITOR role can mutate service, blog, category, and upload resources.
