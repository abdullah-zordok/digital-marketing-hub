param(
  [string]$ComposeFile = "docker-compose.yml",
  [string]$HealthUrl = "http://localhost:3000/api/v1/health"
)

$ErrorActionPreference = "Stop"

function Assert-ServiceDefined {
  param([string]$ServiceName)

  $services = docker compose -f $ComposeFile config --services
  if ($services -notcontains $ServiceName) {
    throw "Docker Compose service '$ServiceName' is not defined."
  }
}

Assert-ServiceDefined -ServiceName "api"
Assert-ServiceDefined -ServiceName "postgres"
Assert-ServiceDefined -ServiceName "redis"

$composeConfig = docker compose -f $ComposeFile config
foreach ($volumeName in @("postgres_data", "redis_data")) {
  if ($composeConfig -notmatch $volumeName) {
    throw "Docker Compose volume '$volumeName' is not configured."
  }
}

try {
  $healthResponse = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 5
  if (-not $healthResponse.data.status) {
    throw "Health response did not include readiness status."
  }
} catch {
  throw "Docker smoke health check failed: $($_.Exception.Message)"
}

Write-Host "Docker smoke validation passed."
