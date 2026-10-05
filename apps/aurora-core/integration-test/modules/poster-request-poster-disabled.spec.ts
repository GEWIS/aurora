import { describe, beforeAll, it, expect } from 'vitest';
import { getDataSource } from '@aurora/database';
import ServerSetting from '@aurora/modules/server-settings/server-setting';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { createIntegrationKey } from '../shared/api-key';
import { PNG_BUFFER } from '../shared/poster-files';

let testApp: TestApp;

const URL = '/api/handler/screen/poster/requests';

beforeAll(async () => {
  // ARRANGE: posters are disabled as a whole, even though poster requests are enabled
  if (!getDataSource().isInitialized) {
    await getDataSource().initialize();
  }
  await getDataSource()
    .getRepository(ServerSetting)
    .save([
      { key: 'Poster', value: false },
      { key: 'Poster.Requests', value: true },
    ]);

  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('Poster requests with the poster feature disabled', () => {
  it('POST /api/handler/screen/poster/requests returns 409 for an authorized integration', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['createPosterRequest']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post(URL)
      .set('X-API-Key', key)
      .field('requesterName', 'Jane Doe')
      .field('requesterEmail', 'jane@example.com')
      .field('name', 'Open Podium')
      .attach('file', PNG_BUFFER, { filename: 'poster.png' });

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toBe('Endpoint is disabled by setting "Poster".');
  });

  it('GET /api/handler/screen/poster/requests returns 409 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(URL);

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toBe('Endpoint is disabled by setting "Poster".');
  });
});
