import { ChatSessionStatus } from '@prisma/client';
import request = require('supertest');

import { activeSeoKnowledge } from '../support/chatbot-leads-fixtures';
import { chatSessionRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('chatbot sessions', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addKnowledgeBaseItem(activeSeoKnowledge());
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('creates sessions, stores messages, and returns chronological history', async () => {
    const sessionResponse = await request(context.app.getHttpServer())
      .post('/api/v1/chatbot/sessions')
      .send({ visitorId: 'visitor-history', sourcePage: '/services/seo' })
      .expect(201);

    await request(context.app.getHttpServer())
      .post(`/api/v1/chatbot/sessions/${sessionResponse.body.data.id}/messages`)
      .send({ visitorId: 'visitor-history', content: 'Which SEO service fits?' })
      .expect(201);

    const historyResponse = await request(context.app.getHttpServer())
      .get(`/api/v1/chatbot/sessions/${sessionResponse.body.data.id}/messages?visitorId=visitor-history`)
      .expect(200);

    expect(historyResponse.body.data.items.map((message: { role: string }) => message.role)).toEqual(['USER', 'ASSISTANT']);
  });

  it('rejects closed sessions and wrong visitor access', async () => {
    const closedSession = chatSessionRecord({ visitorId: 'visitor-closed', status: ChatSessionStatus.CLOSED });
    context.prismaService.addChatSession(closedSession);

    await request(context.app.getHttpServer())
      .post(`/api/v1/chatbot/sessions/${closedSession.id}/messages`)
      .send({ visitorId: 'visitor-closed', content: 'Hello' })
      .expect(404);

    await request(context.app.getHttpServer())
      .get(`/api/v1/chatbot/sessions/${closedSession.id}/messages?visitorId=other-visitor`)
      .expect(404);
  });
});
