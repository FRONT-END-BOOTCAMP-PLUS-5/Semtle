import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jestPlugin from 'eslint-plugin-jest';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    ignorePatterns: [
      'node_modules/',
      '.yarn/',
      '.vscode',
      'dist/',
      'build/',
      '.next/',
      'public/',
      'temp/',
    ],
    extends: [
      'next/core-web-vitals',
      'next/typescript',
    ],
    overrides: [
      {
        files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
        rules: {
        },
      },
    ],
  }),
  // Jest configuration for test files
  {
    files: ['**/*.test.{js,ts,jsx,tsx}', 'tests/**/*.{js,ts}', 'jest.setup.js', 'jest.config.mjs'],
    ...jestPlugin.configs['flat/recommended'],
  },
];

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  eslintConfig,
  eslintConfigPrettier,
]);
