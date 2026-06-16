import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/orders', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/orders');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with admin auth (OrderManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/orders');

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('POST /api/orders', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/orders').send({ orderNumber: 1 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with admin auth (OrderManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/orders').send({ orderNumber: 1 });

    // ASSERT
    expect(res.status).toBe(500);
  });

  it('returns 500 with valid body including timeoutSeconds (OrderManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/orders')
      .send({ orderNumber: 1, timeoutSeconds: 60 });

    // ASSERT
    expect(res.status).toBe(500);
  });

  it('returns 400 with missing orderNumber', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/orders').send({ timeoutSeconds: 60 });

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/orders').send({});

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('POST /api/orders/webhook', () => {
  it('returns 500 without auth (public endpoint crashes on missing OrderManager)', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/orders/webhook')
      .set('X-Signature', 'AAAA')
      .send({ orderNumber: 1 });

    // ASSERT
    expect(res.status).toBe(500);
  });

  it('returns 400 with missing X-Signature header', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/orders/webhook').send({ orderNumber: 1 });

    // ASSERT
    expect(res.status).toBe(400);
  });

  it('returns 500 with invalid signature (OrderManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/orders/webhook')
      .set('X-Signature', 'invalidsignature')
      .send({ orderNumber: 1 });

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/orders/{orderNumber}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/orders/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with admin auth (OrderManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/orders/1');

    // ASSERT
    expect(res.status).toBe(500);
  });

  it('returns 400 with non-numeric orderNumber (tsoa invalid float)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/orders/abc');

    // ASSERT
    expect(res.status).toBe(400);
  });
});
