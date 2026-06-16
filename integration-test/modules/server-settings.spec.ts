import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/settings', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/settings');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with the full ISettings object for admin', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/settings');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        SudoSOS: expect.any(Boolean),
        Centurion: expect.any(Boolean),
        RoomResponsibleLegacyScreenURL: expect.any(String),
        Poster: expect.any(Boolean),
        Orders: expect.any(Boolean),
      }),
    );
  });
});

describe('POST /api/settings', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/settings')
      .send({ key: 'Orders', value: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('updates a known setting and returns { key, value } with admin auth', async () => {
    // ARRANGE
    const original = await testApp.authorizedAgent.get('/api/settings');
    const originalOrders = original.body.Orders;

    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/settings')
      .send({ key: 'Orders', value: true });
    const after = await testApp.authorizedAgent.get('/api/settings');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ key: 'Orders', value: true });
    expect(after.body.Orders).toBe(true);

    await testApp.authorizedAgent
      .post('/api/settings')
      .send({ key: 'Orders', value: originalOrders });
  });

  it('returns 400 (text) for an unknown setting key', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/settings')
      .send({ key: 'ThisKeyDoesNotExist', value: true });

    // ASSERT
    expect(res.status).toBe(400);
    expect(res.text).toContain('not found');
  });

  it('returns 400 (text) for an empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/settings').send({});

    // ASSERT
    expect(res.status).toBe(400);
  });

  it('returns 400 (text) when the value type mismatches the current type', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/settings')
      .send({ key: 'Orders', value: 'not-a-boolean' });

    // ASSERT
    expect(res.status).toBe(400);
    expect(res.text).toContain('correct value type');
  });
});

describe('POST /api/settings/file', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/settings/file');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and multipart upload', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/settings/file')
      .field('key', 'Poster.ProgressBarLogo')
      .attach('file', Buffer.from('test-content'), 'logo.png');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('key', 'Poster.ProgressBarLogo');
    expect(res.body.value).toHaveProperty('relativeDirectory', 'private/server-settings');
    expect(res.body.value).toHaveProperty('originalName', 'logo.png');
  });
});

describe('DELETE /api/settings/file', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .delete('/api/settings/file')
      .send({ key: 'Poster.ProgressBarLogo' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('clears a known file-shaped setting with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .delete('/api/settings/file')
      .send({ key: 'Poster.ProgressBarLogo' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ key: 'Poster.ProgressBarLogo', value: '' });
  });

  it('returns 404 (text) for an unknown setting key', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .delete('/api/settings/file')
      .send({ key: 'ThisKeyDoesNotExist' });

    // ASSERT
    expect(res.status).toBe(404);
    expect(res.text).toContain('not found');
  });
});

describe('GET /api/settings/feature-flags', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/settings/feature-flags');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with a list of { key, value } entries for admin', async () => {
    // ARRANGE
    const settingsMatcher = expect.objectContaining({
      key: expect.any(String),
      value: expect.any(Boolean),
    });

    // ACT
    const res = await testApp.authorizedAgent.get('/api/settings/feature-flags');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([settingsMatcher]));
  });

  it('returns at least one feature flag in the response', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/settings/feature-flags');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
