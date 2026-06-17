import request = require('supertest');

import { createTestApp } from '../support/test-app';

describe('analytics overview contract', () => {
  it('rejects unauthenticated access', async () => {
    const { app } = await createTestApp();

    await request(app.getHttpServer()).get('/api/v1/admin/analytics/overview').expect(401);

    await app.close();
  });
});
