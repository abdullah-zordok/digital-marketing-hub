const baseConfig = require('./jest.base.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/test/integration/**/*.e2e-spec.ts'],
};
