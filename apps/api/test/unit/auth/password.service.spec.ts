import { PasswordService } from '../../../src/modules/auth/password.service';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  it('matches the original password against the protected hash', async () => {
    const passwordHash = await passwordService.hashPassword('change-me-now');

    await expect(passwordService.passwordMatches('change-me-now', passwordHash)).resolves.toBe(
      true,
    );
    await expect(passwordService.passwordMatches('wrong-password', passwordHash)).resolves.toBe(
      false,
    );
  });
});
