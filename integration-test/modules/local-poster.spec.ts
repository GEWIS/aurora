import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/handler/screen/poster/static', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/static');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (clock visible, no active poster)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/static');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.clockVisible).toBe(true);
    expect(res.body.activePoster).toBeFalsy();
  });
});

describe('DELETE /api/handler/screen/poster/static', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/screen/poster/static');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/static');

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('POST /api/handler/screen/poster/static/clock', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({ visible: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth and valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({ visible: true });

    // ASSERT
    expect(res.status).toBe(204);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/clock')
      .send({});

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('GET /api/handler/screen/poster/static/items', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/static/items');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and empty list', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/static/items');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/handler/screen/poster/static/items/file', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/static/items/file')
      .attach('file', Buffer.from('fake-image-bytes'), {
        filename: 'test.png',
        contentType: 'image/png',
      });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and multipart upload', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/items/file')
      .attach('file', Buffer.from('fake-image-bytes'), {
        filename: 'test.png',
        contentType: 'image/png',
      });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('number');
  });
});

describe('POST /api/handler/screen/poster/static/items/url', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/static/items/url')
      .send({ url: 'https://example.com/poster.png' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/items/url')
      .send({ url: 'https://example.com/poster.png' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('uri');
    expect(typeof res.body.id).toBe('number');
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/static/items/url')
      .send({});

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/handler/screen/poster/static/items/{id} when poster does not exist', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete(
      '/api/handler/screen/poster/static/items/999',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/static/items/999');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/screen/poster/static/items/abc');

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('POST /api/handler/screen/poster/static/items/{id}/show when poster does not exist', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/handler/screen/poster/static/items/999/show',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/screen/poster/static/items/999/show',
    );

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/screen/poster/static/items/abc/show',
    );

    // ASSERT
    expect(res.status).toBe(400);
  });
});
