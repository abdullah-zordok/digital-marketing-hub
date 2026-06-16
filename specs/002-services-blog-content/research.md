# Research: Services, Blog, and Content Management

## Decision: Reuse Spec 1 foundation modules and Prisma entities

**Rationale**: Spec 1 already created the NestJS API, standardized envelopes, validation, auth guards, role guards, Prisma schema, and placeholder modules for services, blog, and uploads. Extending those modules preserves project consistency and avoids a second backend pattern.

**Alternatives considered**: Creating a separate content application was rejected because the feature belongs in the same backend and shares authentication, authorization, and storage.

## Decision: Use ADMIN and EDITOR for content mutations; VIEWER remains read-only

**Rationale**: The specification says ADMIN and EDITOR can manage content, while VIEWER can only read admin dashboard data. All create, update, publish, unpublish, delete, reorder, and upload operations must require ADMIN or EDITOR.

**Alternatives considered**: Allowing VIEWER to read admin content lists was considered but deferred because this feature focuses on content management and public content APIs, not full dashboard reporting.

## Decision: Public endpoints return only published, non-deleted content

**Rationale**: Public visitors must never see draft, archived, deleted, or unpublished content. The content repository should centralize this rule for list and detail queries.

**Alternatives considered**: Filtering at controller level was rejected because it risks inconsistent public visibility across endpoints.

## Decision: Use bounded page-based pagination

**Rationale**: The source specification shows page and limit query parameters. Page-based pagination is simple for frontend integration and sufficient for this content volume.

**Alternatives considered**: Cursor pagination was considered but is unnecessary for the first content-management phase.

## Decision: Use keyword search across visible textual fields

**Rationale**: Public blog discovery needs keyword search. Searching title, excerpt, content, tags, and category-aligned fields provides useful visitor behavior without introducing a separate search service.

**Alternatives considered**: Dedicated full-text search infrastructure was rejected as out of scope for this feature.

## Decision: Implement popular sorting with deterministic fallback

**Rationale**: The source spec requests newest, oldest, and popular sort options, but analytics is out of scope. The plan uses a popularity field when available and falls back to published date ordering until analytics is introduced.

**Alternatives considered**: Rejecting popular sorting was rejected because it is an explicit public discovery requirement.

## Decision: Add canonical URL and social sharing image fields to service and blog content

**Rationale**: Spec 2 requires SEO title, SEO description, canonical URL, and social sharing image in public responses. The existing schema has SEO title and description, so planning must add canonical URL and social image references.

**Alternatives considered**: Deriving all SEO fields at response time was rejected because admins need explicit editorial control over SEO content.

## Decision: Use safe SEO fallbacks when explicit fields are missing

**Rationale**: The specification requires safe fallback metadata. Fallbacks should use public title/name for SEO title, visible descriptions or excerpt for SEO description, canonical content URL for canonical URL, and cover image when a social sharing image is not set.

**Alternatives considered**: Returning null values was rejected because frontend pages need reliable metadata.

## Decision: Store uploaded images locally for this feature

**Rationale**: The source spec says local storage for development and S3-compatible production-ready design. This feature can implement local public storage while preserving metadata fields that make later storage-driver changes possible.

**Alternatives considered**: Implementing S3-compatible storage now was rejected as premature because production storage hardening belongs to later readiness work.

## Decision: Validate uploads as image-only with common web defaults

**Rationale**: Uploads are limited to service icons, cover images, blog images, and general content images. Default limits should accept common image formats and reject unsafe types and oversized files.

**Alternatives considered**: Accepting arbitrary files was rejected for security and scope reasons. Asking for exact size limits was unnecessary because common web content defaults are sufficient for planning.
