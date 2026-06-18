import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('POST /api/lights/group/{id}/strobe/enable', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/1/strobe/enable');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/1/strobe/enable');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/{id}/strobe/disable', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/1/strobe/disable');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/1/strobe/disable');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/{id}/freeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/1/freeze');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/1/freeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/{id}/unfreeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/1/unfreeze');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/1/unfreeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/{id}/dimmer', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/group/1/dimmer')
      .send({ relativeBrightness: 0.5 });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 with missing body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/1/dimmer').send({});

    // ASSERT
    expect(res.status).toBe(400);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/group/1/dimmer')
      .send({ relativeBrightness: 0.5 });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/lights/group/{id}/dimmer', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/lights/group/1/dimmer');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (group does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/lights/group/1/dimmer');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/par/{id}/override', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/group/par/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (par does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/group/par/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/par/{id}/reset', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/par/1/reset');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (par does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/par/1/reset');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/par/{id}/freeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/par/1/freeze');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (par does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/par/1/freeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/par/{id}/unfreeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/par/1/unfreeze');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (par does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/par/1/unfreeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-rgb/{id}/override', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/group/moving-head-rgb/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/group/moving-head-rgb/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-rgb/{id}/reset', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/moving-head-rgb/1/reset');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/moving-head-rgb/1/reset');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-rgb/{id}/freeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/moving-head-rgb/1/freeze');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/moving-head-rgb/1/freeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-rgb/{id}/unfreeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/lights/group/moving-head-rgb/1/unfreeze',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/moving-head-rgb/1/unfreeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-wheel/{id}/override', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/lights/group/moving-head-wheel/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/lights/group/moving-head-wheel/1/override')
      .send({ dmxValues: [0] });

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-wheel/{id}/reset', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/group/moving-head-wheel/1/reset');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/moving-head-wheel/1/reset');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-wheel/{id}/freeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/lights/group/moving-head-wheel/1/freeze',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/group/moving-head-wheel/1/freeze');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/group/moving-head-wheel/{id}/unfreeze', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/lights/group/moving-head-wheel/1/unfreeze',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (fixture does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/lights/group/moving-head-wheel/1/unfreeze',
    );

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/switch/{id}/on', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/switch/1/on');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (switch does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/switch/1/on');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lights/switch/{id}/off', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/lights/switch/1/off');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with admin auth (switch does not exist)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/lights/switch/1/off');

    // ASSERT
    expect(res.status).toBe(404);
  });
});
