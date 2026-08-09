import './env';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { createHTTPApp, createMediaMTXApp } from './http';
import logger from './logger';
import { spawnMediaMTX } from './mediamtx';
import { createStreamManager } from './stream-manager';

const exec = promisify(execFile);

const CONTROL_PORT = Number(process.env.CONTROL_PORT ?? 9000);
const AUTH_PORT = Number(process.env.AUTH_PORT ?? 9001);

/**
 * YouTube changes often enough that a yt-dlp from a cached image layer is the most
 * likely cause of a probe succeeding but playback 403-ing. Pulling the current
 * version on boot keeps that from depending on when the image was last built.
 */
async function updateYtDlp(): Promise<void> {
  await exec('pip', ['install', '--break-system-packages', '--no-cache-dir', '-U', 'yt-dlp'], {
    timeout: 120_000,
  });

  const { stdout } = await exec('yt-dlp', ['--version']);
  logger.info(`yt-dlp up to date (${stdout.trim()})`);
}

export function main(): void {
  const manager = createStreamManager();

  createMediaMTXApp(manager).listen(AUTH_PORT, '127.0.0.1', () =>
    logger.info(`auth hook listening on http://127.0.0.1:${AUTH_PORT}`),
  );

  createHTTPApp(manager).listen(CONTROL_PORT, '0.0.0.0', () =>
    logger.info(`control plane listening on http://0.0.0.0:${CONTROL_PORT}`),
  );

  spawnMediaMTX();

  if (process.env.YTDLP_AUTO_UPDATE !== 'false') {
    updateYtDlp().catch((err: Error) =>
      logger.warn({ err: err.message }, 'could not update yt-dlp, using the bundled version'),
    );
  }
}

main();
