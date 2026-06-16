import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/modes/time-trail-race', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/modes/time-trail-race');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth (ModeManager not initialized, null body)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/modes/time-trail-race');

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('POST /api/modes/time-trail-race/register-player', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/modes/time-trail-race/register-player')
      .send({ name: 'Test', alcoholFree: true, bac: false });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/modes/time-trail-race/register-player')
      .send({ name: 'Test', alcoholFree: true, bac: false });

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/modes/time-trail-race/register-player')
      .send({});

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('POST /api/modes/time-trail-race/ready', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/time-trail-race/ready');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/time-trail-race/ready');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/time-trail-race/start', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/time-trail-race/start');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/time-trail-race/start');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/time-trail-race/finish', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/time-trail-race/finish');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/time-trail-race/finish');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/time-trail-race/reveal-score', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/time-trail-race/reveal-score');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/time-trail-race/reveal-score');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/time-trail-race/reset-player', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/modes/time-trail-race/reset-player')
      .send({});

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (mode not active)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/modes/time-trail-race/reset-player')
      .send({});

    // ASSERT
    expect(res.status).toBe(404);
  });
});
