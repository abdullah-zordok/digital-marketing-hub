import { Logger } from '@nestjs/common';

import { OperationalLoggerService } from '../../../src/common/services/operational-logger.service';

describe('OperationalLoggerService', () => {
  const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats operational events with redacted context', () => {
    new OperationalLoggerService().logEvent({
      eventType: 'auth.failure',
      severity: 'warning',
      safeContext: { email: 'admin@example.com', token: 'raw-token' },
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[REDACTED_EMAIL]'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
  });

  it('routes events by severity', () => {
    const logger = new OperationalLoggerService();

    logger.logEvent({ eventType: 'startup.ready', severity: 'info' });
    logger.logEvent({ eventType: 'dependency.failed', severity: 'error' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
