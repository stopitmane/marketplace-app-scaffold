module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageThreshold: {
    // Modest starting bar - ratchet up as cart/orders modules get built out.
    global: { statements: 25, branches: 20, functions: 25, lines: 25 },
  },
};
