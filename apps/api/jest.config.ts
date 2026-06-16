import type { Config } from 'jest';

const baseProject: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};

const config: Config = {
  projects: [
    {
      ...baseProject,
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
    },
    {
      ...baseProject,
      displayName: 'contract',
      testMatch: ['<rootDir>/test/contract/**/*.contract-spec.ts'],
    },
    {
      ...baseProject,
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.e2e-spec.ts'],
    },
  ],
};

export default config;
