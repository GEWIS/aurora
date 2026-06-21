import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

function sh(cmd: string): void {
  execSync(cmd, { stdio: 'inherit', shell: '/bin/sh' });
}

function installDependencies(): void {
  sh('corepack enable');
  if (!existsSync('node_modules/.pnpm/lock.yaml')) {
    sh('pnpm install --frozen-lockfile');
  }
}

function runCommand(): void {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd) return;
  spawn(cmd, args, { stdio: 'inherit', shell: '/bin/sh' }).on('exit', (code: number | null) => {
    process.exit(code ?? 0);
  });
}

try {
  installDependencies();
  runCommand();
} catch (err: unknown) {
  console.error('Entrypoint failed:', err);
  process.exit(1);
}
