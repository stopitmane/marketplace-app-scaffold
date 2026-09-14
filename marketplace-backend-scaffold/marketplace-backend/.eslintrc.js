module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, jest: true },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    'no-console': 'off', // logger.ts is the sanctioned console user; everything else should import it
    // `declare global { namespace Express { ... } }` is the standard,
    // TypeScript-mandated way to augment Express's Request type (see
    // core/middleware/auth.ts and requestId.ts) - not a stylistic slip.
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Hand-rolled test fakes routinely need `as any` to satisfy a
      // constructor's parameter type with a partial fake - that's the
      // accepted cost of avoiding a mocking library, not a real type hole.
      files: ['tests/**/*.ts', '**/*.test.ts'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
  ],
};
