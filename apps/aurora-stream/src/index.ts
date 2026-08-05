import './env';

import { createHTTPApp, createMediaMTXApp } from './http';
import logger from './logger';
import { spawnMediaMTX } from './mediamtx';
import { createStreamManager } from './stream-manager';

const CONTROL_PORT = Number(process.env.CONTROL_PORT ?? 9000);
const AUTH_PORT = Number(process.env.AUTH_PORT ?? 9001);

export function main(): void {
  const manager = createStreamManager();

  createMediaMTXApp(manager).listen(AUTH_PORT, '127.0.0.1', () =>
    logger.info(`auth hook listening on http://127.0.0.1:${AUTH_PORT}`),
  );

  createHTTPApp(manager).listen(CONTROL_PORT, '0.0.0.0', () =>
    logger.info(`control plane listening on http://0.0.0.0:${CONTROL_PORT}`),
  );

  spawnMediaMTX();
}

main();
