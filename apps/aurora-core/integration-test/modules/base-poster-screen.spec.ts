import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/settings', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/settings');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when admin is not a poster subscriber', async () => {
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/settings');
    expect(res.status).toBe(403);
    expectApiError(res, 403);
  });
});

describe('GET /api/handler/screen/poster/settings/progress-bar-logo', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/settings/progress-bar-logo',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when admin is not a poster subscriber', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/settings/progress-bar-logo',
    );

    // ASSERT
    expect(res.status).toBe(403);
    expectApiError(res, 403);
  });
});

describe('GET /api/handler/screen/poster/settings/custom-stylesheet', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/settings/custom-stylesheet',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when admin is not a poster subscriber', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/settings/custom-stylesheet',
    );

    // ASSERT
    expect(res.status).toBe(403);
    expectApiError(res, 403);
  });
});
