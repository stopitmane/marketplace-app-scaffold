// Runs via jest.config.js's `setupFiles`, which executes before each test
// file's own imports - unlike assignments written inside a test file, which
// ES module import hoisting runs AFTER, not before. env.ts reads these at
// import time (fail-fast validation), so they must be set here, not there.
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET ??= 'test-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-secret';
