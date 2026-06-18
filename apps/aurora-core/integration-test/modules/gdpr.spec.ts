import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/gdpr/personal-data/{userId}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/gdpr/personal-data/some-user');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and the personal data object', async () => {
    // ARRANGE
    const userId = 'john-doe';
    // ACT
    const res = await testApp.authorizedAgent.get(`/api/gdpr/personal-data/${userId}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      userId,
      auditLogs: expect.any(Array),
    });
  });

  it('returns 200 with a nonexistent userId and an empty audit log list', async () => {
    // ARRANGE
    const userId = 'this-user-does-not-exist';

    // ACT
    const res = await testApp.authorizedAgent.get(`/api/gdpr/personal-data/${userId}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      userId,
      auditLogs: [],
    });
  });
});
