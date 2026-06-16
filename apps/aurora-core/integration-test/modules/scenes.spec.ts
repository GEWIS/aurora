import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/lights/scenes', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/scenes');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns empty array with admin auth (no seeded scenes)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights/scenes');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/handler/lights/scenes/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/scenes/999999');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights/scenes/999999');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/handler/lights/scenes', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/scenes')
      .send({ name: 'Test Scene', favorite: false, effects: [] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with admin auth (route shadowed by HandlerController POST /api/handler/lights/:id)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/scenes')
      .send({ name: 'Test Scene', favorite: false, effects: [] });

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/handler/lights/scenes/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/lights/scenes/999999');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/lights/scenes/999999');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/handler/lights/scenes/{id}/apply', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/handler/lights/scenes/1/apply');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/lights/scenes/1/apply');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/handler/lights/scenes/clear', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/lights/scenes/clear');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with admin auth (route shadowed by :id param)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/lights/scenes/clear');

    // ASSERT
    expect(res.status).toBe(400);
  });
});
