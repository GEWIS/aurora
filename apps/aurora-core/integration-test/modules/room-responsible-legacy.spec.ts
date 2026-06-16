import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/room-responsible-legacy-url', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/room-responsible-legacy-url',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 409 with admin auth (feature disabled, default URL is empty)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/room-responsible-legacy-url',
    );

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toContain('RoomResponsibleLegacyScreenURL');
  });
});
