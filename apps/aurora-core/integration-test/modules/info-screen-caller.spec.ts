import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import ServerSettingsStore from '@aurora/modules/server-settings/server-settings-store';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

/**
 * The caller ID is off by default, so everything that exercises the endpoints
 * turns it on first and hands it back afterwards.
 */
describe('Caller ID enabled', () => {
  beforeAll(async () => {
    await ServerSettingsStore.getInstance().setSetting('InfoScreen.CallerId', true);
  });

  afterAll(async () => {
    await ServerSettingsStore.getInstance().setSetting('InfoScreen.CallerId', false);
  });

  it('POST caller-ring returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/info/caller-ring')
      .send({ number: '+31612345678' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('POST caller-ring returns 403 with a key scoped to a different endpoint', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['someOtherEndpoint']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/info/caller-ring')
      .set('X-API-Key', key)
      .send({ number: '+31612345678' });

    // ASSERT
    expectApiError(res, 403);
  });

  it('POST caller-ring accepts a scoped integration key', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['setInfoCallerRing']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/info/caller-ring')
      .set('X-API-Key', key)
      .send({ number: '+31612345678', name: 'Jane Doe' });

    // ASSERT
    expect(res.status).toBe(204);
  });

  it('POST caller-end accepts its own scope but not the ring scope', async () => {
    // ARRANGE
    const endKey = await createIntegrationKey(['setInfoCallerEnd']);
    const ringKey = await createIntegrationKey(['setInfoCallerRing']);

    // ACT
    const allowed = await testApp.unauthorizedAgent
      .post('/api/handler/screen/info/caller-end')
      .set('X-API-Key', endKey);
    const denied = await testApp.unauthorizedAgent
      .post('/api/handler/screen/info/caller-end')
      .set('X-API-Key', ringKey);

    // ASSERT
    expect(allowed.status).toBe(204);
    expectApiError(denied, 403);
  });

  it('offers the caller overlay in the widget catalog', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/info/widget-catalog');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.map((w: { id: string }) => w.id)).toContain('caller');
  });
});

describe('Caller ID disabled', () => {
  it('hides the caller overlay from the widget catalog', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/info/widget-catalog');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.map((w: { id: string }) => w.id)).not.toContain('caller');
  });

  it('still lets the directory be managed, so callers can be prepared in advance', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/info/callers');

    // ASSERT
    expect(res.status).toBe(200);
  });
});
