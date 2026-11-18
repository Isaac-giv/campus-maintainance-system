// apps/server/eslint.config.js
// ESLint flat config (v9) for the Express server package.
// JavaScript ES Modules only — no TypeScript.

import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Errors
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off', // server code may log
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-throw-literal': 'error',

      // Warnings
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'hack'] }],
    },
  },
  {
    // Prisma seed may use console extensively
    files: ['prisma/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'src/generated/'],
  },
]
