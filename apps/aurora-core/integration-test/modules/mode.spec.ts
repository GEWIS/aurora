import { describe, beforeAll, it, expect } from 'vitest';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { TestEnvironment, type TestApp } from '../shared/test-app';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('DELETE /api/modes', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/modes');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/modes');

    // ASSERT
    expect(res.status).toBe(200);
  });
});

describe('POST /api/modes/centurion', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/modes/centurion').send({
      lightsGroupIds: [],
      screenIds: [],
      audioIds: [],
      centurionName: 'test',
      centurionArtist: 'test',
    });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion').send({});

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 404 when the tape does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion').send({
      lightsGroupIds: [],
      screenIds: [],
      audioIds: [],
      centurionName: 'test',
      centurionArtist: 'test',
    });

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 500 with admin auth (ModeManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/centurion').send({
      lightsGroupIds: [],
      screenIds: [],
      audioIds: [],
      centurionName: 'Totale EscalaTIEN',
      centurionArtist: 'Gebroeders Scooter',
    });

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/modes/centurion', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/modes/centurion');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with admin auth (ModeManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/modes/centurion');

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('POST /api/modes/time-trail-race', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/modes/time-trail-race')
      .send({ lightsGroupIds: [], screenIds: [], audioIds: [], sessionName: 'test' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/modes/time-trail-race').send({});

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 500 with admin auth (ModeManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/modes/time-trail-race')
      .send({ lightsGroupIds: [], screenIds: [], audioIds: [], sessionName: 'test' });

    // ASSERT
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/modes/time-trail-race', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/modes/time-trail-race');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 with admin auth (ModeManager not initialized)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/modes/time-trail-race');

    // ASSERT
    expect(res.status).toBe(500);
  });
});
