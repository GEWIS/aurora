import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: fixupPluginRules(_import),
    },

    files: ['**/*.ts', '**/*.js'],

    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.spec.json',
      },
    },

    settings: {
      'import/extensions': ['.js', '.ts'],

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },

      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },

    rules: {
      'linebreak-style': ['error', 'unix'],
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'no-unused-expressions': 'off',
      'no-underscore-dangle': 'off',

      'import/extensions': [
        'off',
        'ignorePackages',
        {
          js: 'never',
          ts: 'never',
        },
      ],
    },
  },
];
