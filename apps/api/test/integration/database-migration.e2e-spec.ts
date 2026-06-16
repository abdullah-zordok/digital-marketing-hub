import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('foundation migration smoke check', () => {
  it('creates all reserved foundation tables and foreign keys', () => {
    const migrationPath = join(
      __dirname,
      '../../prisma/migrations/20260616170000_core_backend_foundation/migration.sql',
    );
    const migrationSql = readFileSync(migrationPath, 'utf8');

    expect(migrationSql).toContain('CREATE TABLE "User"');
    expect(migrationSql).toContain('CREATE TABLE "UploadedFile"');
    expect(migrationSql).toContain('ALTER TABLE "ChatMessage" ADD CONSTRAINT');
  });
});
