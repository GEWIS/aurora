import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

/**
 * Sets the room status through the API. The room status is a singleton row, so
 * every test that cares about the beer time sets it explicitly rather than
 * relying on whatever an earlier test left behind.
 */
async function setBeerTime(beerTime: string | null): Promise<void> {
  const res = await testApp.authorizedAgent
    .put('/api/handler/screen/info/room-status')
    .send({ open: true, beerTime });
  expect(res.status).toBe(200);
}

describe('GET /api/handler/screen/info/beer-time', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/info/beer-time');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with an integration key scoped to a different endpoint', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['someOtherEndpoint']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/handler/screen/info/beer-time')
      .set('X-API-Key', key);

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 403 for an admin session, as the endpoint is integration-only', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/info/beer-time');

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 200 and a null beer time when none is set', async () => {
    // ARRANGE
    await setBeerTime(null);
    const key = await createIntegrationKey(['getInfoBeerTime']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/handler/screen/info/beer-time')
      .set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ beerTime: null });
  });

  it('returns the beer time set through the room status, and nothing else', async () => {
    // ARRANGE
    await setBeerTime('16:30');
    const key = await createIntegrationKey(['getInfoBeerTime']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .get('/api/handler/screen/info/beer-time')
      .set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(200);
    // Exact match: the point of the dedicated endpoint is that an integration
    // cannot read the responsibles, closed message or coffee status.
    expect(res.body).toEqual({ beerTime: '16:30' });
  });
});
