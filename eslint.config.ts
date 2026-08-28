import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from 'typescript-eslint';

const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/pnpm-*/**',
];

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'local',
        },
      ],
    },
  },
  {
    files: ['projects/*/src/**/*.ts', 'projects/*/src/**/*.gs'],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  globalIgnores(ignores),
]);
