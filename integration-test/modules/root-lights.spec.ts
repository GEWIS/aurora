import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/lights/controller', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/controller');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no controllers seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/lights/controller/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/controller/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth for a nonexistent id (no controllers in DB)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller/1');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 404 with admin auth for a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller/99999');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with admin auth for a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller/not-a-number');

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('POST /api/lights/controller', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/controller')
      .send({ name: 'Test' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/controller')
      .send({ name: 'Test Controller ' + Date.now() });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('returns 400 with admin auth and missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/controller').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with admin auth and empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/controller').send({});

    // ASSERT
    expectValidationError(res);
  });
});

describe('GET /api/lights/switch', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/switch');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no switches seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/switch');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/lights/group', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/group');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no groups seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/group');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/lights/group/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/group/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth for a nonexistent id (no groups in DB)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/group/1');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 404 with admin auth for a nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/group/99999');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with admin auth for a non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/group/not-a-number');

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('GET /api/lights/controller/{id}/groups', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/controller/1/groups');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with admin auth (admin lacks light.subscriber scope)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller/1/groups');

    // ASSERT
    expect(res.status).toBe(403);
  });
});

describe('POST /api/lights/controller/{id}/group', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/controller/1/group')
      .send({ name: 'Test' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with admin auth and missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/controller/1/group').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 404 with admin auth when controller does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/controller/99999/group').send({
      name: 'Test Group',
      defaultHandler: '',
      groupInMiddle: true,
      gridSizeX: 0,
      pars: [],
      movingHeadRgbs: [],
      movingHeadWheels: [],
    });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/lights/controller/{id}/switches', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/controller/1/switches');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 with admin auth (admin lacks light.subscriber scope)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/controller/1/switches');

    // ASSERT
    expect(res.status).toBe(403);
  });
});

describe('POST /api/lights/controller/{id}/switches', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/controller/1/switches')
      .send({ name: 'Test' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with admin auth and missing name', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/controller/1/switches').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 404 with admin auth when controller does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/controller/99999/switches')
      .send({ name: 'Test Switch', dmxChannel: 1, onValue: 255 });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/lights/fixture/par', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/fixture/par');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no fixtures seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/fixture/par');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/lights/fixture/par', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/fixture/par')
      .send({ name: 'Test', nrChannels: 1 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/fixture/par').send({
      name: 'Test PAR ' + Date.now(),
      nrChannels: 1,
      colorRedChannel: 1,
      colorGreenChannel: 1,
      colorBlueChannel: 1,
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('returns 400 with admin auth and empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/fixture/par').send({});

    // ASSERT
    expectValidationError(res);
  });
});

describe('GET /api/lights/fixture/moving-head/rgb', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/fixture/moving-head/rgb');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no fixtures seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/fixture/moving-head/rgb');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/lights/fixture/moving-head/rgb', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/fixture/moving-head/rgb')
      .send({ name: 'Test', nrChannels: 1 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/fixture/moving-head/rgb').send({
      name: 'Test MH RGB ' + Date.now(),
      nrChannels: 1,
      panChannel: 1,
      tiltChannel: 1,
      colorRedChannel: 1,
      colorGreenChannel: 1,
      colorBlueChannel: 1,
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('returns 400 with admin auth and empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/fixture/moving-head/rgb').send({});

    // ASSERT
    expectValidationError(res);
  });
});

describe('GET /api/lights/fixture/moving-head/wheel', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/fixture/moving-head/wheel');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an empty array (no fixtures seeded)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/fixture/moving-head/wheel');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/lights/fixture/moving-head/wheel', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/fixture/moving-head/wheel')
      .send({ name: 'Test', nrChannels: 1 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and a valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/fixture/moving-head/wheel').send({
      name: 'Test MH Wheel ' + Date.now(),
      nrChannels: 1,
      panChannel: 1,
      tiltChannel: 1,
      masterDimChannel: 1,
      goboRotateChannel: 1,
      colorWheelChannel: 1,
      colorWheelChannelValues: [{ name: 'Red', value: 1 }],
      goboWheelChannel: 1,
      goboWheelChannelValues: [{ name: 'Star', value: 1 }],
      goboRotateChannelValues: [{ name: 'Fast', value: 1 }],
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('returns 400 with admin auth and empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/fixture/moving-head/wheel')
      .send({});

    // ASSERT
    expectValidationError(res);
  });
});

describe('GET /api/lights/effects', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/effects');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an array of effect names', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/effects');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/lights/colors', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/colors');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and an array of color definitions', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/lights/colors');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('returns 200 with an integration key scoped to getAllLightsColors', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['getAllLightsColors']);

    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/colors').set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('returns 200 with an integration key scoped to a different endpoint', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['someOtherEndpoint']);

    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/lights/colors').set('X-API-Key', key);

    // ASSERT
    expect(res.status).toBe(200);
  });
});
