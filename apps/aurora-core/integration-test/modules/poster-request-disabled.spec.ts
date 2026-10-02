import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

// Smallest valid 1x1 PNG, so file-type detection recognises it as image/png.
const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64',
);

beforeAll(async () => {
  // Poster.Requests is off by default, so no setting has to be persisted
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('Poster requests feature disabled', () => {
  it('POST /api/handler/screen/poster/requests returns 409 for an authorized integration', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['createPosterRequest']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/requests')
      .set('X-API-Key', key)
      .field('requesterName', 'Jane Doe')
      .field('requesterEmail', 'jane@example.com')
      .field('name', 'Open Podium')
      .attach('file', PNG_BUFFER, { filename: 'poster.png' });

    // ASSERT
    expect(res.status).toBe(409);
    expect(res.text).toContain('Poster.Requests');
  });
});
