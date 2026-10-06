// @ts-check

import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import * as reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const separatedStatements = [
  'function',
  'class',
  'interface',
  'type',
  'export',
  'block-like',
  'multiline-expression',
  'multiline-const',
  'multiline-let',
]

export default defineConfig(
  globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: [
      'src/**/*.{ts,tsx}',
      'e2e/**/*.ts',
      'scripts/**/*.mjs',
      'vite.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
    ],
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: '*', next: separatedStatements },
        { blankLine: 'always', prev: separatedStatements, next: '*' },
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
)
