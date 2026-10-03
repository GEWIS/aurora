import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import supertest, { type Agent as TestAgent } from 'supertest';
import ServerSettingsStore from '@aurora/modules/server-settings/server-settings-store';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;
let keyHolderAgent: TestAgent;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();

  keyHolderAgent = supertest.agent(testApp.app);
  await keyHolderAgent
    .post('/api/auth/mock')
    .send({ id: 'key-holder', name: 'Key Holder', roles: ['key-holder'] });
});

afterAll(async () => {
  // Reset to defaults so other test files are not affected
  await testApp.authorizedAgent.put('/api/screen-filter').send({ brightness: 100, warmth: 0 });
});

describe('GET /api/screen-filter', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/screen-filter');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns the default filter', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen-filter');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ brightness: 100, warmth: 0 });
  });

  it('returns 200 for a key holder', async () => {
    // ACT
    const res = await keyHolderAgent.get('/api/screen-filter');

    // ASSERT
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/screen-filter', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 50, warmth: 50 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for a key holder', async () => {
    // ACT
    const res = await keyHolderAgent.put('/api/screen-filter').send({ brightness: 50, warmth: 50 });

    // ASSERT
    expectApiError(res, 403);
  });

  it('stores the new filter', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 60, warmth: 40 });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ brightness: 60, warmth: 40 });
    const store = ServerSettingsStore.getInstance();
    expect(store.getSetting('ScreenFilter.Brightness')).toBe(60);
    expect(store.getSetting('ScreenFilter.Warmth')).toBe(40);

    const getRes = await testApp.authorizedAgent.get('/api/screen-filter');
    expect(getRes.body).toEqual({ brightness: 60, warmth: 40 });
  });

  it('never dims the screens completely', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 0, warmth: 0 });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ brightness: 10, warmth: 0 });
  });

  it('accepts a transition duration', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 70, warmth: 30, transitionSeconds: 900 });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ brightness: 70, warmth: 30 });
  });

  it('returns 400 for a transition longer than an hour', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 70, warmth: 30, transitionSeconds: 3601 });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 for out of range values', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 150, warmth: -1 });

    // ASSERT
    expectValidationError(res);
  });
});

describe('POST /api/settings for the screen filter', () => {
  it('never dims the screens completely', async () => {
    // ACT
    const setRes = await testApp.authorizedAgent
      .post('/api/settings')
      .send({ key: 'ScreenFilter.Brightness', value: 0 });
    const getRes = await testApp.authorizedAgent.get('/api/screen-filter');

    // ASSERT
    expect(setRes.status).toBe(200);
    expect(getRes.status).toBe(200);
    expect(getRes.body.brightness).toBe(10);
  });
});

describe('ScreenFilter feature disabled', () => {
  beforeAll(async () => {
    await ServerSettingsStore.getInstance().setSetting('ScreenFilter', false);
  });

  afterAll(async () => {
    await ServerSettingsStore.getInstance().setSetting('ScreenFilter', true);
  });

  it('GET /api/screen-filter returns 409', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen-filter');

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toContain('ScreenFilter');
  });

  it('PUT /api/screen-filter returns 409', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/screen-filter')
      .send({ brightness: 50, warmth: 50 });

    // ASSERT
    expect(res.status).toBe(409);
  });
});
