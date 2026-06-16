const baseConfig = require('./jest.base.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
};
