import { describe, beforeAll, it, expect, vi } from 'vitest';
import { getDataSource } from '@aurora/database';
import AuditService from '@aurora/modules/audit/audit-service';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/audit-logs', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/audit-logs');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and default pagination', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/audit-logs');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      records: [],
      pagination: {
        take: 50,
        skip: 0,
        count: 0,
      },
    });
  });

  it('returns 200 with ?take=10 query', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/audit-logs').query({ take: 10 });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      records: [],
      pagination: {
        take: 10,
        skip: 0,
        count: 0,
      },
    });
  });

  it('returns 200 with ?take=10&skip=0 query', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/audit-logs').query({ take: 10, skip: 0 });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      records: [],
      pagination: {
        take: 10,
        skip: 0,
        count: 0,
      },
    });
  });
});

describe('AuditService.addLog', () => {
  it('does not start a transaction', async () => {
    // ARRANGE
    // SQLite shares a single query runner, so audit logs (which are not awaited) must not
    // start and commit a transaction, or they can end a transaction of the running request
    const queryRunner = getDataSource().createQueryRunner();
    const startTransaction = vi.spyOn(queryRunner, 'startTransaction');

    // ACT
    let startTransactionCalls: number;
    try {
      await new AuditService().addLog({ userId: 'audit-test', userName: 'Audit', action: 'Test' });
    } finally {
      startTransactionCalls = startTransaction.mock.calls.length;
      startTransaction.mockRestore();
    }

    // ASSERT
    expect(startTransactionCalls).toBe(0);
    const res = await testApp.authorizedAgent
      .get('/api/audit-logs')
      .query({ userId: 'audit-test' });
    expect(res.status).toBe(200);
    expect(res.body.records).toEqual([
      expect.objectContaining({ userId: 'audit-test', userName: 'Audit', action: 'Test' }),
    ]);
  });
});
