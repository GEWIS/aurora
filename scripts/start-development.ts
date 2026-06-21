import { execSync } from 'child_process';
import { existsSync } from 'fs';
import open from 'open';

const CORE_DB = 'apps/aurora-core/local.sqlite';

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
  await retry(
    () => isCoreReady(`${process.env.VITE_CORE_URL ?? 'http://localhost:3000'}/api/auth/key`),
    { timeoutMs: 30_000 },
  );

  console.info('Waiting for seed...');
  const key = await retry(() => getApiKey(CORE_DB), { timeoutMs: 15_000 });

  console.info('\nDevelopment environment ready.');
  console.info(`- Core:   \x1b[36mhttp://localhost:3000\x1b[0m`);

  const clientBaseUrl = 'http://localhost:8081';
  const clientUrl = key ? `${clientBaseUrl}?key=${key}` : clientBaseUrl;

  if (!key) {
    console.warn(
      `\x1b[33mWarning: API key could not be fetched. Using unauthenticated client link.\x1b[0m`,
    );
  }

  console.info(`- Client: \x1b[36m${clientUrl}\x1b[0m`);
  open(clientUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
