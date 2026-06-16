import { ConfigService } from '@nestjs/config';

export function leadNotificationTarget(configService: ConfigService): string | undefined {
  return configService.get<string>('LEAD_NOTIFICATION_WEBHOOK_URL');
}
