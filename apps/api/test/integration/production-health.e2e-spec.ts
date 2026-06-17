import request = require('supertest');

import { createTestApp } from '../support/test-app';

describe('production health integration', () => {
  it('reports dependency readiness and a server timestamp', async () => {
    const { app } = await createTestApp();

    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(Date.parse(response.body.data.timestamp)).not.toBeNaN();
    expect(response.body.data.checks.database).toBe('ready');
    expect(response.body.data.checks.cache).toBe('ready');

    await app.close();
  });
});
