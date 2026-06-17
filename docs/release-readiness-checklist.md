# Release Readiness Checklist

| Check ID | Category | Status | Blocking | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| docker-smoke | docker | fail | yes | Engineering | Run `pnpm smoke:docker` and attach output. |
| config-secrets | configuration | fail | yes | Engineering | Run production config validation tests. |
| security-defaults | security | fail | yes | Engineering | Run security defaults integration tests. |
| traffic-limits | security | fail | yes | Engineering | Run traffic-limit integration tests. |
| health-readiness | observability | fail | yes | Engineering | Capture `/api/v1/health` output. |
| analytics-overview | API | fail | no | Engineering | Run analytics overview tests. |
| backup-restore | recovery | skipped | yes | Operations | Provide rehearsal notes before release. |
