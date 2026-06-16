import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@aurora': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    testTimeout: 30_000,
    silent: true,
    globals: false,
    include: ['**/src/**/*.spec.ts', 'integration-test/modules/*.ts'],
    coverage: {
      reportsDirectory: 'coverage',
      thresholds: {
        functions: 80,
        statements: 80,
        lines: 80,
        branches: 80,
      },
    },
    env: {
      TYPEORM_CONNECTION: 'sqlite',
      TYPEORM_DATABASE: ':memory:',
      TYPEORM_SYNCHRONIZE: 'true',
      TYPEORM_LOGGING: 'false',
      NODE_ENV: 'development',
      COOKIE_SECRET: 'test-secret',
      SESSION_SECRET: 'test-session-secret',
      CORS_ORIGINS: '*',
      ROLE_ADMIN: 'admin',
      ROLE_BOARD: 'board',
      ROLE_KEY_HOLDER: 'key-holder',
      ROLE_BAC: 'bac',
      ROLE_AVICO: 'avico',
      LOG_LEVEL: 'silent',
    },
  },
});
