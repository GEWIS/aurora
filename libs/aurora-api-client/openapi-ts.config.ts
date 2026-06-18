import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'openapi.json',
  output: 'src/api-client',
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/sdk',
    {
      enums: 'typescript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/schemas',
      type: 'json',
    },
  ],
});
