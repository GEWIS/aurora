import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/static', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/static');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (clock visible, no active poster)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/static');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.clockVisible).toBe(true);
    expect(res.body.activePoster).toBeFalsy();
  });
});

describe('DELETE /api/handler/screen/poster/static', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/screen/poster/static');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/static');

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('POST /api/handler/screen/poster/static/clock', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({ visible: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth and valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({ visible: true });

    // ASSERT
    expect(res.status).toBe(204);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({});

    // ASSERT
    expect(res.status).toBe(400);
  });
});
