import { describe, beforeAll, it, expect } from 'vitest';
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
