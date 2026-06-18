import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/user/me', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/user/me');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/me');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'john-doe',
      name: 'John Doe',
      roles: ['admin'],
    });
  });
});
