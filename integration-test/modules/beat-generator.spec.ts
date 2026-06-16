import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/beat-generator', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/beat-generator');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (array of BeatGeneratorResponse)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/beat-generator');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('POST /api/beat-generator/real-time', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/beat-generator/real-time')
      .send({ bpm: 120 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with session auth (integration-only)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/beat-generator/real-time')
      .send({ bpm: 120 });

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 204 with integration key', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['setRealTimeBeatDetector']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/beat-generator/real-time')
      .set('X-API-Key', key)
      .send({ bpm: 120 });

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});

describe('DELETE /api/beat-generator/real-time', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/beat-generator/real-time');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with session auth (integration-only)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/beat-generator/real-time');

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 204 with integration key', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['stopRealTimeBeatDetector']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .delete('/api/beat-generator/real-time')
      .set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});

describe('GET /api/beat-generator/artificial', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/beat-generator/artificial');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth (no active generator)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/beat-generator/artificial');

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('returns 204 with integration key scoped to getArtificialBeatGenerator', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['getArtificialBeatGenerator']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/beat-generator/artificial')
      .set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('returns 204 after delete when no generator is active', async () => {
    // ARRANGE
    await testApp.authorizedAgent.delete('/api/beat-generator/artificial');

    // ACT
    const res = await testApp.authorizedAgent.get('/api/beat-generator/artificial');

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});

describe('POST /api/beat-generator/artificial', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/beat-generator/artificial')
      .send({ bpm: 120 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth (body { bpm: 120 })', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/beat-generator/artificial')
      .send({ bpm: 120 });

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('GET /artificial returns { bpm: 120 } after POST', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/beat-generator/artificial');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ bpm: 120 });
  });

  it('returns 400 with missing bpm', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/beat-generator/artificial').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with bpm=0 (below minimum of 1)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/beat-generator/artificial')
      .send({ bpm: 0 });

    // ASSERT
    expectValidationError(res);
  });
});

describe('DELETE /api/beat-generator/artificial', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/beat-generator/artificial');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth (when active)', async () => {
    // ARRANGE
    await testApp.authorizedAgent.post('/api/beat-generator/artificial').send({ bpm: 120 });

    // ACT
    const res = await testApp.authorizedAgent.delete('/api/beat-generator/artificial');

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('returns 404 with admin when none active (DELETE again)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/beat-generator/artificial');

    // ASSERT
    expect(res.status).toBe(404);
  });
});
