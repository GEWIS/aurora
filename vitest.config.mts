import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./integration-test/setup.ts'],
    testTimeout: 30_000,
    silent: true,
  },
});
