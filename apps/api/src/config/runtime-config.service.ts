import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppEnvironment } from './env.schema';

@Injectable()
export class RuntimeConfigService {
  constructor(private readonly configService: ConfigService<AppEnvironment, true>) {}

  get nodeEnv(): AppEnvironment['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get requestBodyLimit(): string {
    return this.configService.get('REQUEST_BODY_LIMIT', { infer: true });
  }

  get docsEnabled(): boolean {
    return this.configService.get('DOCS_ENABLED', { infer: true });
  }

  get docsPath(): string {
    return this.configService.get('DOCS_PATH', { infer: true });
  }

  get uploadPublicPath(): string {
    return this.configService.get('UPLOAD_PUBLIC_PATH', { infer: true });
  }

  get uploadStoragePath(): string {
    return this.configService.get('UPLOAD_STORAGE_PATH', { infer: true });
  }

  trustedOrigins(): string[] {
    const configuredOrigins = this.configService.get('TRUSTED_ORIGINS', { infer: true });
    const fallbackOrigin = this.configService.get('FRONTEND_URL', { infer: true });
    return (configuredOrigins ?? fallbackOrigin)
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  trafficPolicyFor(endpointGroup: 'login' | 'chatbot' | 'lead' | 'upload'): { maxRequests: number; windowSeconds: number } {
    const policies = {
      login: {
        maxRequests: Number(this.configService.get('LOGIN_LIMIT', { infer: true })),
        windowSeconds: Number(this.configService.get('LOGIN_WINDOW_SECONDS', { infer: true })),
      },
      chatbot: {
        maxRequests: Number(this.configService.get('CHATBOT_VISITOR_LIMIT', { infer: true })),
        windowSeconds: Number(this.configService.get('CHATBOT_VISITOR_WINDOW_SECONDS', { infer: true })),
      },
      lead: {
        maxRequests: Number(this.configService.get('LEAD_LIMIT', { infer: true })),
        windowSeconds: Number(this.configService.get('LEAD_WINDOW_SECONDS', { infer: true })),
      },
      upload: {
        maxRequests: Number(this.configService.get('UPLOAD_LIMIT', { infer: true })),
        windowSeconds: Number(this.configService.get('UPLOAD_WINDOW_SECONDS', { infer: true })),
      },
    };

    return policies[endpointGroup];
  }
}
