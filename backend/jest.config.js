/** @type {import('jest').Config} */
module.exports = {
  // Compile TypeScript test files via ts-jest.
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Keep backend tests under src for co-located test structure.
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Coverage ignores runtime bootstrap files.
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/app.ts'],
  // Global setup hooks (database connect/disconnect).
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    // Force deterministic UUID values in tests.
    '^uuid$': '<rootDir>/src/__tests__/__mocks__/uuid.js',
  },
};