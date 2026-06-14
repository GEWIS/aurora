import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/carousel', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/carousel');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (empty posters, borrel mode off)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ posters: [], borrelMode: false });
  });
});

describe('POST /api/handler/screen/poster/carousel/force-update', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/handler/screen/poster/carousel/force-update',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 when Trello API is not configured', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/screen/poster/carousel/force-update',
    );

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('GET /api/handler/screen/poster/carousel/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/borrel-mode',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (borrel mode inactive but feature present)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/borrel-mode',
    );

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ present: true, enabled: false });
  });
});

describe('PUT /api/handler/screen/poster/carousel/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/handler/screen/poster/carousel/borrel-mode')
      .send({ enabled: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth and valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/carousel/borrel-mode')
      .send({ enabled: true });

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('GET /api/handler/screen/poster/carousel/train-departures', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/train-departures',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 when NS API is not configured', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/train-departures',
    );

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('POST /api/handler/screen/poster/carousel/photo', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/carousel/photo')
      .send({ imageUrl: 'https://example.com/img.jpg' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when GEWIS API rejects unauthenticated request', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/carousel/photo')
      .send({ albumIds: [1] });

    // ASSERT
    expect(res.status).toBe(403);
  });
});

describe('GET /api/handler/screen/poster/carousel/olympics/medal-table', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/medal-table',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and medal table data', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/medal-table',
    );

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('GET /api/handler/screen/poster/carousel/olympics/country-medals', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/country-medals',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and Dutch medals data', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/country-medals',
    );

    // ASSERT
    expect(res.status).toBe(200);
  });
});
