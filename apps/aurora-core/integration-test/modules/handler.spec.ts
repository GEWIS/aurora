import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/audio', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/audio');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/audio');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/handler/audio/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/audio/1')
      .send({ name: 'default' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when audio entity does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/audio/1')
      .send({ name: 'default' });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/handler/lights', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/handler/lights/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/1')
      .send({ name: 'default' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when lights group does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/1')
      .send({ name: 'default' });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/handler/screen', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/handler/screen/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/1')
      .send({ name: 'default' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when screen entity does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/1')
      .send({ name: 'default' });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/handler/all/reset-to-defaults', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/handler/all/reset-to-defaults');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/all/reset-to-defaults');

    // ASSERT
    expect(res.status).toBe(204);
  });
});
