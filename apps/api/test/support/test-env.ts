export function applyTestEnvironment(): void {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3000';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dmh_test';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.APP_BASE_URL = 'http://localhost:3000';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD = 'change-me-now';
  process.env.STORAGE_DRIVER = 'local';
  process.env.UPLOAD_MAX_BYTES = '5242880';
  process.env.UPLOAD_PUBLIC_PATH = '/uploads';
  process.env.UPLOAD_STORAGE_PATH = 'uploads-test';
  process.env.TRUSTED_ORIGINS = 'http://localhost:5173,http://localhost:3001';
  process.env.REQUEST_BODY_LIMIT = '1mb';
  process.env.DOCS_ENABLED = 'true';
  process.env.DOCS_PATH = 'api/docs';
  process.env.CACHE_DEFAULT_TTL_SECONDS = '300';
  process.env.PUBLIC_CONTENT_CACHE_TTL_SECONDS = '300';
  process.env.LOGIN_LIMIT = process.env.LOGIN_LIMIT ?? '10';
  process.env.LOGIN_WINDOW_SECONDS = process.env.LOGIN_WINDOW_SECONDS ?? '600';
  process.env.LEAD_LIMIT = process.env.LEAD_LIMIT ?? '20';
  process.env.LEAD_WINDOW_SECONDS = process.env.LEAD_WINDOW_SECONDS ?? '600';
  process.env.UPLOAD_LIMIT = process.env.UPLOAD_LIMIT ?? '10';
  process.env.UPLOAD_WINDOW_SECONDS = process.env.UPLOAD_WINDOW_SECONDS ?? '600';
  process.env.QUEUE_REDIS_URL = 'redis://localhost:6379';
  if (process.env.LEAD_NOTIFICATION_WEBHOOK_URL === undefined) {
    delete process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  }
  process.env.CHATBOT_VISITOR_LIMIT = process.env.CHATBOT_VISITOR_LIMIT ?? '20';
  process.env.CHATBOT_VISITOR_WINDOW_SECONDS = process.env.CHATBOT_VISITOR_WINDOW_SECONDS ?? '600';
  process.env.CHATBOT_SOURCE_LIMIT = process.env.CHATBOT_SOURCE_LIMIT ?? '100';
  process.env.CHATBOT_SOURCE_WINDOW_SECONDS = process.env.CHATBOT_SOURCE_WINDOW_SECONDS ?? '3600';
}
