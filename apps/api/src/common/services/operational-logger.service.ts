import { Injectable, Logger } from '@nestjs/common';

import { redactOperationalContext } from '../utils/redaction.util';

export type OperationalSeverity = 'info' | 'warning' | 'error';

export interface OperationalEvent {
  eventType: string;
  severity: OperationalSeverity;
  safeContext?: Record<string, unknown>;
}

@Injectable()
export class OperationalLoggerService {
  private readonly logger = new Logger(OperationalLoggerService.name);

  logEvent(event: OperationalEvent): void {
    const eventBody = {
      eventType: event.eventType,
      severity: event.severity,
      timestamp: new Date().toISOString(),
      safeContext: redactOperationalContext(event.safeContext ?? {}),
    };
    const serializedEvent = JSON.stringify(eventBody);

    if (event.severity === 'error') {
      this.logger.error(serializedEvent);
      return;
    }

    if (event.severity === 'warning') {
      this.logger.warn(serializedEvent);
      return;
    }

    this.logger.log(serializedEvent);
  }
}
