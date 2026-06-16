import { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request = require('supertest');

import { InMemoryPrismaService, testUser } from './in-memory-prisma.service';

export const CONTENT_PASSWORD = 'change-me-now';

export async function seedContentUsers(prismaService: InMemoryPrismaService): Promise<void> {
  const passwordHash = await bcrypt.hash(CONTENT_PASSWORD, 4);

  prismaService.addUser(
    testUser('00000000-0000-4000-8000-000000000101', 'admin@example.com', UserRole.ADMIN, passwordHash),
  );
  prismaService.addUser(
    testUser('00000000-0000-4000-8000-000000000102', 'editor@example.com', UserRole.EDITOR, passwordHash),
  );
  prismaService.addUser(
    testUser('00000000-0000-4000-8000-000000000103', 'viewer@example.com', UserRole.VIEWER, passwordHash),
  );
}

export async function accessTokenFor(app: INestApplication, email: string): Promise<string> {
  const loginResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password: CONTENT_PASSWORD })
    .expect(201);

  return loginResponse.body.data.tokens.accessToken;
}

export async function adminAccessTokenFor(app: INestApplication): Promise<string> {
  return accessTokenFor(app, 'admin@example.com');
}

export async function editorAccessTokenFor(app: INestApplication): Promise<string> {
  return accessTokenFor(app, 'editor@example.com');
}

export async function viewerAccessTokenFor(app: INestApplication): Promise<string> {
  return accessTokenFor(app, 'viewer@example.com');
}
