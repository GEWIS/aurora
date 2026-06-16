import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

describe('GET /api/timed-events', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/timed-events');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with array of TimedEventResponse', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/timed-events');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('GET /api/timed-events/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/timed-events/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with valid id', async () => {
    // ARRANGE
    const create = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });
    const id = create.body.id;

    const createdEventMatcher = expect.objectContaining({
      id,
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
      skipNext: false,
    });

    // ACT
    const res = await testApp.authorizedAgent.get(`/api/timed-events/${id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdEventMatcher);
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');

    await testApp.authorizedAgent.delete(`/api/timed-events/${id}`);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/timed-events/99999');

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 with non-numeric id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/timed-events/not-a-number');

    // ASSERT
    expectValidationError(res);
  });
});

describe('POST /api/timed-events', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });

    // ASSERT
    expectApiError(res, 401);
  });

  it('creates a timed event with valid body', async () => {
    // ARRANGE
    const createdEventMatcher = expect.objectContaining({
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
      skipNext: false,
    });

    // ACT
    const res = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdEventMatcher);

    await testApp.authorizedAgent.delete(`/api/timed-events/${res.body.id}`);
  });

  it('returns 400 with missing cronExpression', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/timed-events').send({
      eventSpec: { type: 'system-reset' },
    });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with missing eventSpec', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
    });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with empty body', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/timed-events').send({});

    // ASSERT
    expectValidationError(res);
  });

  it('returns 400 with invalid cron expression', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: 'not-a-cron',
      eventSpec: { type: 'system-reset' },
    });

    // ASSERT
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/timed-events/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.put('/api/timed-events/1').send({
      cronExpression: '0 0 1 6 *',
      eventSpec: { type: 'system-reset' },
      skipNext: false,
    });

    // ASSERT
    expectApiError(res, 401);
  });

  it('updates a timed event with valid body', async () => {
    // ARRANGE
    const create = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });
    const id = create.body.id;
    const newCron = '0 0 1 6 *';

    const updatedEventMatcher = expect.objectContaining({
      id,
      cronExpression: newCron,
      eventSpec: { type: 'system-reset' },
      skipNext: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // ACT
    const res = await testApp.authorizedAgent.put(`/api/timed-events/${id}`).send({
      cronExpression: newCron,
      eventSpec: { type: 'system-reset' },
      skipNext: true,
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedEventMatcher);

    await testApp.authorizedAgent.delete(`/api/timed-events/${id}`);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.put('/api/timed-events/99999').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
      skipNext: false,
    });

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 400 with missing fields', async () => {
    // ARRANGE
    const create = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });
    const id = create.body.id;

    // ACT
    const res = await testApp.authorizedAgent.put(`/api/timed-events/${id}`).send({});

    // ASSERT
    expectValidationError(res);

    await testApp.authorizedAgent.delete(`/api/timed-events/${id}`);
  });
});

describe('DELETE /api/timed-events/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/timed-events/1');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 on successful delete', async () => {
    // ARRANGE
    const create = await testApp.authorizedAgent.post('/api/timed-events').send({
      cronExpression: '0 0 1 1 *',
      eventSpec: { type: 'system-reset' },
    });
    const id = create.body.id;

    // ACT
    const res = await testApp.authorizedAgent.delete(`/api/timed-events/${id}`);

    // ASSERT
    expect(res.status).toBe(204);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/timed-events/99999');

    // ASSERT
    expectApiError(res, 404);
  });
});
