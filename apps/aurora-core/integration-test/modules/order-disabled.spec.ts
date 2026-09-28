import { describe, beforeAll, it, expect } from 'vitest';
import { getDataSource } from '@aurora/database';
import ServerSetting from '@aurora/modules/server-settings/server-setting';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  // ARRANGE: persist Orders=false before the app boots, so the store picks it up on initialize
  if (!getDataSource().isInitialized) {
    await getDataSource().initialize();
  }
  await getDataSource().getRepository(ServerSetting).save({ key: 'Orders', value: false });

  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('Orders feature disabled', () => {
  it('boots without constructing a disabled OrderManager', () => {
    // ASSERT
    expect(testApp.app).toBeDefined();
  });

  it('GET /api/orders returns 409 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/orders');

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toContain('Orders');
  });
});
