# Quickstart: Core Backend Foundation

This guide defines the validation path for the Core Backend Foundation after implementation tasks are complete.

## Prerequisites

- Docker Desktop or compatible Docker engine is running.
- pnpm is available for local commands.
- The repository contains the backend workspace defined in [plan.md](./plan.md).
- `.env` is created from `.env.example` with all required foundation values.

## Setup

1. Install dependencies:

   ```powershell
   pnpm install
   ```

2. Start the backend environment:

   ```powershell
   docker compose up --build
   ```

3. In a separate terminal, generate and migrate the data model if not handled by container startup:

   ```powershell
   pnpm --filter @digital-marketing-hub/api prisma:generate
   pnpm --filter @digital-marketing-hub/api prisma:deploy
   pnpm --filter @digital-marketing-hub/api seed
   ```

## Validation Scenarios

### 1. Health Status

Request:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/v1/health"
```

Expected outcome:

- Response uses the standard success envelope.
- Data includes application status, database status, Redis status, environment, and timestamp.

### 2. Missing Configuration Fails Startup

Temporarily remove one required value from `.env`, then restart the backend.

Expected outcome:

- Backend refuses to start.
- Startup output identifies the missing or invalid configuration value.

### 3. Admin Login

Request:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/v1/auth/login" -ContentType "application/json" -Body '{"email":"admin@example.com","password":"change-me"}'
```

Expected outcome:

- Valid credentials return the standard success envelope.
- Response includes an access token and refresh capability.
- Response does not include password hashes or other credential secrets.

### 4. Current Admin Identity

Request:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/v1/auth/me" -Headers @{ Authorization = "Bearer <access-token>" }
```

Expected outcome:

- Valid token returns the current user's id, email, role, and status.
- Invalid, expired, or missing token returns the standard error envelope.

### 5. Refresh Session

Request:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/v1/auth/refresh" -ContentType "application/json" -Body '{"refreshToken":"<refresh-token>"}'
```

Expected outcome:

- Valid refresh token returns a renewed access token.
- Invalid refresh token is rejected.

### 6. Logout

Request:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/v1/auth/logout" -Headers @{ Authorization = "Bearer <access-token>" }
```

Expected outcome:

- Logout returns the standard success envelope.
- The same session can no longer be used where session invalidation applies.

### 7. Protected Admin Probe

Request without a token:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/v1/admin/probe"
```

Expected outcome:

- Request is rejected.
- Response uses the standard error envelope.
- No private admin data is returned.

Request with a valid admin token:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/v1/admin/probe" -Headers @{ Authorization = "Bearer <access-token>" }
```

Expected outcome:

- Request succeeds for an authorized role.
- Response confirms authenticated admin access.

### 8. Request Validation

Send malformed login input:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/v1/auth/login" -ContentType "application/json" -Body '{"email":"not-an-email"}'
```

Expected outcome:

- Request is not processed as a login attempt.
- Response uses the standard error envelope.
- Validation errors identify invalid or missing fields.

### 9. Role Validation

Seeded non-production users are available for role checks:

```txt
editor@example.com
viewer@example.com
```

Use the configured `ADMIN_PASSWORD` value for these accounts, sign in, then request the protected admin probe.

Expected outcome:

- ADMIN, EDITOR, and VIEWER can read the protected admin probe.
- Requests with no token, expired token, tampered token, or unsupported role are rejected with the standard error envelope.

## Automated Checks

Run foundation checks:

```powershell
pnpm --filter @digital-marketing-hub/api test
pnpm --filter @digital-marketing-hub/api test:unit
pnpm --filter @digital-marketing-hub/api test:contract
pnpm --filter @digital-marketing-hub/api test:integration
pnpm --filter @digital-marketing-hub/api build
```

Expected outcome:

- Unit tests pass for configuration validation, auth service behavior, password handling, response formatting, and role guards.
- Integration tests pass for health, auth login, auth me, auth refresh, logout, protected admin rejection, role authorization, and validation errors.

## Contract Reference

The foundation API contract is documented in [contracts/core-backend-foundation.openapi.yaml](./contracts/core-backend-foundation.openapi.yaml).
