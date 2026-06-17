# Environment Contract: Production Readiness

## Runtime Modes

### Development

**Purpose**: Local development and integration validation.

**Required services**:
- API application
- PostgreSQL
- Redis

**Expected behavior**:
- Safe local defaults may be used when documented in `.env.example`.
- Database migration creation and local seed workflows are allowed.
- API documentation may be enabled by default.

### Production

**Purpose**: Production or production-like release validation.

**Required services**:
- API application
- PostgreSQL with persistent storage
- Redis with persistent or deployment-managed state

**Expected behavior**:
- All critical secrets must be explicit and strong enough for production use.
- Startup fails before serving traffic when critical configuration is missing or unsafe.
- Existing database migrations are applied through production-safe deployment behavior.
- Browser access is limited to configured trusted website and admin origins.
- API documentation exposure is controlled by configuration.

## Required Configuration Categories

| Category | Examples | Contract |
|----------|----------|----------|
| Runtime | `NODE_ENV`, `PORT`, base URLs | Must be validated at startup and documented with examples. |
| Data services | database URL, cache URL | Must be required for runtime startup and checked by health readiness. |
| Authentication | JWT secrets, token expiry | Must be required in production and never committed as real values. |
| Admin seed | admin email/password | Must be safe for local setup and production-controlled for real deployments. |
| Public origins | frontend/admin trusted origins | Must restrict browser-origin access to configured domains. |
| Upload limits | allowed types, max size | Must reject unsupported or oversized files before storage. |
| Traffic limits | login/chatbot/lead/upload limits | Must have documented thresholds and rejection behavior. |
| Documentation | docs enabled flag/path | Must allow documentation to be enabled for validation and controlled for production. |

## Secret Handling Rules

- Sample files must contain placeholder values only.
- Startup logs must not print raw secrets or full connection strings.
- Public APIs and health responses must not reveal secrets.
- Test fixtures may use fake values only.

## Health Readiness Rules

- Health output must report application status, data store status, cache store status, environment, and timestamp.
- Unavailable required dependencies must produce a not-ready or degraded result.
- Health output must not include credentials, tokens, raw URLs with passwords, or internal stack traces.
