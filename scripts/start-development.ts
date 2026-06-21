import { execSync } from 'child_process';
import { existsSync } from 'fs';
import open from 'open';

const CORE_DB = 'apps/aurora-core/local.sqlite';
const URLS = {
  core: process.env.VITE_CORE_URL ?? 'http://localhost:3000',
  client: 'http://localhost:8081',
  backoffice: 'http://localhost:8080',
};

function sh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

async function retry<T>(
  fn: () => T | null | Promise<T | null>,
  { timeoutMs = 30_000, intervalMs = 2000 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await fn();
    if (result) return result;
    await delay(intervalMs);
  }
  throw new Error(`Timed out after ${timeoutMs / 1000}s`);
}

async function isCoreReady(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.ok || response.status >= 400;
  } catch {
    return false;
  }
}

function getApiKey(path: string): string | null {
  if (!existsSync(path)) return null;
  try {
    const rows = sh(
      `sqlite3 "${path}" "SELECT ak.key, s.name FROM api_key ak JOIN screen s ON ak.screenId = s.id LIMIT 1"`,
    );
    if (!rows) return null;
    const [key] = rows.split('|');
    return key.trim();
  } catch {
    return null;
  }
}

async function main() {
  console.info('Starting containers...');
  sh('docker compose up -d');

  console.info('Waiting for core to start...');
  await retry(() => isCoreReady(`${URLS.core}/api/auth/key`), { timeoutMs: 120_000 });

  const needsSeed = !existsSync(CORE_DB) || !getApiKey(CORE_DB);
  if (needsSeed) {
    console.info('Running seed...');
    sh('docker compose exec -T core pnpm --filter @gewis/aurora-core run seed:gewis');
  }

  console.info('Fetching API key...');
  const key = await retry(() => getApiKey(CORE_DB), { timeoutMs: 20_000 });

  console.info(
    '\n\x1b[32mDevelopment environment ready.\x1b[0m\n' +
      'Press Ctrl-C to stop the dev environment.\n',
  );

  if (!key) {
    console.warn(
      `\x1b[33mWarning: API key could not be fetched. Using unauthenticated client link.\x1b[0m`,
    );
  }

  const endpoints = {
    Core: URLS.core,
    Docs: `${URLS.core}/api-docs`,
    Client: key ? `${URLS.client}?key=${key}` : URLS.client,
    Backoffice: URLS.backoffice,
  };

  Object.entries(endpoints).forEach(([name, url]) => {
    console.info(`  ${name.padEnd(11)}: \x1b[36m${url}\x1b[0m`);
  });
  console.info('');

  await delay(1000);
  [endpoints.Docs, endpoints.Client, endpoints.Backoffice].forEach((url) => open(url));

  try {
    execSync('docker compose up', { stdio: 'inherit' });
  } catch {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
