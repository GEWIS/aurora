import { describe, beforeAll, it, expect } from 'vitest';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;
let groupId: number;

const redEffect = { type: 'StaticColor', props: { color: 'red' } };
const greenEffect = { type: 'StaticColor', props: { color: 'green' } };

async function createScene(name: string, effects: object[]) {
  const res = await testApp.authorizedAgent
    .post('/api/handler/lights/scenes/scene')
    .send({ name, favorite: false, effects });
  expect(res.status, JSON.stringify(res.body)).toBe(200);
  return res.body as { id: number };
}

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();

  const controller = await testApp.authorizedAgent
    .post('/api/lights/controller')
    .send({ name: 'Scenes Test Controller ' + Date.now() });
  const group = await testApp.authorizedAgent
    .post(`/api/lights/controller/${controller.body.id}/group`)
    .send({
      name: 'Scenes Test Group',
      defaultHandler: '',
      groupInMiddle: true,
      gridSizeX: 0,
      pars: [],
      movingHeadRgbs: [],
      movingHeadWheels: [],
    });
  expect(group.status, JSON.stringify(group.body)).toBe(200);
  groupId = group.body.id;
});

describe('GET /api/handler/lights/scenes/scene', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/scenes/scene');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns empty array with admin auth (no seeded scenes)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights/scenes/scene');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/handler/lights/scenes/scene/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/scenes/scene/999999');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/lights/scenes/scene/999999');

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('POST /api/handler/lights/scenes/scene', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/lights/scenes/scene')
      .send({ name: 'Test Scene', favorite: false, effects: [] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with the created scene including effect props', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/scenes/scene')
      .send({
        name: 'Test Scene',
        favorite: true,
        effects: [{ ...redEffect, lightsGroups: [groupId] }],
      });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test Scene',
      favorite: true,
      effects: [{ ...redEffect, lightsGroups: [{ id: groupId }] }],
    });
  });

  it('returns 400 listing the ids of nonexistent lights groups', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/scenes/scene')
      .send({
        name: 'Invalid Scene',
        favorite: false,
        effects: [{ ...redEffect, lightsGroups: [groupId, 999999] }],
      });

    // ASSERT
    expect(res.status).toBe(400);
    expect(res.body.reason).toContain('999999');
    expect(res.body.reason).not.toContain(`${groupId}`);
  });

  it('returns 400 with an unknown effect type', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/lights/scenes/scene')
      .send({
        name: 'Invalid Scene',
        favorite: false,
        effects: [{ type: 'DoesNotExist', props: {}, lightsGroups: [groupId] }],
      });

    // ASSERT
    expectValidationError(res);
  });

  it('keeps effects of the same type with different props separate', async () => {
    // ACT
    const scene = await createScene('Two colors', [
      { ...redEffect, lightsGroups: [groupId] },
      { ...greenEffect, lightsGroups: [groupId] },
    ]);
    const res = await testApp.authorizedAgent.get(`/api/handler/lights/scenes/scene/${scene.id}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.effects).toHaveLength(2);
    expect(res.body.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining(redEffect),
        expect.objectContaining(greenEffect),
      ]),
    );
  });
});

describe('PUT /api/handler/lights/scenes/scene/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/handler/lights/scenes/scene/1')
      .send({ name: 'Test Scene', favorite: false, effects: [] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/lights/scenes/scene/999999')
      .send({ name: 'Test Scene', favorite: false, effects: [] });

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('replaces the name, favorite status and effects', async () => {
    // ARRANGE
    const scene = await createScene('Before update', [{ ...redEffect, lightsGroups: [groupId] }]);

    // ACT
    const res = await testApp.authorizedAgent
      .put(`/api/handler/lights/scenes/scene/${scene.id}`)
      .send({
        name: 'After update',
        favorite: true,
        effects: [{ ...greenEffect, lightsGroups: [groupId] }],
      });
    const getRes = await testApp.authorizedAgent.get(
      `/api/handler/lights/scenes/scene/${scene.id}`,
    );

    // ASSERT
    expect(res.status).toBe(200);
    expect(getRes.body).toMatchObject({
      id: scene.id,
      name: 'After update',
      favorite: true,
    });
    expect(getRes.body.effects).toHaveLength(1);
    expect(getRes.body.effects[0]).toMatchObject(greenEffect);
  });

  it('returns 400 listing the ids of nonexistent lights groups', async () => {
    // ARRANGE
    const scene = await createScene('Invalid update', [{ ...redEffect, lightsGroups: [groupId] }]);

    // ACT
    const res = await testApp.authorizedAgent
      .put(`/api/handler/lights/scenes/scene/${scene.id}`)
      .send({
        name: 'Invalid update',
        favorite: false,
        effects: [{ ...redEffect, lightsGroups: [999999] }],
      });

    // ASSERT
    expect(res.status).toBe(400);
    expect(res.body.reason).toContain('999999');
  });
});

describe('DELETE /api/handler/lights/scenes/scene/{id}', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/lights/scenes/scene/999999');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/lights/scenes/scene/999999');

    // ASSERT
    expect(res.status).toBe(404);
  });

  it('deletes a scene together with its effects', async () => {
    // ARRANGE
    const scene = await createScene('To delete', [{ ...redEffect, lightsGroups: [groupId] }]);

    // ACT
    const res = await testApp.authorizedAgent.delete(
      `/api/handler/lights/scenes/scene/${scene.id}`,
    );
    const getRes = await testApp.authorizedAgent.get(
      `/api/handler/lights/scenes/scene/${scene.id}`,
    );

    // ASSERT
    expect(res.status).toBeLessThan(300);
    expect(getRes.status).toBe(404);
  });
});

describe('POST /api/handler/lights/scenes/scene/{id}/apply', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post('/api/handler/lights/scenes/scene/1/apply');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 with nonexistent id', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/lights/scenes/scene/999999/apply',
    );

    // ASSERT
    expect(res.status).toBe(404);
  });
});

describe('GET /api/handler/lights/scenes/active', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/lights/scenes/active');

    // ASSERT
    expectApiError(res, 401);
  });

  it('tracks the applied scene until it is cleared', async () => {
    // ARRANGE
    const scene = await createScene('Active scene', [{ ...redEffect, lightsGroups: [groupId] }]);
    await testApp.authorizedAgent
      .post(`/api/handler/lights/${groupId}`)
      .send({ name: 'ScenesHandler' });

    // ACT
    const before = await testApp.authorizedAgent.get('/api/handler/lights/scenes/active');
    await testApp.authorizedAgent.post(`/api/handler/lights/scenes/scene/${scene.id}/apply`);
    const applied = await testApp.authorizedAgent.get('/api/handler/lights/scenes/active');
    await testApp.authorizedAgent.delete('/api/handler/lights/scenes/active');
    const cleared = await testApp.authorizedAgent.get('/api/handler/lights/scenes/active');

    // ASSERT
    expect(before.status).toBe(200);
    expect(before.body).toEqual({ scene: null });
    expect(applied.body.scene).toMatchObject({ id: scene.id, name: 'Active scene' });
    expect(cleared.body).toEqual({ scene: null });
  });

  it('returns null after the active scene is deleted', async () => {
    // ARRANGE
    const scene = await createScene('Deleted active', [{ ...redEffect, lightsGroups: [groupId] }]);
    await testApp.authorizedAgent
      .post(`/api/handler/lights/${groupId}`)
      .send({ name: 'ScenesHandler' });
    await testApp.authorizedAgent.post(`/api/handler/lights/scenes/scene/${scene.id}/apply`);

    // ACT
    await testApp.authorizedAgent.delete(`/api/handler/lights/scenes/scene/${scene.id}`);
    const res = await testApp.authorizedAgent.get('/api/handler/lights/scenes/active');

    // ASSERT
    expect(res.body).toEqual({ scene: null });
  });
});

describe('DELETE /api/handler/lights/scenes/active', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.delete('/api/handler/lights/scenes/active');

    // ASSERT
    expectApiError(res, 401);
  });

  it('clears the active scene with admin auth', async () => {
    // ACT
    const res = await testApp.authorizedAgent.delete('/api/handler/lights/scenes/active');

    // ASSERT
    expect(res.status).toBeLessThan(300);
  });
});
