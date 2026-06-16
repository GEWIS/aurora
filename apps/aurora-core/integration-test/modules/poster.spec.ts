import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

// Smallest valid 1x1 PNG, so file-type detection recognises it as image/png.
const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64',
);

/**
 * Minimal valid create body for a media poster. Spread and override per test.
 * footerSize/defaultTimeout/borrelMode are required by the request schema.
 */
const baseMediaPoster = {
  name: 'Test Poster',
  type: 'img',
  footerSize: 'full',
  defaultTimeout: 15,
  borrelMode: false,
};

/**
 * Creates a poster through the API and returns its id.
 * @param overrides Fields to merge onto the minimal media poster body.
 */
async function createPoster(overrides: Record<string, unknown> = {}): Promise<number> {
  const res = await testApp.authorizedAgent
    .post('/api/handler/screen/poster/items')
    .send({ ...baseMediaPoster, ...overrides });
  expect(res.status).toBe(200);
  return res.body.id as number;
}

describe('GET /api/handler/screen/poster/items', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/items');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty list initially', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/items');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/handler/screen/poster/items', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/items')
      .send(baseMediaPoster);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with an unknown poster type', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/items')
      .send({ ...baseMediaPoster, type: 'definitely-not-a-type' });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 when required fields are missing', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/items')
      .send({ type: 'img' });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 200 and creates an image poster', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/items')
      .send({ ...baseMediaPoster, type: 'img' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('number');
    expect(res.body.type).toBe('img');
    expect(res.body.enabled).toBe(true);
    expect(res.body.files).toEqual([]);
  });

  it('returns 200 and creates a video poster', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/items')
      .send({ ...baseMediaPoster, type: 'video' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('video');
  });

  it('returns 200 and creates an external poster with a uri', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/screen/poster/items').send({
      ...baseMediaPoster,
      type: 'extern',
      uri: 'https://example.com/poster.png',
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('extern');
    expect(res.body.uri).toBe('https://example.com/poster.png');
  });

  it('returns 200 and creates a photo poster with albums', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/screen/poster/items').send({
      ...baseMediaPoster,
      type: 'photo',
      albums: [1, 2],
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('photo');
    expect(res.body.albums).toEqual([1, 2]);
  });
});

describe('GET /api/handler/screen/poster/items/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/items/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/items/abc');

    // ASSERT
    expectValidationError(res);
  });

  it('returns 404 when the poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/items/999999');

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 200 with the poster when it exists', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent.get(`/api/handler/screen/poster/items/${id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });
});

describe('PUT /api/handler/screen/poster/items/{id}/media', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/handler/screen/poster/items/1/media')
      .attach('file', PNG_BUFFER, { filename: 'test.png', contentType: 'image/png' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 415 when the uploaded file is not an image or video', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent
      .put(`/api/handler/screen/poster/items/${id}/media`)
      .attach('file', Buffer.from('not-a-real-image'), {
        filename: 'test.png',
        contentType: 'image/png',
      });

    // ASSERT
    expect(res.status).toBe(415);
  });

  it('returns 404 when the poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/items/999999/media')
      .attach('file', PNG_BUFFER, { filename: 'test.png', contentType: 'image/png' });

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 when attaching media to a non-media poster', async () => {
    // ARRANGE
    const id = await createPoster({ type: 'extern', uri: 'https://example.com/poster.png' });

    // ACT
    const res = await testApp.authorizedAgent
      .put(`/api/handler/screen/poster/items/${id}/media`)
      .attach('file', PNG_BUFFER, { filename: 'test.png', contentType: 'image/png' });

    // ASSERT
    expectApiError(res, 400);
  });

  it('returns 200 and attaches the file to a media poster', async () => {
    // ARRANGE
    const id = await createPoster({ type: 'img' });

    // ACT
    const res = await testApp.authorizedAgent
      .put(`/api/handler/screen/poster/items/${id}/media`)
      .attach('file', PNG_BUFFER, { filename: 'test.png', contentType: 'image/png' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.files.length).toBe(1);
  });
});

describe('PATCH /api/handler/screen/poster/items/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .patch('/api/handler/screen/poster/items/1')
      .send({ label: 'Updated' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when the poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .patch('/api/handler/screen/poster/items/999999')
      .send({ label: 'Updated' });

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 200 and updates the given fields', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent
      .patch(`/api/handler/screen/poster/items/${id}`)
      .send({ label: 'Updated label' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.label).toBe('Updated label');
  });
});

describe('DELETE /api/handler/screen/poster/items/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/screen/poster/items/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/items/abc');

    // ASSERT
    expectValidationError(res);
  });

  it('returns 404 when the poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/items/999999');

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 204 when the poster exists', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent.delete(`/api/handler/screen/poster/items/${id}`);

    // ASSERT
    expect(res.status).toBe(204);
  });
});
