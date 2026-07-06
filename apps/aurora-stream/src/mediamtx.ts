import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

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
