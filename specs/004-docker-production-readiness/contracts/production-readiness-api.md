# API Contract: Production Readiness

All responses follow the project response envelope unless an external documentation UI returns a non-JSON document.

## GET /api/v1/health

**Audience**: Operators, release checks, uptime probes

**Authentication**: Public-safe

**Success response**:

```json
{
  "success": true,
  "message": "Health status retrieved",
  "data": {
    "status": "ready",
    "environment": "production",
    "timestamp": "2026-06-16T00:00:00.000Z",
    "checks": {
      "api": "ready",
      "database": "ready",
      "cache": "ready"
    }
  }
}
```

**Failure or degraded response**:

```json
{
  "success": false,
  "message": "Service is not ready",
  "data": {
    "status": "not_ready",
    "environment": "production",
    "timestamp": "2026-06-16T00:00:00.000Z",
    "checks": {
      "api": "ready",
      "database": "not_ready",
      "cache": "ready"
    }
  }
}
```

**Contract rules**:
- Must not expose credentials, raw connection strings, tokens, or stack traces.
- Must distinguish ready and not-ready dependency states.

## GET /api/v1/admin/analytics/overview

**Audience**: Admin dashboard

**Authentication**: Required

**Authorization**: Admin, editor, or viewer may read; only valid authenticated admin users can access.

**Success response**:

```json
{
  "success": true,
  "message": "Analytics overview retrieved",
  "data": {
    "totalLeads": 24,
    "newLeads": 7,
    "qualifiedLeads": 5,
    "totalBlogPosts": 18,
    "publishedBlogPosts": 12,
    "totalServices": 8,
    "publishedServices": 6,
    "totalChatbotSessions": 41,
    "totalChatbotMessages": 136,
    "generatedAt": "2026-06-16T00:00:00.000Z"
  }
}
```

**Contract rules**:
- Unauthenticated requests must be rejected.
- Metrics must be non-negative integers.
- Response must not expose individual lead or visitor personal data.

## API Documentation Endpoint

**Path**: `/api/docs`

**Audience**: Developers, frontend integrators, release reviewers

**Contract rules**:
- Must document auth, services, blog, leads, chatbot, uploads, analytics, admin, and health capabilities.
- Documentation exposure must be configurable for production.
- Generated documentation must match implemented route behavior and response envelopes.

## Traffic-Limited Endpoint Behavior

**Applies to**:
- Authentication login
- Chatbot messages
- Lead creation
- Uploads
- Other configured abuse-prone public endpoints

**Rate-limited response**:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errors": []
}
```

**Contract rules**:
- Rejections must use a public-safe message.
- Rejections must not reveal account existence, internal counters, secret keys, or infrastructure details.
- Retry timing may be exposed only through safe standard headers or documented response metadata.

## Cached Public Content Behavior

**Applies to**:
- Published services list/detail
- Published blog list/detail
- Public settings when available

**Contract rules**:
- Cached responses must remain public-safe.
- Admin content changes must invalidate or refresh affected public content.
- Query parameters that affect results must be reflected in cache identity.
