import { validateEnvironment } from '../../../src/config/env.schema';
import { applyTestEnvironment } from '../../support/test-env';
import { productionReadyEnvironment } from '../../support/production-readiness-fixtures';

describe('environment validation', () => {
  beforeEach(() => {
    applyTestEnvironment();
  });

  it('accepts a complete foundation environment', () => {
    const environment = validateEnvironment(process.env);

    expect(environment.NODE_ENV).toBe('test');
    expect(environment.PORT).toBe(3000);
    expect(environment.STORAGE_DRIVER).toBe('local');
    expect(environment.UPLOAD_MAX_BYTES).toBe(5242880);
    expect(environment.UPLOAD_PUBLIC_PATH).toBe('/uploads');
  });

  it('rejects missing required values before startup', () => {
    const incompleteEnvironment = { ...process.env };
    delete incompleteEnvironment.DATABASE_URL;

    expect(() => validateEnvironment(incompleteEnvironment)).toThrow(
      /Invalid environment configuration: DATABASE_URL/,
    );
  });

  it('rejects weak JWT secrets before startup', () => {
    const unsafeEnvironment = {
      ...process.env,
      JWT_SECRET: 'short',
    };

    expect(() => validateEnvironment(unsafeEnvironment)).toThrow(/JWT_SECRET/);
  });

  it('accepts production readiness configuration values', () => {
    const environment = validateEnvironment(productionReadyEnvironment());

    expect(environment.NODE_ENV).toBe('production');
    expect(environment.TRUSTED_ORIGINS).toContain('https://www.example.com');
    expect(environment.DOCS_ENABLED).toBe(false);
    expect(environment.LOGIN_LIMIT).toBe(10);
  });

  it('rejects unsafe production placeholders', () => {
    const unsafeEnvironment = productionReadyEnvironment({
      JWT_SECRET: 'change-me-placeholder-secret-value',
    });

    expect(() => validateEnvironment(unsafeEnvironment)).toThrow(/JWT_SECRET/);
  });

  it('requires trusted origins in production', () => {
    const unsafeEnvironment = productionReadyEnvironment();
    delete unsafeEnvironment.TRUSTED_ORIGINS;

    expect(() => validateEnvironment(unsafeEnvironment)).toThrow(/TRUSTED_ORIGINS/);
  });
});
