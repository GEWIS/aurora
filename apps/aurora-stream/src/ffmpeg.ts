import { ChildProcess, spawn } from 'node:child_process';

import logger from './logger';

/** Lines of stderr kept in memory */
const STDERR_TAIL = 20;

/** How long SIGTERM gets before SIGKILL. */
const KILL_GRACE_MS = 5_000;

export interface FfmpegStatus {
  running: boolean;
  startedAt?: number;
  lastError?: string;
}

type ExitListener = (code: number | null, signal: NodeJS.Signals | null) => void;

export class Ffmpeg {
  private child?: ChildProcess;
  private expectingExit = false;
  private startedAt?: number;
  private stderrTail: string[] = [];
  private lastError?: string;

  /** Resolves when the current child has exited; undefined when nothing is running. */
  private exited?: Promise<void>;

  private unexpectedExitListener?: ExitListener;

  /** Serialises restart/stop so two callers can never have two children publishing at once. */
  private queue: Promise<unknown> = Promise.resolve();

  /**
   * (Re)start the ffmpeg child process with the provided arguments.
   * @param args
   */
  public async restart(args: string[]): Promise<void> {
    return this.serialise(async () => {
      await this.kill();
      this.spawn(args);
    });
  }

  /**
   * Kill the ffmpeg child process.
   */
  public async stop(): Promise<void> {
    return this.serialise(() => this.kill());
  }

  public status(): FfmpegStatus {
    return {
      running: this.child !== undefined,
      startedAt: this.startedAt,
      lastError: this.lastError,
    };
  }

  /**
   * Fires when the child process exitted when not called for.
   * @param cb
   */
  public onUnexpectedExit(cb: ExitListener): void {
    this.unexpectedExitListener = cb;
  }

  private spawn(args: string[]): void {
    this.stderrTail = [];
    this.lastError = undefined;
    this.startedAt = Date.now();

    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    this.child = child;

    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (chunk: string) => this.captureStderr(chunk));

    let settled = false;
    this.exited = new Promise<void>((resolve) => {
      const settle = (code: number | null, signal: NodeJS.Signals | null) => {
        if (settled) return;
        settled = true;
        resolve();
        this.handleExit(code, signal);
      };
      child.once('error', (err) => {
        this.stderrTail.push(err.message);
        settle(null, null);
      });
      child.once('exit', (code, signal) => settle(code, signal));
    });
  }

  private handleExit(code: number | null, signal: NodeJS.Signals | null): void {
    this.child = undefined;
    this.startedAt = undefined;

    const expected = this.expectingExit;
    this.expectingExit = false;
    if (expected) return;

    this.lastError = this.stderrTail.join('\n') || `ffmpeg exited (code ${code}, signal ${signal})`;
    logger.error({ code, signal, stderr: this.lastError }, 'ffmpeg exited unexpectedly');

    // Deliberately no auto-restart: against an expired CDN URL that is an endless crash loop.
    this.unexpectedExitListener?.(code, signal);
  }

  /**
   * SIGTERM, await exit, SIGKILL after a grace period. Safe when nothing is running.
   * Never call directly — go through serialise().
   */
  private async kill(): Promise<void> {
    const child = this.child;
    if (!child) return;

    this.expectingExit = true;
    child.kill('SIGTERM');

    const grace = setTimeout(() => child.kill('SIGKILL'), KILL_GRACE_MS);
    grace.unref();
    try {
      await this.exited;
    } finally {
      clearTimeout(grace);
    }
  }

  private captureStderr(chunk: string): void {
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      logger.debug({ line: trimmed }, 'ffmpeg');
      this.stderrTail.push(trimmed);
    }
    if (this.stderrTail.length > STDERR_TAIL) {
      this.stderrTail = this.stderrTail.slice(-STDERR_TAIL);
    }
  }

  private serialise<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }
}
