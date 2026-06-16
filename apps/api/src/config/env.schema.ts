import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
  OPENAI_API_KEY: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  STORAGE_DRIVER: z.enum(['local', 's3']),
  UPLOAD_MAX_BYTES: z.coerce.number().int().min(1).default(5_242_880),
  UPLOAD_PUBLIC_PATH: z.string().min(1).default('/uploads'),
  UPLOAD_STORAGE_PATH: z.string().min(1).default('uploads'),
  LEAD_NOTIFICATION_WEBHOOK_URL: z.union([z.string().url(), z.literal('')]).optional(),
  CHATBOT_VISITOR_LIMIT: z.coerce.number().int().min(1).default(20),
  CHATBOT_VISITOR_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
  CHATBOT_SOURCE_LIMIT: z.coerce.number().int().min(1).default(100),
  CHATBOT_SOURCE_WINDOW_SECONDS: z.coerce.number().int().min(1).default(3600),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export function validateEnvironment(rawEnvironment: Record<string, unknown>): AppEnvironment {
  const parsedEnvironment = environmentSchema.safeParse(rawEnvironment);

  if (parsedEnvironment.success) {
    return parsedEnvironment.data;
  }

  const missingFields = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${missingFields}`);
}
