import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/sudosos/wall-of-shame', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/sudosos/wall-of-shame',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with admin auth (admin lacks sudosos subscriber role)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/sudosos/wall-of-shame',
    );

    // ASSERT
    expect(res.status).toBe(403);
  });
});

describe('GET /api/handler/screen/poster/sudosos/price-list', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/sudosos/price-list',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with admin auth (admin lacks sudosos subscriber role)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/sudosos/price-list');

    // ASSERT
    expect(res.status).toBe(403);
  });
});
