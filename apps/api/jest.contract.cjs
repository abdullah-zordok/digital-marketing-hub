const baseConfig = require('./jest.base.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'contract',
  testMatch: ['<rootDir>/test/contract/**/*.contract-spec.ts'],
};
