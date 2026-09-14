module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-constant-condition': ['error', { checkLoops: false }],
  },
  overrides: [
    {
      files: ['__tests__/**/*.ts', '**/*.test.ts'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
  ],
  env: { es2021: true, node: true, jest: true },
};
