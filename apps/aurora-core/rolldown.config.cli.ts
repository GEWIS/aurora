import { defineConfig } from 'rolldown';

// CLI entrypoints that TypeORM/the shell invoke directly. They are bundled
// with rolldown (not tsc) because oxc, unlike esbuild/ts-node, emits the
// decorator metadata TypeORM needs at runtime.
export default defineConfig({
  input: {
    'typeorm-cli': 'src/typeorm-cli.ts',
    'seed/index': 'src/seed/index.ts',
    validate: 'src/validate.ts',
  },
  platform: 'node',
  external: [
    /^node:/,
    'sqlite3',
    'mysql2',
    'typeorm',
    'tsoa',
    'commander',
    'pino',
    'pino-http',
    'pino-pretty',
    'typescript',
    'yargs',
    /^yargs(\/.*)?$/,
  ],
  output: {
    dir: 'build/cli',
    format: 'esm',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    sourcemap: true,
  },
});
