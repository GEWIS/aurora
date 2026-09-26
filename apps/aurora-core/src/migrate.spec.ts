import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { DataSource } from 'typeorm';
import { runPendingMigrations } from './migrate';

function stubDataSource(options: object, pending = true) {
  return {
    options: { type: 'mysql', synchronize: false, ...options },
    showMigrations: vi.fn().mockResolvedValue(pending),
    runMigrations: vi.fn().mockResolvedValue([{ name: 'TestMigration1' }]),
  };
}

describe('runPendingMigrations', () => {
  beforeEach(() => {
    delete process.env.TYPEORM_MIGRATIONS_RUN;
  });

  afterEach(() => {
    delete process.env.TYPEORM_MIGRATIONS_RUN;
  });

  it.each([
    ['synchronize is enabled', { synchronize: true }, undefined],
    ['the database is sqlite', { type: 'sqlite' }, undefined],
    ['TYPEORM_MIGRATIONS_RUN is false', {}, 'false'],
  ])('skips when %s', async (_, options, env) => {
    if (env) process.env.TYPEORM_MIGRATIONS_RUN = env;
    const dataSource = stubDataSource(options);

    await runPendingMigrations(dataSource as unknown as DataSource);

    expect(dataSource.showMigrations).not.toHaveBeenCalled();
    expect(dataSource.runMigrations).not.toHaveBeenCalled();
  });

  it('does not run migrations when none are pending', async () => {
    const dataSource = stubDataSource({}, false);

    await runPendingMigrations(dataSource as unknown as DataSource);

    expect(dataSource.showMigrations).toHaveBeenCalledOnce();
    expect(dataSource.runMigrations).not.toHaveBeenCalled();
  });

  it('runs each pending migration in its own transaction', async () => {
    const dataSource = stubDataSource({});

    await runPendingMigrations(dataSource as unknown as DataSource);

    expect(dataSource.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });
  });

  it('rethrows when a migration fails', async () => {
    const dataSource = stubDataSource({});
    dataSource.runMigrations.mockRejectedValue(new Error('boom'));

    await expect(runPendingMigrations(dataSource as unknown as DataSource)).rejects.toThrow('boom');
  });
});
