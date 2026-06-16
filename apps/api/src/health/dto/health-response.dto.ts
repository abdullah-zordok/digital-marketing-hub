export interface HealthResponseDto {
  api: 'ok';
  database: 'ok' | 'unavailable';
  redis: 'ok' | 'unavailable';
  environment: string;
  timestamp: string;
}
