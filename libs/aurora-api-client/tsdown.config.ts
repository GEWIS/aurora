import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/api-client/index.ts',
    'src/api-client/client.gen.ts',
    'src/api-client/schemas.gen.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: { tsconfig: './tsconfig.lib.json' },
});
