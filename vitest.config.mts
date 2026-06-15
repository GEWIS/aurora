import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
const baseTest = {
  environment: 'node' as const,
  testTimeout: 30_000,
  silent: true,
  globals: false,
  coverage: {
    reportsDirectory: 'coverage',
    thresholds: {
      functions: 80,
      statements: 80,
      lines: 80,
      branches: 80,
    },
  },
};

export default defineConfig({
  test: {
    ...baseTest,
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          include: ['**/src/**/*.spec.ts'],
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
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
          name: 'integration',
          include: ['integration-test/modules/*.ts'],
        },
      },
    ],
  },
});
