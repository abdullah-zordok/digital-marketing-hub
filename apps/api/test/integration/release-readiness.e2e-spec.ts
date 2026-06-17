import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('release readiness evidence', () => {
  const repositoryRoot = join(__dirname, '../../../..');

  it('documents quickstart commands and release evidence locations', () => {
    const quickstart = readFileSync(
      join(repositoryRoot, 'specs/004-docker-production-readiness/quickstart.md'),
      'utf8',
    );
    const checklist = readFileSync(join(repositoryRoot, 'docs/release-readiness-checklist.md'), 'utf8');
    const smokeScript = readFileSync(join(repositoryRoot, 'scripts/validate-docker-smoke.ps1'), 'utf8');

    expect(quickstart).toContain('pnpm build');
    expect(quickstart).toContain('pnpm test:unit');
    expect(quickstart).toContain('docker compose up --build');
    expect(quickstart).toContain('docs/release-readiness-checklist.md');
    expect(checklist).toContain('| Check ID | Category | Status | Blocking | Owner | Evidence |');
    expect(smokeScript).toContain('Assert-ServiceDefined -ServiceName "api"');
    expect(smokeScript).toContain('Invoke-RestMethod');
  });
});
