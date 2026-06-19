import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../aurora-core/apps/aurora-core/build/swagger.json',
  output: `./src/api`,
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/schemas',
    '@hey-api/sdk',
    {
      enums: 'typescript',
      name: '@hey-api/typescript',
    },
  ],
});
