import request = require('supertest');

import { activeSeoKnowledge } from '../support/chatbot-leads-fixtures';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('chatbot assistant', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addKnowledgeBaseItem(activeSeoKnowledge());
  });

  afterAll(async () => {
    await context.app.close();
  });

  it.each([
    ['Which SEO service fits my business?', 'SEO Strategy'],
    ['Give me guaranteed results', 'cannot provide'],
    ['Do you build mobile apps?', 'do not have enough approved information'],
  ])('answers visitor prompt safely: %s', async (content, expectedText) => {
    const sessionResponse = await request(context.app.getHttpServer())
      .post('/api/v1/chatbot/sessions')
      .send({ visitorId: 'visitor-assistant' })
      .expect(201);

    const response = await request(context.app.getHttpServer())
      .post(`/api/v1/chatbot/sessions/${sessionResponse.body.data.id}/messages`)
      .send({ visitorId: 'visitor-assistant', content })
      .expect(201);

    expect(response.body.data.assistantMessage.content).toContain(expectedText);
  });
});
