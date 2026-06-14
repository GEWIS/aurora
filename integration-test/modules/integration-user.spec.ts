import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import type {
  IntegrationUserResponse,
  IntegrationUserCreateRequest,
} from '../../src/modules/auth/integration/integration-user-service';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

async function createIntegrationUser(
  body: IntegrationUserCreateRequest,
): Promise<IntegrationUserResponse> {
  const res = await testApp.authorizedAgent.post('/api/user/integration').send(body);
  return res.body as IntegrationUserResponse;
}

describe('GET /api/user/integration/endpoints', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/user/integration/endpoints');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a list of integration-scope endpoint names', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration/endpoints');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect.arrayContaining([expect.any(String)]);
  });

  it('includes known integration endpoints registered at module load', async () => {
    // ARRANGE
    const expectedSubset = [
      'addOrder',
      'removeOrder',
      'setRealTimeBeatDetector',
      'stopRealTimeBeatDetector',
      'getArtificialBeatGenerator',
      'startArtificialBeatGenerator',
      'stopArtificialBeatGenerator',
      'getAllLightsColors',
    ];

    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration/endpoints');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining(expectedSubset));
  });
});

describe('GET /api/user/integration', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/user/integration');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a list of integration users (empty when no users exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns the integration user we just created', async () => {
    // ARRANGE
    const created = await createIntegrationUser({
      name: 'spec-list-test',
      endpoints: ['addOrder'],
    });

    const expectedUserMatcher = expect.objectContaining({
      id: created.id,
      name: 'spec-list-test',
      endpoints: ['addOrder'],
    });

    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([expectedUserMatcher]));
  });

  describe('GET /api/user/integration/{id}', () => {
    it('returns 401 without auth', async () => {
      // ACT
      const res = await testApp.unauthorizedAgent.get('/api/user/integration/1');

      // ASSERT
      expectApiError(res, 401);
    });

    it('returns 200 with admin auth and the matching integration user', async () => {
      // ARRANGE
      const created = await createIntegrationUser({
        name: 'spec-get-by-id-test',
        endpoints: ['getAllLightsColors'],
      });

      const expectedUserMatcher = expect.objectContaining({
        id: created.id,
        name: 'spec-get-by-id-test',
        endpoints: ['getAllLightsColors'],
        lastSeen: null,
      });

      // ACT
      const res = await testApp.authorizedAgent.get(`/api/user/integration/${created.id}`);

      // ASSERT
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedUserMatcher);
    });

    it('returns 404 with a nonexistent id', async () => {
      // ACT
      const res = await testApp.authorizedAgent.get('/api/user/integration/99999');

      // ASSERT
      expectApiError(res, 404);
    });

    it('returns 400 with a non-numeric id', async () => {
      // ACT
      const res = await testApp.authorizedAgent.get('/api/user/integration/not-a-number');

      // ASSERT
      expectValidationError(res, 400);
    });
  });
});

describe('GET /api/user/integration/{id}/key', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/user/integration/1/key');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and the API key', async () => {
    // ARRANGE
    const created = await createIntegrationUser({
      name: 'spec-get-key-test',
      endpoints: ['addOrder'],
    });

    // ACT
    const res = await testApp.authorizedAgent.get(`/api/user/integration/${created.id}/key`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it('returns 404 with a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration/99999/key');

    // ASSERT
    expectApiError(res, 404);
  });
});

describe('POST /api/user/integration', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/user/integration')
      .send({ name: 'no-auth', endpoints: [] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and creates the integration user', async () => {
    // ARRANGE
    const name = `spec-create-${Date.now()}`;

    const expectedUserMatcher = expect.objectContaining({
      id: expect.any(Number),
      name,
      endpoints: ['addOrder', 'removeOrder'],
      lastSeen: null,
    });

    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/user/integration')
      .send({ name, endpoints: ['addOrder', 'removeOrder'] });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedUserMatcher);
  });

  it('returns 400 with missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/user/integration')
      .send({ endpoints: ['addOrder'] });

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with missing endpoints', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/user/integration')
      .send({ name: 'no-endpoints' });

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with an empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/user/integration').send({});

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid endpoint names', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/user/integration')
      .send({ name: 'bad-endpoints', endpoints: ['thisEndpointDoesNotExist'] });

    // ASSERT
    expectApiError(res, 400);
  });
});

describe('PATCH /api/user/integration/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .patch('/api/user/integration/1')
      .send({ name: 'no-auth-patch' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and updates the integration user', async () => {
    // ARRANGE
    const created = await createIntegrationUser({
      name: 'spec-patch-target',
      endpoints: ['addOrder'],
    });

    const expectedUserMatcher = expect.objectContaining({
      id: created.id,
      name: 'spec-patch-renamed',
      endpoints: ['addOrder', 'removeOrder'],
    });

    // ACT
    const res = await testApp.authorizedAgent
      .patch(`/api/user/integration/${created.id}`)
      .send({ name: 'spec-patch-renamed', endpoints: ['addOrder', 'removeOrder'] });
    const after = await testApp.authorizedAgent.get(`/api/user/integration/${created.id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedUserMatcher);

    expect(after.status).toBe(200);
    expect(after.body).toEqual(expectedUserMatcher);
  });

  it('returns 404 with a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .patch('/api/user/integration/99999')
      .send({ name: 'no-such-user' });

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 with a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .patch('/api/user/integration/not-a-number')
      .send({ name: 'bad-id' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('DELETE /api/user/integration/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/user/integration/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth and deletes the integration user', async () => {
    // ARRANGE
    const created = await createIntegrationUser({
      name: 'spec-delete-target',
      endpoints: ['addOrder'],
    });

    // ACT
    const res = await testApp.authorizedAgent.delete(`/api/user/integration/${created.id}`);
    const after = await testApp.authorizedAgent.get(`/api/user/integration/${created.id}`);

    expect(res.status).toBe(204);
    expect(after.status).toBe(404);
  });

  it('returns 404 with a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/user/integration/99999');

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 with a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/user/integration/not-a-number');

    // ASSERT
    expectValidationError(res, 400);
  });
});
