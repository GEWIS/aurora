import { describe, beforeAll, it, expect, vi } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';
import { SecurityGroup } from '../../src/helpers/security';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/auth/oidc', () => {
  it('returns 500 when OIDC_CONFIG points to an unreachable URL', async () => {
    // ARRANGE
    vi.stubEnv('OIDC_PROVIDER', 'KEYCLOAK');
    vi.stubEnv('OIDC_CONFIG', 'http://127.0.0.1:1/nonexistent');
    vi.stubEnv('OIDC_CLIENT_ID', '');
    vi.stubEnv('OIDC_REDIRECT_URI', '');

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('fetch failed: TypeError: fetch failed'));

    // ACT
    const res = await testApp.authorizedAgent.get('/api/auth/oidc');

    // ASSERT
    expect(res.status).toBe(500);
    expectApiError(res, 500);

    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('returns 200 with OIDC config when env vars are set', async () => {
    // ARRANGE
    vi.stubEnv('OIDC_CONFIG', 'https://mock-issuer.com');
    vi.stubEnv('OIDC_CLIENT_ID', 'test-client');
    vi.stubEnv('OIDC_REDIRECT_URI', 'http://localhost:3000/callback');

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        authorization_endpoint: 'https://auth.example.com/auth',
        token_endpoint: 'https://auth.example.com/token',
      }),
    } as Response);

    // ACT
    const res = await testApp.authorizedAgent.get('/api/auth/oidc');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      clientId: 'test-client',
      redirectUri: 'http://localhost:3000/callback',
      authUrl: 'https://auth.example.com/auth',
    });

    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});

describe('GET /api/auth/groups', () => {
  it('returns 200 with the typed security groups', async () => {
    // ARRANGE
    const expectedTopLevelKeys = [
      'user',
      'color',
      'audit',
      'beats',
      'gdrp',
      'scenes',
      'effects',
      'poster',
      'roomresponsible',
      'centurion',
      'timetrail',
      'mode',
      'handler',
      'audio',
      'light',
      'screen',
      'lightOperation',
      'spotify',
      'sudosos',
      'serverSettings',
      'orders',
      'timedEvents',
      'integrationUsers',
    ];

    const expectedGroupSchema = expectedTopLevelKeys.reduce<Record<string, unknown>>(
      (schema, key) => {
        schema[key] = expect.objectContaining({});
        return schema;
      },
      {},
    );

    // ACT
    const res = await testApp.authorizedAgent.get('/api/auth/groups');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toEqual(expect.objectContaining(expectedGroupSchema));
  });

  it('returns admin in the user section', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/auth/groups');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.user.base).toContain(SecurityGroup.ADMIN);
  });

  it('returns admin as the integrationUsers privileged', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/auth/groups');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.integrationUsers.privileged).toEqual([SecurityGroup.ADMIN]);
  });
});

describe('POST /api/auth/mock', () => {
  it('returns 200 with the mock auth user', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/auth/mock')
      .send({ id: 'test', name: 'Test', roles: ['admin'] });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'test',
      name: 'Test',
      roles: ['admin'],
    });
  });
});

describe('POST /api/auth/key', () => {
  it('returns 404 with a nonexistent key (not 401)', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/auth/key')
      .send({ key: 'bad-key-that-does-not-exist' });

    // ASSERT
    expect(res.status).toBe(404);
    expectApiError(res, 404);
  });
});

describe('POST /api/auth/oidc', () => {
  it('returns 500 with no body (missing OIDC params trigger internal error)', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/auth/oidc').send({});

    // ASSERT
    expect(res.status).toBe(500);
    expectApiError(res, 500);
  });

  it('returns 200 with proper OIDC env and valid token exchange', async () => {
    // ARRANGE
    vi.stubEnv('OIDC_PROVIDER', 'KEYCLOAK');
    vi.stubEnv('OIDC_CONFIG', 'https://mock-issuer.com/.well-known/openid-configuration');
    vi.stubEnv('OIDC_CLIENT_ID', 'test-client');
    vi.stubEnv('OIDC_CLIENT_SECRET', 'test-secret');
    vi.stubEnv('OIDC_REDIRECT_URI', 'http://localhost:3000/callback');

    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        preferred_username: 'test',
        given_name: 'Test',
        resource_access: { 'test-client': { roles: ['admin'] } },
      }),
    ).toString('base64url');
    const mockIdToken = `${header}.${payload}.`;

    const fetchSpy = vi.spyOn(global, 'fetch');

    // first call: executed by new getting oidc config
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token_endpoint: 'https://mock-issuer.com/token-exchange-endpoint',
      }),
    } as Response);

    // second call: executed by the following passport fetch operation
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id_token: mockIdToken,
      }),
    } as Response);

    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/auth/oidc').send({
      state: 'test-state',
      session_state: 'test-session',
      code: 'test-code',
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'test',
      name: 'Test',
      roles: ['admin'],
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
