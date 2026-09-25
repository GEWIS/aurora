import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  platform: 'node',
  external: [
    /^node:/,
    'sqlite3',
    'mysql2',
    'typeorm',
    'swagger-ui-express',
    'pino',
    'pino-http',
    'pino-pretty',
    'typescript',
    'tsoa',
    'yargs',
    'node-cron',
  ],
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: 'src/index.js',
    chunkFileNames: 'chunks/[name].js',
    sourcemap: true,
  },
});
