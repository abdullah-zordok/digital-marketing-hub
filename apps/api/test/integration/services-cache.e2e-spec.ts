import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { adminAccessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { serviceRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('services public cache', () => {
  let context: TestAppContext;
  let accessToken: string;

  beforeAll(async () => {
    process.env.LOGIN_LIMIT = '20';
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    context.prismaService.addService(
      serviceRecord({
        id: '10000000-0000-4000-8000-000000000501',
        slug: 'cached-seo',
        title: 'Cached SEO',
        status: ContentStatus.PUBLISHED,
      }),
    );
    accessToken = await adminAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns cached public services and invalidates after admin changes', async () => {
    const firstPublicResponse = await request(context.app.getHttpServer())
      .get('/api/v1/services')
      .expect(200);

    expect(firstPublicResponse.body.data.items.map((service: { slug: string }) => service.slug)).toContain('cached-seo');

    const createdServiceResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Paid Ads',
        title: 'Paid Ads',
        slug: 'paid-ads',
        fullDescription: 'Paid ads planning and optimization.',
      })
      .expect(201);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/services/${createdServiceResponse.body.data.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const refreshedPublicResponse = await request(context.app.getHttpServer())
      .get('/api/v1/services')
      .expect(200);

    expect(refreshedPublicResponse.body.data.items.map((service: { slug: string }) => service.slug)).toEqual(
      expect.arrayContaining(['cached-seo', 'paid-ads']),
    );
  });
});
