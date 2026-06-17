import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { activeSeoKnowledge } from '../support/chatbot-leads-fixtures';
import { adminAccessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { serviceRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

jest.setTimeout(30_000);

describe('performance readiness', () => {
  let context: TestAppContext;
  let accessToken: string;

  beforeAll(async () => {
    process.env.LOGIN_LIMIT = '30';
    process.env.LEAD_LIMIT = '30';
    process.env.CHATBOT_VISITOR_LIMIT = '30';
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    context.prismaService.addService(serviceRecord({ slug: 'fast-service', status: ContentStatus.PUBLISHED }));
    context.prismaService.addKnowledgeBaseItem(activeSeoKnowledge());
    accessToken = await adminAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('keeps representative public and admin requests within readiness targets', async () => {
    await expectRequestWithin('public services', 500, () =>
      request(context.app.getHttpServer()).get('/api/v1/services').expect(200),
    );
    await expectRequestWithin('lead capture', 2_000, () =>
      request(context.app.getHttpServer())
        .post('/api/v1/leads')
        .send({ email: 'perf-lead@example.com', serviceInterest: 'SEO Strategy' })
        .expect(201),
    );

    const sessionResponse = await request(context.app.getHttpServer())
      .post('/api/v1/chatbot/sessions')
      .send({ visitorId: 'perf-visitor' })
      .expect(201);

    await expectRequestWithin('chatbot message', 2_000, () =>
      request(context.app.getHttpServer())
        .post(`/api/v1/chatbot/sessions/${sessionResponse.body.data.id}/messages`)
        .send({ visitorId: 'perf-visitor', content: 'Tell me about SEO Strategy' })
        .expect(201),
    );
    await expectRequestWithin('analytics overview', 2_000, () =>
      request(context.app.getHttpServer())
        .get('/api/v1/admin/analytics/overview')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200),
    );
  });
});

async function expectRequestWithin(label: string, maxMs: number, requestFactory: () => Promise<unknown>): Promise<void> {
  const startedAt = Date.now();
  await requestFactory();
  expect(Date.now() - startedAt).toBeLessThanOrEqual(maxMs);
}
