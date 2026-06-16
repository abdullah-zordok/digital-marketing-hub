import request = require('supertest');

import { activeSeoKnowledge } from '../support/chatbot-leads-fixtures';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('chatbot rate limits', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    process.env.CHATBOT_VISITOR_LIMIT = '100';
    process.env.CHATBOT_SOURCE_LIMIT = '1';
    context = await createTestApp();
    context.prismaService.addKnowledgeBaseItem(activeSeoKnowledge());
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('allows normal use and rejects excessive source messages', async () => {
    const sessionResponse = await request(context.app.getHttpServer())
      .post('/api/v1/chatbot/sessions')
      .send({ visitorId: 'visitor-limit-one' })
      .expect(201);
    const secondSessionResponse = await request(context.app.getHttpServer())
      .post('/api/v1/chatbot/sessions')
      .send({ visitorId: 'visitor-limit-two' })
      .expect(201);

    await request(context.app.getHttpServer())
      .post(`/api/v1/chatbot/sessions/${sessionResponse.body.data.id}/messages`)
      .send({ visitorId: 'visitor-limit-one', content: 'Which SEO service fits?' })
      .expect(201);

    await request(context.app.getHttpServer())
      .post(`/api/v1/chatbot/sessions/${secondSessionResponse.body.data.id}/messages`)
      .send({ visitorId: 'visitor-limit-two', content: 'Another SEO question' })
      .expect(429);
  });
});
