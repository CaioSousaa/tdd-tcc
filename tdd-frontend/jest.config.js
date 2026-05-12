const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^../../lib/axios$': '<rootDir>/lib/axios.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/*.test.tsx', '**/*.test.ts'],
};

module.exports = createJestConfig(config);
