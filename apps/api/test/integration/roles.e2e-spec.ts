import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request = require('supertest');

import { createTestApp, TestAppContext } from '../support/test-app';
import { testUser } from '../support/in-memory-prisma.service';

describe('role authorization', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    const passwordHash = await bcrypt.hash('change-me-now', 4);
    context.prismaService.addUser(
      testUser('00000000-0000-4000-8000-000000000002', 'viewer@example.com', UserRole.VIEWER, passwordHash),
    );
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('allows a viewer to read the protected admin probe', async () => {
    const loginResponse = await request(context.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'viewer@example.com', password: 'change-me-now' })
      .expect(201);

    const accessToken = loginResponse.body.data.tokens.accessToken;
    const probeResponse = await request(context.app.getHttpServer())
      .get('/api/v1/admin/probe')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(probeResponse.body.data.user).toMatchObject({
      email: 'viewer@example.com',
      role: 'VIEWER',
    });
  });
});
