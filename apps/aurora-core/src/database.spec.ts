import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('database module-load side effects', () => {
  beforeEach(() => {
    vi.resetModules();

    process.env.TYPEORM_CONNECTION = 'not_a_real_driver';
  });

  it('imports without a TypeORM environment', async () => {
    await expect(import('./database')).resolves.toBeDefined();
  });

  it('lets a module deep in the graph be imported without a TypeORM environment', async () => {
    await expect(import('./modules/root/handler-manager')).resolves.toBeDefined();
  });

  it('defers construction until getDataSource is called', async () => {
    const { getDataSource } = await import('./database');

    expect(() => getDataSource()).toThrowError(/driver/i);
  });

  it('returns the same instance on repeated calls', async () => {
    process.env.TYPEORM_CONNECTION = 'sqlite';
    process.env.TYPEORM_DATABASE = ':memory:';
    const { getDataSource } = await import('./database');

    expect(getDataSource()).toBe(getDataSource());
  });
});
