import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import logger from './logger';

const API_TIMEOUT_MS = 2_000;
const DEFAULT_API_URL = 'http://127.0.0.1:9997/v3';

function resolveConfigPath(): string {
  if (process.env.MEDIAMTX_CONFIG) return process.env.MEDIAMTX_CONFIG;
  const candidates = [
    path.join(__dirname, '../mediamtx.yml'),
    path.join(__dirname, '../../mediamtx.yml'),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error(`mediamtx.yml not found; tried: ${candidates.join(', ')}`);
  return found;
}

export function spawnMediaMTX(): void {
  logger.info(
    {
      advertisedHost:
        process.env.MTX_WEBRTCADDITIONALHOSTS ?? '(webrtcAdditionalHosts in mediamtx.yml)',
    },
    'ICE candidates will advertise this host; it must be reachable from screens and publishers',
  );

  const child = spawn('mediamtx', [resolveConfigPath()], { stdio: 'inherit' });
  child.on('error', (err) => {
    console.error('failed to start mediamtx:', err);
    process.exit(1);
  });
  child.on('exit', (code) => {
    console.error(`mediamtx exited with code ${code}`);
    process.exit(code ?? 1);
  });
}

interface WebrtcSession {
  id: string;
  path: string;
  state: 'read' | 'publish';
}

interface SessionList {
  items: WebrtcSession[];
}

export class MediaMtx {
  public constructor(
    private readonly base: string = process.env.MEDIAMTX_API_URL ?? DEFAULT_API_URL,
  ) {}

  /**
   * Disconnect whoever is publishing to the given path.
   */
  public async kickPublisher(path: string): Promise<void> {
    const { items } = await this.get<SessionList>('/webrtcsessions/list');
    const publishers = items.filter((s) => s.path === path && s.state === 'publish');

    await Promise.all(
      publishers.map((session) =>
        this.post(`/webrtcsessions/kick/${session.id}`).catch((err: unknown) =>
          logger.warn({ path, id: session.id, err }, 'failed to kick publisher'),
        ),
      ),
    );
  }

  private async get<T>(endpoint: string): Promise<T> {
    const res = await this.fetch('GET', endpoint);
    return (await res.json()) as T;
  }

  private async post(endpoint: string): Promise<void> {
    await this.fetch('POST', endpoint);
  }

  private async fetch(method: 'GET' | 'POST', endpoint: string): Promise<Response> {
    const res = await globalThis.fetch(`${this.base}${endpoint}`, {
      method,
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`mediamtx ${method} ${endpoint} responded ${res.status}`);
    return res;
  }
}
