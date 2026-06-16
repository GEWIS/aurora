import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('POST /api/handler/lights/set-effects/{id}/color', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/set-effects/1/color')
      .send([{ type: 'StaticColor', props: { color: 'red' } }]);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent group id (no seeded lights groups)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/color')
      .send([{ type: 'StaticColor', props: { color: 'red' } }]);

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with missing body (@Body() array param)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/lights/set-effects/1/color');

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid body shape (object instead of array)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/color')
      .send({ not: 'an array' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('POST /api/handler/lights/set-effects/{id}/color/colors', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/set-effects/1/color/colors')
      .send({ colors: ['red', 'green'] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent group id (no seeded lights groups)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/color/colors')
      .send({ colors: ['red', 'green'] });

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with missing body (@Body() object param)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/lights/set-effects/1/color/colors',
    );

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid body shape', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/color/colors')
      .send({ wrong: 'field' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('POST /api/handler/lights/set-effects/{id}/movement', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/set-effects/1/movement')
      .send([{ type: 'ZigZag', props: {} }]);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent group id (no seeded lights groups)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/movement')
      .send([{ type: 'ZigZag', props: {} }]);

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with missing body (@Body() array param)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/lights/set-effects/1/movement');

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid body shape (object instead of array)', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/1/movement')
      .send({ not: 'an array' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('GET /api/handler/lights/set-effects/predefined', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/set-effects/predefined');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns empty array with admin auth (no seeded predefined effects)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights/set-effects/predefined');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/handler/lights/set-effects/predefined', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/set-effects/predefined')
      .send({
        buttonId: 1,
        properties: { type: 'LightsButtonNull' },
        name: 'Test',
      });

    // ASSERT
    expectApiError(res, 401);
  });

  it('creates a predefined effect with valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/predefined')
      .send({
        buttonId: 1,
        properties: { type: 'LightsButtonNull' },
        name: 'Test',
      });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('buttonId', 1);
    expect(res.body).toHaveProperty('name', 'Test');
  });

  it('returns 400 with missing body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/handler/lights/set-effects/predefined');

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid body shape', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/set-effects/predefined')
      .send({ buttonId: 'not-a-number' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('PATCH /api/handler/lights/set-effects/predefined/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .patch('/api/handler/lights/set-effects/predefined/999999')
      .send({ name: 'Updated' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .patch('/api/handler/lights/set-effects/predefined/999999')
      .send({ name: 'Updated' });

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('returns 400 with missing body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.patch(
      '/api/handler/lights/set-effects/predefined/999999',
    );

    // ASSERT
    expectValidationError(res, 400);
  });

  it('returns 400 with invalid body shape', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .patch('/api/handler/lights/set-effects/predefined/999999')
      .send({ buttonId: 'not-a-number' });

    // ASSERT
    expectValidationError(res, 400);
  });
});

describe('DELETE /api/handler/lights/set-effects/predefined/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete(
      '/api/handler/lights/set-effects/predefined/999999',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 (delete succeeds even for nonexistent entity)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete(
      '/api/handler/lights/set-effects/predefined/999999',
    );

    // ASSERT
    expect(res.status).toBe(204);
  });
});
