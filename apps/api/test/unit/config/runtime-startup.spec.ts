import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('runtime startup command contract', () => {
  it('uses production-safe migration deployment in Docker Compose', () => {
    const composeFile = readFileSync(join(__dirname, '../../../../../docker-compose.yml'), 'utf8');

    expect(composeFile).toContain('prisma:deploy');
    expect(composeFile).not.toContain('prisma migrate dev');
  });
});
