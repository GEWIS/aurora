import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import supertest, { type Agent as TestAgent } from 'supertest';
import ServerSettingsStore from '@aurora/modules/server-settings/server-settings-store';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

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
  await testApp.authorizedAgent.put('/api/borrel-mode').send({ enabled: false });
});

describe('GET /api/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/borrel-mode');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns borrel mode as present but inactive by default', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/borrel-mode');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ present: true, enabled: false });
  });

  it('returns 200 for a key holder', async () => {
    // ACT
    const res = await keyHolderAgent.get('/api/borrel-mode');

    // ASSERT
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.put('/api/borrel-mode').send({ enabled: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for a key holder', async () => {
    // ACT
    const res = await keyHolderAgent.put('/api/borrel-mode').send({ enabled: true });

    // ASSERT
    expectApiError(res, 403);
  });

  it('activates borrel mode, which the poster carousel follows', async () => {
    // ACT
    const res = await testApp.authorizedAgent.put('/api/borrel-mode').send({ enabled: true });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ present: true, enabled: true });

    const carousel = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel');
    expect(carousel.body.borrelMode).toBe(true);
  });
});

describe('BorrelModePresent disabled', () => {
  beforeAll(async () => {
    await testApp.authorizedAgent.put('/api/borrel-mode').send({ enabled: true });
    await ServerSettingsStore.getInstance().setSetting('BorrelModePresent', false);
  });

  afterAll(async () => {
    await ServerSettingsStore.getInstance().setSetting('BorrelModePresent', true);
  });

  it('GET /api/borrel-mode reports borrel mode as absent and inactive', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/borrel-mode');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ present: false, enabled: false });
  });

  it('PUT /api/borrel-mode returns 409', async () => {
    // ACT
    const res = await testApp.authorizedAgent.put('/api/borrel-mode').send({ enabled: true });

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toContain('BorrelModePresent');
  });
});
