import { beforeAll, describe, expect, it } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/spotify/login', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/login');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 302 with auth (redirects to Spotify auth URL)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/login');

    // ASSERT
    expect(res.status).toBe(302);
  });
});

describe('GET /api/spotify/callback', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/callback');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with auth (missing required state query param → tsoa validation)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/callback');

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('GET /api/spotify/user/current', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/user/current');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with auth (no active Spotify user → no content)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/user/current');

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('GET /api/spotify/users', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/users');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/users');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('DELETE /api/spotify/users/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/spotify/users/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with auth for a nonexistent user id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/spotify/users/999999');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/spotify/users/{id}/switch', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/spotify/users/1/switch');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with auth for a nonexistent user id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/spotify/users/999999/switch');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/spotify/profile', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/profile');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with auth (no active Spotify user → no content)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/profile');

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('GET /api/spotify/currently-playing', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/spotify/currently-playing');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with auth (musicEmitter not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/spotify/currently-playing');

    // ASSERT
    expect(res.status).toBe(500);
  });

  it('returns 403 with an integration key scoped to a different endpoint', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['someOtherEndpoint']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/spotify/currently-playing')
      .set('X-API-Key', key);

    // ASSERT
    expectApiError(res, 403);
  });

  it('passes auth with an integration key scoped to getSpotifyCurrentlyPlaying (500: musicEmitter not initialized)', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['getSpotifyCurrentlyPlaying']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/spotify/currently-playing')
      .set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('POST /api/spotify/skip', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/spotify/skip');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with auth (skip acknowledged, no content)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/spotify/skip');

    // ASSERT
    expect(res.status).toBe(204);
  });
});
