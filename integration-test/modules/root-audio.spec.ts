import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/audio', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/audio');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/audio');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('POST /api/audio', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/audio').send({ name: 'x' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and valid body', async () => {
    // ARRANGE
    const name = `Test Audio ${Date.now()}`;

    const createdAudioMatcher = expect.objectContaining({
      id: expect.any(Number),
      name,
      socketIds: null,
    });

    // ACT
    const res = await testApp.authorizedAgent.post('/api/audio').send({ name, defaultHandler: '' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdAudioMatcher);
  });

  it('returns 400 with missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/audio').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/audio').send();

    // ASSERT
    expectValidationError(res);
  });
});

describe('POST /api/audio/{id}/playing', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/audio/1/playing')
      .send({ playing: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when admin lacks audio.subscriber scope', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/audio/1/playing').send({ playing: true });

    // ASSERT
    expectApiError(res, 403);
  });
});
