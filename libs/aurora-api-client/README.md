# Aurora API Client

TypeScript HTTP client for the Aurora API, generated from the [OpenAPI specification](openapi.json) using [@hey-api/openapi-ts](https://heyapi.dev/).

## Usage

```ts
import { client } from '@gewis/aurora-api-client/client.gen';
import { getApiKeys } from '@gewis/aurora-api-client';

client.setConfig({ baseUrl: 'https://aurora.example.com', auth: async () => 'your-api-key' });

const keys = await getApiKeys();
```

The package also exports the raw OpenAPI spec:

```ts
import spec from '@gewis/aurora-api-client/openapi.json';
```

## Staying in sync

The source of truth is `openapi.json` in this directory. When the API spec changes
(e.g. after pulling changes from `master`), regenerate the client:

```bash
pnpm sync
```

To verify the generated client is up to date (useful in CI):

```bash
pnpm sync-check
```

The `sync-check` command regenerates the client in a temporary directory and compares it
against the committed output — no-op when the spec hasn't changed, fails when the generated
files need updating.
