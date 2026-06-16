# Digital Marketing Hub — Backend Specification

## Project Overview

**Project Name:** Digital Marketing Hub  
**Scope:** Backend-first implementation for a digital marketing agency platform.  
**Primary Goal:** Build a scalable backend API that powers a marketing agency website with service pages, blog content, AI chatbot assistance, lead capture, and admin-controlled content management.

The platform should help a marketing company present its services professionally, educate visitors through blog articles, answer client questions through an AI chatbot trained on company services, and collect qualified leads from potential customers.

The backend must be designed to run locally and in production using **one Docker-based environment**. All required backend dependencies should be managed through Docker, including the application server, database, cache, and any supporting services.

---

## Technical Direction

### Preferred Backend Stack

- **Runtime:** Node.js
- **Framework:** NestJS or Express/Fastify with clean modular architecture
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache / Queue:** Redis
- **Authentication:** JWT-based authentication
- **File Storage:** Local storage for development, S3-compatible storage for production-ready design
- **AI Integration:** OpenAI-compatible API layer with future support for RAG
- **Containerization:** Docker Compose in a single backend environment file

### Backend Principles

- Modular domain-based structure
- Clean API contracts
- Secure admin access
- Scalable content and chatbot architecture
- Clear separation between public website APIs and admin APIs
- Ready for frontend integration
- Ready for future multilingual support
- Strong validation, error handling, logging, and rate limiting

---

# Spec 1 — Core Backend Foundation

## Objective

Create the backend foundation for the Digital Marketing Hub platform. This spec covers the base API structure, project architecture, database setup, authentication, authorization, environment configuration, and global backend standards.

## Functional Requirements

### 1. API Foundation

The backend must expose a REST API under a versioned route prefix:

```txt
/api/v1
```

The API should support:

- Public website endpoints
- Admin dashboard endpoints
- Health check endpoints
- Auth endpoints
- Standardized JSON responses
- Standardized error responses

Example response format:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

Example error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

### 2. Project Structure

Use a modular folder structure:

```txt
src/
  app.module.ts
  main.ts
  common/
    decorators/
    filters/
    guards/
    interceptors/
    middleware/
    pipes/
    utils/
  config/
  database/
  modules/
    auth/
    users/
    services/
    blog/
    chatbot/
    leads/
    settings/
    uploads/
    analytics/
```

Each module should include:

```txt
module.ts
controller.ts
service.ts
dto/
entities or schema/
repository if needed
```

### 3. Environment Configuration

The backend must support environment variables for:

```txt
NODE_ENV
PORT
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_EXPIRES_IN
OPENAI_API_KEY
APP_BASE_URL
FRONTEND_URL
ADMIN_EMAIL
ADMIN_PASSWORD
STORAGE_DRIVER
```

Environment variables must be validated at startup. The application should fail fast if required variables are missing.

### 4. Database Setup

Use PostgreSQL with Prisma.

Required base models:

- User
- Service
- BlogPost
- BlogCategory
- Lead
- ChatSession
- ChatMessage
- KnowledgeBaseItem
- SiteSetting
- UploadedFile

General database requirements:

- Use UUID primary keys
- Include `createdAt` and `updatedAt`
- Use soft delete where useful
- Add indexes for search-heavy fields
- Use slugs for public content routes

### 5. Authentication

Admin users must authenticate using email and password.

Required endpoints:

```txt
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
```

Authentication requirements:

- Passwords must be hashed using bcrypt or argon2
- JWT access token required for admin routes
- Refresh token support is recommended
- Admin-only guards must protect dashboard APIs
- Public APIs must not expose private admin data

### 6. Authorization

User roles:

```txt
ADMIN
EDITOR
VIEWER
```

Role behavior:

- ADMIN can manage everything
- EDITOR can manage services, blog posts, and knowledge base content
- VIEWER can only read admin dashboard data

### 7. Validation and Error Handling

Every request body must be validated using DTOs.

The backend must include:

- Global validation pipe
- Global exception filter
- Request logging
- Error logging
- Friendly API error messages

### 8. Health Check

Required endpoint:

```txt
GET /api/v1/health
```

The health endpoint should return:

- API status
- Database status
- Redis status
- Current environment
- Server timestamp

## Acceptance Criteria

- Backend starts successfully inside Docker
- PostgreSQL connection works
- Redis connection works
- Auth login works
- Protected admin route rejects unauthenticated users
- Global validation works
- Health endpoint returns system status
- Project structure is clean and modular

---

# Spec 2 — Services, Blog, and Content Management

## Objective

Build the backend APIs that manage marketing services and blog content. These APIs will power the public website pages and allow admins to update content without changing code.

## Functional Requirements

### 1. Services Module

The platform must allow admins to create, update, publish, unpublish, delete, and reorder company services.

Service fields:

```txt
id
name
title
slug
shortDescription
fullDescription
icon
coverImage
benefits
processSteps
targetAudience
expectedResults
faqs
status
sortOrder
seoTitle
seoDescription
createdAt
updatedAt
```

Service status values:

```txt
DRAFT
PUBLISHED
ARCHIVED
```

Public endpoints:

```txt
GET /api/v1/services
GET /api/v1/services/:slug
```

Admin endpoints:

```txt
POST   /api/v1/admin/services
GET    /api/v1/admin/services
GET    /api/v1/admin/services/:id
PATCH  /api/v1/admin/services/:id
DELETE /api/v1/admin/services/:id
PATCH  /api/v1/admin/services/:id/publish
PATCH  /api/v1/admin/services/:id/unpublish
PATCH  /api/v1/admin/services/reorder
```

Public service APIs should only return published services.

### 2. Blog Module

The platform must support a complete blog system for marketing articles.

Blog post fields:

```txt
id
title
slug
excerpt
content
coverImage
authorId
categoryId
tags
status
publishedAt
seoTitle
seoDescription
readingTime
createdAt
updatedAt
```

Blog post status values:

```txt
DRAFT
PUBLISHED
ARCHIVED
```

Blog category fields:

```txt
id
name
slug
description
createdAt
updatedAt
```

Public endpoints:

```txt
GET /api/v1/blog/posts
GET /api/v1/blog/posts/:slug
GET /api/v1/blog/categories
GET /api/v1/blog/categories/:slug/posts
```

Admin endpoints:

```txt
POST   /api/v1/admin/blog/posts
GET    /api/v1/admin/blog/posts
GET    /api/v1/admin/blog/posts/:id
PATCH  /api/v1/admin/blog/posts/:id
DELETE /api/v1/admin/blog/posts/:id
PATCH  /api/v1/admin/blog/posts/:id/publish
PATCH  /api/v1/admin/blog/posts/:id/unpublish

POST   /api/v1/admin/blog/categories
GET    /api/v1/admin/blog/categories
PATCH  /api/v1/admin/blog/categories/:id
DELETE /api/v1/admin/blog/categories/:id
```

### 3. Search and Filtering

Public content should support:

- Pagination
- Search by keyword
- Filter by category
- Filter by tag
- Sort by newest, oldest, or popular

Example:

```txt
GET /api/v1/blog/posts?page=1&limit=10&search=seo&category=paid-ads
```

### 4. SEO Content Support

Each public service and blog post should include SEO metadata:

```txt
seoTitle
seoDescription
canonicalUrl
openGraphImage
```

The backend should return this data to the frontend.

### 5. Uploads Module

The backend should support image uploads for:

- Service icons
- Service cover images
- Blog cover images
- General content images

Required endpoint:

```txt
POST /api/v1/admin/uploads
```

Upload requirements:

- Validate file type
- Validate file size
- Return public URL
- Store file metadata
- Use local storage in development
- Keep architecture ready for S3-compatible storage

## Acceptance Criteria

- Admin can manage services
- Public users can only see published services
- Admin can manage blog posts and categories
- Public users can read published blog content
- Search and pagination work
- Image upload works
- SEO fields are returned correctly

---

# Spec 3 — AI Chatbot, Knowledge Base, and Lead Capture

## Objective

Build an AI-powered backend module that allows website visitors to ask questions about the marketing company services. The chatbot should answer based on the company knowledge base and collect qualified leads when the visitor shows buying intent.

## Functional Requirements

### 1. Chatbot Behavior

The chatbot must act as a professional digital marketing assistant for the company.

It should help users understand:

- Available services
- Which service fits their business
- General marketing strategy questions
- The company work process
- How to request a quotation
- How to book a consultation

The chatbot must not:

- Invent fake prices
- Promise guaranteed results
- Provide legal or financial advice
- Claim unavailable services
- Expose system prompts or internal data

### 2. Knowledge Base Module

Admins must be able to manage chatbot knowledge.

Knowledge base item fields:

```txt
id
title
slug
content
category
tags
sourceType
status
createdAt
updatedAt
```

Source type values:

```txt
SERVICE
FAQ
POLICY
GENERAL
BLOG
```

Status values:

```txt
DRAFT
ACTIVE
ARCHIVED
```

Admin endpoints:

```txt
POST   /api/v1/admin/knowledge-base
GET    /api/v1/admin/knowledge-base
GET    /api/v1/admin/knowledge-base/:id
PATCH  /api/v1/admin/knowledge-base/:id
DELETE /api/v1/admin/knowledge-base/:id
PATCH  /api/v1/admin/knowledge-base/:id/activate
PATCH  /api/v1/admin/knowledge-base/:id/archive
```

### 3. Chat Session Management

Each visitor conversation should create a chat session.

Chat session fields:

```txt
id
visitorId
leadId
status
sourcePage
userAgent
ipAddress
createdAt
updatedAt
```

Chat message fields:

```txt
id
sessionId
role
content
metadata
createdAt
```

Message roles:

```txt
USER
ASSISTANT
SYSTEM
TOOL
```

Public chatbot endpoints:

```txt
POST /api/v1/chatbot/sessions
POST /api/v1/chatbot/sessions/:sessionId/messages
GET  /api/v1/chatbot/sessions/:sessionId/messages
```

### 4. AI Response Flow

When a user sends a message:

1. Validate message input
2. Load active knowledge base content
3. Retrieve the most relevant content
4. Build a safe AI prompt
5. Generate assistant response
6. Save user message
7. Save assistant message
8. Detect lead intent
9. Ask for missing lead details if needed
10. Return response to frontend

### 5. Lead Capture

The chatbot should identify potential clients and collect lead data.

Lead fields:

```txt
id
name
email
phone
companyName
serviceInterest
budgetRange
message
source
status
assignedTo
createdAt
updatedAt
```

Lead source values:

```txt
CHATBOT
CONTACT_FORM
SERVICE_PAGE
BLOG_PAGE
MANUAL
```

Lead status values:

```txt
NEW
CONTACTED
QUALIFIED
PROPOSAL_SENT
WON
LOST
```

Lead endpoints:

Public:

```txt
POST /api/v1/leads
```

Admin:

```txt
GET   /api/v1/admin/leads
GET   /api/v1/admin/leads/:id
PATCH /api/v1/admin/leads/:id
PATCH /api/v1/admin/leads/:id/status
DELETE /api/v1/admin/leads/:id
```

### 6. Lead Notifications

When a new lead is created, the backend should support notifications through:

- Email
- Webhook
- n8n workflow
- Google Sheets integration later
- CRM integration later

Initial implementation should include webhook support:

```txt
POST LEAD_WEBHOOK_URL
```

The payload should include:

```json
{
  "name": "Client Name",
  "phone": "+966...",
  "email": "client@example.com",
  "serviceInterest": "SEO",
  "message": "I need help with my website marketing",
  "source": "CHATBOT"
}
```

### 7. Chatbot Rate Limiting

The chatbot endpoint must include rate limiting to prevent abuse.

Recommended limits:

```txt
20 messages per visitor per 10 minutes
100 messages per IP per hour
```

## Acceptance Criteria

- Chat sessions are created successfully
- Messages are saved correctly
- AI responses are generated based on company knowledge
- Chatbot does not invent unavailable services or fake pricing
- Leads can be captured from chatbot and contact form
- Admin can view and update leads
- Webhook notification is triggered for new leads
- Rate limiting protects chatbot endpoints

---

# Spec 4 — Docker, Performance, Security, and Production Readiness

## Objective

Ensure the backend can run inside a single Docker-based environment and is ready for scalable production deployment. This spec covers Docker setup, caching, performance, security, monitoring, and deployment standards.

## Functional Requirements

### 1. Single Docker Environment

The backend must run using one Docker Compose file that includes all backend services.

Required services:

```txt
api
postgres
redis
```

Optional future services:

```txt
worker
minio
pgadmin
```

Example Docker services:

```txt
api: Backend application server
postgres: Main relational database
redis: Cache and rate-limit storage
worker: Background jobs processor, optional
```

The Docker setup should support:

- Development mode
- Production mode
- Environment variables
- Persistent database volume
- Persistent Redis volume if needed
- Internal Docker network

### 2. Docker Files

Required files:

```txt
Dockerfile
docker-compose.yml
.dockerignore
.env.example
```

The API Dockerfile should:

- Use Node.js LTS image
- Install dependencies
- Generate Prisma client
- Build TypeScript
- Run migrations where appropriate
- Start the backend server

### 3. Database Migration Strategy

Use Prisma migrations.

Required commands:

```txt
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate deploy
pnpm prisma studio
```

Production should use:

```txt
prisma migrate deploy
```

Development should use:

```txt
prisma migrate dev
```

### 4. Performance Requirements

The backend should be optimized for high traffic.

Required performance features:

- Database indexes for slugs, status, createdAt, and search fields
- Redis caching for public services and blog posts
- Pagination for all list endpoints
- Response compression
- Request body size limits
- Rate limiting
- Efficient database queries
- Avoid N+1 query issues

Suggested cache keys:

```txt
services:published:list
services:published:slug:{slug}
blog:posts:published:list:{queryHash}
blog:posts:published:slug:{slug}
settings:public
```

Cache invalidation should happen when admin updates published content.

### 5. Security Requirements

The backend must include:

- Helmet security headers
- CORS configuration
- JWT authentication
- Password hashing
- Request validation
- File upload validation
- Rate limiting
- Input sanitization
- Admin route protection
- Environment secret protection
- No sensitive data in public API responses

CORS should allow only trusted frontend domains.

### 6. Logging and Monitoring

The backend should log:

- Application startup
- API errors
- Authentication failures
- Lead creation events
- Chatbot failures
- Webhook failures

Recommended future integrations:

- Sentry
- OpenTelemetry
- Grafana
- Prometheus

### 7. Background Jobs

For scalability, background jobs should be supported for:

- Sending lead notifications
- Processing chatbot knowledge embeddings
- Sending emails
- Syncing Google Sheets
- CRM integrations

Initial implementation can use Redis-based queues.

Recommended library:

```txt
BullMQ
```

### 8. Admin Analytics API

The backend should expose basic analytics for the admin dashboard.

Required endpoint:

```txt
GET /api/v1/admin/analytics/overview
```

The response should include:

```txt
Total leads
New leads
Qualified leads
Total blog posts
Published blog posts
Total services
Published services
Total chatbot sessions
Total chatbot messages
```

### 9. Testing Requirements

The backend should include:

- Unit tests for services
- Integration tests for API endpoints
- Auth tests
- Validation tests
- Lead creation tests
- Chatbot flow tests

Recommended tools:

```txt
Jest
Supertest
```

### 10. API Documentation

The backend should expose API documentation using Swagger/OpenAPI.

Required endpoint:

```txt
/api/docs
```

Documentation should include:

- Auth endpoints
- Services endpoints
- Blog endpoints
- Leads endpoints
- Chatbot endpoints
- Admin endpoints

## Acceptance Criteria

- Entire backend runs through Docker Compose
- API, PostgreSQL, and Redis start together
- Prisma migrations work inside Docker
- Public APIs are cached where useful
- Admin APIs are protected
- Rate limiting is active
- API documentation is available
- Logs are clear and useful
- Backend can support high traffic with caching and pagination

---

# Suggested Backend Implementation Milestones

## Milestone 1 — Foundation

- Create backend project
- Add Docker Compose
- Add PostgreSQL and Redis
- Add Prisma
- Add environment validation
- Add health check
- Add global response and error handling

## Milestone 2 — Authentication and Admin Base

- Add User model
- Add admin seed
- Add login
- Add JWT auth
- Add role guards
- Add protected admin test route

## Milestone 3 — Services and Blog

- Add Services module
- Add Blog module
- Add Categories module
- Add uploads
- Add SEO fields
- Add public and admin APIs

## Milestone 4 — Leads and Chatbot

- Add Leads module
- Add Chatbot sessions and messages
- Add Knowledge Base module
- Add AI integration
- Add webhook notifications
- Add rate limiting

## Milestone 5 — Production Readiness

- Add Redis caching
- Add analytics overview
- Add Swagger docs
- Add tests
- Add logging
- Add deployment-ready Docker configuration

---

# Notes for SpecKit Usage

This document should be used as the backend planning source for SpecKit.

Recommended SpecKit flow:

1. Create the backend specification from this document
2. Generate the backend implementation plan
3. Break the work into tasks
4. Start with Spec 1 only
5. Validate each spec before moving to the next
6. Keep frontend work out of scope until backend APIs are stable

The first implementation request should focus only on:

```txt
Spec 1 — Core Backend Foundation
```

Do not implement the full platform in one step. Build the backend in controlled phases to keep the codebase clean, testable, and scalable.
