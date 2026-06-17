export interface HealthResponseDto {
  status: 'ready' | 'not_ready' | 'degraded';
  environment: string;
  timestamp: string;
  checks: {
    api: 'ready';
    database: 'ready' | 'not_ready';
    cache: 'ready' | 'not_ready';
  };
}
