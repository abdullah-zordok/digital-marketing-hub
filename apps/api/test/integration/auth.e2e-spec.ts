import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request = require('supertest');

import { createTestApp, TestAppContext } from '../support/test-app';
import { testUser } from '../support/in-memory-prisma.service';

describe('admin authentication flow', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    const passwordHash = await bcrypt.hash('change-me-now', 4);
    context.prismaService.addUser(
      testUser('00000000-0000-4000-8000-000000000001', 'admin@example.com', UserRole.ADMIN, passwordHash),
    );
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('supports login, current identity, refresh, logout, and protected rejection', async () => {
    const loginResponse = await request(context.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'change-me-now' })
      .expect(201);

    const accessToken = loginResponse.body.data.tokens.accessToken;
    const refreshToken = loginResponse.body.data.tokens.refreshToken;

    expect(loginResponse.body.data.user).toMatchObject({
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    await request(context.app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(context.app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    await request(context.app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    const rejectedResponse = await request(context.app.getHttpServer())
      .get('/api/v1/admin/probe')
      .expect(401);

    expect(rejectedResponse.body).toMatchObject({
      success: false,
      message: 'Authentication is required',
    });
  });
});
