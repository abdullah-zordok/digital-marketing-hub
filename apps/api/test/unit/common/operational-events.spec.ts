import { Logger } from '@nestjs/common';

import { OperationalLoggerService } from '../../../src/common/services/operational-logger.service';

describe('operational event redaction', () => {
  const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redacts authentication context', () => {
    new OperationalLoggerService().logEvent({
      eventType: 'auth.failure',
      severity: 'warning',
      safeContext: { email: 'admin@example.com', password: 'raw-password' },
    });

    const loggedEvent = String(warnSpy.mock.calls[0][0]);
    expect(loggedEvent).toContain('[REDACTED_EMAIL]');
    expect(loggedEvent).toContain('[REDACTED]');
    expect(loggedEvent).not.toContain('admin@example.com');
    expect(loggedEvent).not.toContain('raw-password');
  });

  it('redacts lead, chatbot, and notification failure context', () => {
    new OperationalLoggerService().logEvent({
      eventType: 'lead.notification.failed',
      severity: 'error',
      safeContext: {
        leadId: 'lead-1',
        token: 'secret-token',
        chatbot: { message: 'Contact user@example.com', authorization: 'Bearer raw-token' },
      },
    });

    const loggedEvent = String(errorSpy.mock.calls[0][0]);
    expect(loggedEvent).toContain('lead-1');
    expect(loggedEvent).toContain('[REDACTED_EMAIL]');
    expect(loggedEvent).toContain('[REDACTED]');
    expect(loggedEvent).not.toContain('user@example.com');
    expect(loggedEvent).not.toContain('raw-token');
  });
});
