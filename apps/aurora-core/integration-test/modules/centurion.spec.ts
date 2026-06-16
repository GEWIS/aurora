import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/modes/centurion', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/modes/centurion');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth (centurion mode not enabled)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/modes/centurion');

    // ASSERT
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});

describe('GET /api/modes/centurion/state', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/modes/centurion/state');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and playing=false when not active', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/modes/centurion/state');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ playing: false });
  });
});

describe('POST /api/modes/centurion/start', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/centurion/start');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when centurion mode is not enabled', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion/start');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/centurion/skip', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/modes/centurion/skip')
      .send({ seconds: 30 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with missing body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion/skip').send({});

    // ASSERT
    expect(res.status).toBe(400);
  });

  it('returns 404 when centurion mode is not enabled', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/modes/centurion/skip')
      .send({ seconds: 30 });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/modes/centurion/stop', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/centurion/stop');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when centurion mode is not enabled', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion/stop');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/modes/centurion/tapes', () => {
  it('returns tapes with the expected structure (name, artist, coverUrl, events, horns, duration)', async () => {
    // ARRANGE
    const tapeMatcher = expect.objectContaining({
      name: expect.any(String),
      artist: expect.any(String),
      coverUrl: expect.any(String),
      events: expect.any(Array),
      horns: expect.any(Number),
      duration: expect.any(Number),
    });

    // ACT
    const res = await testApp.authorizedAgent.get('/api/modes/centurion/tapes');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body).not.toHaveLength(0);
    expect(res.body).toEqual(expect.arrayContaining([tapeMatcher]));
  });

  it('contains at least one well-known tape', async () => {
    // ARRANGE
    const wellKnownArtistMatcher = expect.objectContaining({
      artist: 'Gebroeders Scooter',
    });

    // ACT
    const res = await testApp.authorizedAgent.get('/api/modes/centurion/tapes');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([wellKnownArtistMatcher]));
  });
});
