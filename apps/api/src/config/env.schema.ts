import { z } from 'zod';

const productionPlaceholders = [
  'change-me',
  'placeholder',
  'test-secret',
  'your-secret',
  'example-secret',
];

const sizeLimitSchema = z.string().regex(/^\d+(b|kb|mb)$/i);
const stringBooleanSchema = z.preprocess((rawValue) => {
  if (typeof rawValue === 'string') {
    return rawValue.toLowerCase() === 'true';
  }

  return rawValue;
}, z.boolean());

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
  TRUSTED_ORIGINS: z.string().min(1).optional(),
  REQUEST_BODY_LIMIT: sizeLimitSchema.default('1mb'),
  DOCS_ENABLED: stringBooleanSchema.default(false),
  DOCS_PATH: z.string().min(1).default('api/docs'),
  CACHE_DEFAULT_TTL_SECONDS: z.coerce.number().int().min(1).default(300),
  PUBLIC_CONTENT_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(300),
  LOGIN_LIMIT: z.coerce.number().int().min(1).default(10),
  LOGIN_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
  LEAD_LIMIT: z.coerce.number().int().min(1).default(20),
  LEAD_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
  UPLOAD_LIMIT: z.coerce.number().int().min(1).default(10),
  UPLOAD_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
  QUEUE_REDIS_URL: z.string().url().optional(),
  CHATBOT_VISITOR_LIMIT: z.coerce.number().int().min(1).default(20),
  CHATBOT_VISITOR_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
  CHATBOT_SOURCE_LIMIT: z.coerce.number().int().min(1).default(100),
  CHATBOT_SOURCE_WINDOW_SECONDS: z.coerce.number().int().min(1).default(3600),
}).superRefine((environment, context) => {
  if (environment.NODE_ENV !== 'production') {
    return;
  }

  requireProductionSecret('JWT_SECRET', environment.JWT_SECRET, context);
  requireProductionSecret('ADMIN_PASSWORD', environment.ADMIN_PASSWORD, context);
  requireProductionSecret('OPENAI_API_KEY', environment.OPENAI_API_KEY, context);

  if (!environment.TRUSTED_ORIGINS) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['TRUSTED_ORIGINS'],
      message: 'Trusted origins are required in production',
    });
  }
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

function requireProductionSecret(
  key: keyof AppEnvironment,
  secretValue: string,
  context: z.RefinementCtx,
): void {
  const normalizedSecret = secretValue.toLowerCase();
  const unsafeSecret = productionPlaceholders.some((placeholder) => normalizedSecret.includes(placeholder));

  if (secretValue.length < 32 || unsafeSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [key],
      message: 'Production secret must be explicit and strong',
    });
  }
}
