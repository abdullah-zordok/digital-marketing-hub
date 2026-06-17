import { Logger } from '@nestjs/common';
import request = require('supertest');

import { createTestApp, TestAppContext } from '../support/test-app';

describe('operational logging', () => {
  const originalFetch = global.fetch;
  let context: TestAppContext;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(async () => {
    process.env.LOGIN_LIMIT = '20';
    process.env.LEAD_LIMIT = '20';
    process.env.LEAD_NOTIFICATION_WEBHOOK_URL = 'https://workflow.example/webhook';
    global.fetch = async () => ({ ok: false, status: 500 }) as Response;
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.app.close();
    global.fetch = originalFetch;
    delete process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs authentication failures without exposing submitted credentials', async () => {
    await request(context.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong-password' })
      .expect(401);

    const warningLogs = warnSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(warningLogs).toContain('auth.failure');
    expect(warningLogs).toContain('[REDACTED_EMAIL]');
    expect(warningLogs).not.toContain('missing@example.com');
    expect(warningLogs).not.toContain('wrong-password');
  });

  it('logs lead notification failures without exposing lead contact details', async () => {
    await request(context.app.getHttpServer())
      .post('/api/v1/leads')
      .send({ email: 'logging-lead@example.com', serviceInterest: 'SEO Strategy' })
      .expect(201);

    const errorLogs = errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(errorLogs).toContain('lead.notification.failed');
    expect(errorLogs).toContain('500');
    expect(errorLogs).not.toContain('logging-lead@example.com');
  });
});
