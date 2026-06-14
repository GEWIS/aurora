import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/this-does-not-exist', () => {
  it('returns 404 for unknown route', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/this-does-not-exist');

    // ASSERT
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Not Found');
  });
});

describe('POST /api/this-does-not-exist', () => {
  it('returns 404 for unknown route', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/this-does-not-exist').send({});

    // ASSERT
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Not Found');
  });
});

describe('GET /api/user/me', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/user/me');

    // ASSERT
    expectApiError(res, 401);
  });
});

describe('POST /api/orders/webhook', () => {
  it('returns 400 with empty body (missing required X-Signature header)', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/orders/webhook').send({});

    // ASSERT
    expect(res.status).toBe(400);
  });

  it('returns 400 with valid body but missing X-Signature header', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/orders/webhook')
      .send({ orderNumber: 1, timeoutSeconds: 30 });

    // ASSERT
    expect(res.status).toBe(400);
  });
});
