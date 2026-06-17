import { ContentStatus, LeadStatus } from '@prisma/client';
import request = require('supertest');

import { seedContentUsers, viewerAccessTokenFor } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';
import {
  blogPostRecord,
  chatMessageRecord,
  chatSessionRecord,
  leadRecord,
  serviceRecord,
} from '../support/in-memory-prisma.service';

describe('analytics overview', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    context.prismaService.addLead(leadRecord({ status: LeadStatus.NEW }));
    context.prismaService.addLead(leadRecord({ status: LeadStatus.QUALIFIED }));
    context.prismaService.addService(serviceRecord({ status: ContentStatus.PUBLISHED }));
    context.prismaService.addService(serviceRecord({ status: ContentStatus.DRAFT }));
    context.prismaService.addBlogPost(blogPostRecord({ status: ContentStatus.PUBLISHED }));
    context.prismaService.addBlogPost(blogPostRecord({ status: ContentStatus.DRAFT }));
    const session = chatSessionRecord({});
    context.prismaService.addChatSession(session);
    context.prismaService.addChatMessage(chatMessageRecord({ sessionId: session.id }));
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns non-personal aggregate counts for authorized admin users', async () => {
    const accessToken = await viewerAccessTokenFor(context.app);

    const response = await request(context.app.getHttpServer())
      .get('/api/v1/admin/analytics/overview')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      totalLeads: 2,
      newLeads: 1,
      qualifiedLeads: 1,
      totalBlogPosts: 2,
      publishedBlogPosts: 1,
      totalServices: 2,
      publishedServices: 1,
      totalChatbotSessions: 1,
      totalChatbotMessages: 1,
    });
    expect(response.body.data.generatedAt).toEqual(expect.any(String));
    expect(JSON.stringify(response.body.data)).not.toContain('client@example.com');
  });
});
