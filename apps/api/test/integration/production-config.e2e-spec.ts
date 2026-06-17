import { validateEnvironment } from '../../src/config/env.schema';
import { productionReadyEnvironment } from '../support/production-readiness-fixtures';

describe('production configuration safety', () => {
  it('fails startup validation when a production secret is missing', () => {
    const unsafeEnvironment = productionReadyEnvironment();
    delete unsafeEnvironment.JWT_SECRET;

    expect(() => validateEnvironment(unsafeEnvironment)).toThrow(/JWT_SECRET/);
  });

  it('fails startup validation when a production default is unsafe', () => {
    expect(() =>
      validateEnvironment(
        productionReadyEnvironment({
          ADMIN_PASSWORD: 'change-me-change-me-change-me-change-me',
        }),
      ),
    ).toThrow(/ADMIN_PASSWORD/);
  });
});
