import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import type { ScreenResponse } from '../../src/modules/root/root-screen-service';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/screen', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/screen');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a list of screens (may be empty)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns screens with unique ids', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen');

    // ASSERT
    expect(res.status).toBe(200);
    const ids = (res.body as ScreenResponse[]).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('GET /api/screen/me', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/screen/me');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when admin lacks SCREEN_SUBSCRIBER scope', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen/me');

    // ASSERT
    expectApiError(res, 403);
  });
});

describe('GET /api/screen/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/screen/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth after creating a screen', async () => {
    // ARRANGE
    const createRes = await testApp.authorizedAgent
      .post('/api/screen')
      .send({ name: `Screen ${Date.now()}`, defaultHandler: '', scaleFactor: 1 });

    // ACT
    const res = await testApp.authorizedAgent.get(`/api/screen/${createRes.body.id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        scaleFactor: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(res.body).not.toHaveProperty('defaultHandler');
  });

  it('returns 404 with a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen/999999');

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 with a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/screen/not-a-number');

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('POST /api/screen', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/screen')
      .send({ name: 'Test Screen', defaultHandler: '', scaleFactor: 1 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and creates the screen', async () => {
    // ARRANGE
    const screenName = `Test Screen ${Date.now()}`;

    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/screen')
      .send({ name: screenName, defaultHandler: '', scaleFactor: 1 });
    const fetchRes = await testApp.authorizedAgent.get(`/api/screen/${res.body.id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: screenName,
        scaleFactor: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(res.body).not.toHaveProperty('defaultHandler');

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body).toEqual(
      expect.objectContaining({
        name: screenName,
      }),
    );
  });

  it('returns 400 with a missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/screen')
      .send({ defaultHandler: '', scaleFactor: 1 });

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with an empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/screen').send({});

    // ASSERT
    expectValidationError(res, 400);
  });
});
