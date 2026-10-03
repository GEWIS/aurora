import { describe, beforeAll, afterAll, afterEach, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import supertest, { type Agent as TestAgent } from 'supertest';
import sharp from 'sharp';
import { getDataSource } from '@aurora/database';
import ServerSetting from '@aurora/modules/server-settings/server-setting';
import EmitterStore from '@aurora/modules/events/emitter-store';
import { DiskStorage } from '@aurora/modules/files/storage';
import { File, IFile } from '@aurora/modules/files/entities';
import logger from '@aurora/logger';
import PosterRequest from '@aurora/modules/handlers/screen/poster/local/poster-request';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';
import { PNG_BUFFER, MP4_BUFFER } from '../shared/poster-files';

let testApp: TestApp;
let bacAgent: TestAgent;
let integrationKey: string;
const createdPosterIds: number[] = [];

const URL = '/api/handler/screen/poster/requests';
const CAROUSEL_URL = '/api/handler/screen/poster/carousel';

const requestFields: Record<string, string> = {
  requesterName: 'Jane Doe',
  requesterEmail: 'jane@example.com',
  requesterAssociation: 'GEWIS',
  message: 'Please show this during the break.',
  name: 'Open Podium',
  label: 'Open Podium tonight',
  accentColor: '#FFF200',
  footerSize: 'minimal',
  defaultTimeout: '20',
};

/**
 * Minimal valid approve body. Spread and override per test.
 */
const approveBody = {
  name: 'Open Podium',
  footerSize: 'full',
  defaultTimeout: 15,
  borrelMode: false,
};

beforeAll(async () => {
  // ARRANGE: persist Poster.Requests=true before the app boots, so the store picks it up
  if (!getDataSource().isInitialized) {
    await getDataSource().initialize();
  }
  await getDataSource().getRepository(ServerSetting).save({ key: 'Poster.Requests', value: true });

  testApp = await TestEnvironment.getInstance().getTestApp();
  integrationKey = await createIntegrationKey(['createPosterRequest']);

  // BAC members can view posters, but not review requests
  bacAgent = supertest.agent(testApp.app);
  await bacAgent.post('/api/auth/mock').send({ id: 'bac-member', name: 'BAC', roles: ['bac'] });
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  // Remove all stored files, so test runs do not fill the storage directories
  const storage = new DiskStorage('poster-requests', false);
  const requests = await getDataSource().getRepository(PosterRequest).find();
  await Promise.all(requests.map((r) => r.file && storage.deleteFile(r.file)));
  await Promise.all(
    createdPosterIds.map((id) =>
      testApp.authorizedAgent.delete(`/api/handler/screen/poster/items/${id}`),
    ),
  );
});

/**
 * Submit a poster request as the test integration and return its id.
 * @param fields Form fields to send, merged onto the default request fields.
 * @param file File to attach.
 */
async function createRequest(
  fields: Record<string, string> = {},
  file: { data: Buffer; filename: string } = { data: PNG_BUFFER, filename: 'poster.png' },
): Promise<number> {
  const req = testApp.unauthorizedAgent.post(URL).set('X-API-Key', integrationKey);
  Object.entries({ ...requestFields, ...fields }).forEach(([key, value]) => req.field(key, value));
  const res = await req.attach('file', file.data, { filename: file.filename });
  expect(res.status).toBe(200);
  return res.body.id as number;
}

async function findRequest(id: number): Promise<PosterRequest | null> {
  return getDataSource().getRepository(PosterRequest).findOne({ where: { id } });
}

function existsOnDisk(file: IFile): boolean {
  return fs.existsSync(path.join(file.relativeDirectory, file.name));
}

/**
 * Approve the given request as admin, keeping track of the poster so it is cleaned up.
 */
async function approve(id: number, body: Record<string, unknown> = approveBody) {
  const res = await testApp.authorizedAgent.post(`${URL}/${id}/approve`).send(body);
  if (res.status === 200) createdPosterIds.push(res.body.id);
  return res;
}

describe('GET /api/handler/screen/poster/requests', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(URL);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for a user without privileged poster rights', async () => {
    // ACT
    const res = await bacAgent.get(URL);

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 403 for the submitting integration', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(URL).set('X-API-Key', integrationKey);

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 200 with all requests oldest first, including requester details', async () => {
    // ARRANGE
    const first = await createRequest();
    const second = await createRequest({ name: 'Second' });

    // ACT
    const res = await testApp.authorizedAgent.get(URL);

    // ASSERT
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids.indexOf(first)).toBeLessThan(ids.indexOf(second));
    expect(res.body.find((r: { id: number }) => r.id === first)).toEqual({
      id: first,
      createdAt: expect.any(String),
      requesterName: 'Jane Doe',
      requesterEmail: 'jane@example.com',
      requesterAssociation: 'GEWIS',
      message: 'Please show this during the break.',
      integrationName: 'Test Integration',
      name: 'Open Podium',
      type: 'img',
      label: 'Open Podium tonight',
      accentColor: 'fff200',
      footerSize: 'minimal',
      defaultTimeout: 20,
      borrelMode: false,
      fileName: 'poster.png',
    });
  });
});

describe('GET /api/handler/screen/poster/requests/{id}/media', () => {
  it('returns 403 for a user without privileged poster rights', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await bacAgent.get(`${URL}/${id}/media`);

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 404 for an unknown request', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(`${URL}/999999/media`);

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns the file with its detected content type and without the original filename', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await testApp.authorizedAgent
      .get(`${URL}/${id}/media`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\/png/);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-disposition']).toBe('inline');
    expect((await sharp(res.body as Buffer).metadata()).format).toBe('png');
  });
});

describe('POST /api/handler/screen/poster/requests/{id}/approve', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(`${URL}/1/approve`).send(approveBody);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for a user without privileged poster rights', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await bacAgent.post(`${URL}/${id}/approve`).send(approveBody);

    // ASSERT
    expectApiError(res, 403);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('returns 404 for an unknown request', async () => {
    // ACT
    const res = await approve(999999);

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns a validation error without a name', async () => {
    // ARRANGE
    const id = await createRequest();
    const { name: _, ...body } = approveBody;

    // ACT
    const res = await approve(id, body);

    // ASSERT
    expectValidationError(res);
    expect(await findRequest(id)).not.toBeNull();
  });

  it.each([
    ['a blank name', { name: '  ' }],
    ['an invalid accent color', { accentColor: 'red' }],
    ['a timeout below 1 second', { defaultTimeout: 0 }],
    [
      'an expiration date before the start date',
      { startDate: '2026-10-12T00:00:00.000Z', expirationDate: '2026-10-05T00:00:00.000Z' },
    ],
  ])('returns 400 for %s and keeps the request', async (_, fields) => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await approve(id, { ...approveBody, ...fields });

    // ASSERT
    expectApiError(res, 400);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('creates an enabled poster with the reviewed fields and a public file', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await approve(id, {
      name: 'Open Podium (edited)',
      label: 'Edited label',
      startDate: '2026-01-01T10:00:00.000Z',
      expirationDate: '2099-01-01T10:00:00.000Z',
      accentColor: '#00FF00',
      footerSize: 'hidden',
      defaultTimeout: 30,
      borrelMode: true,
    });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Open Podium (edited)',
      label: 'Edited label',
      type: 'img',
      enabled: true,
      startDate: '2026-01-01T10:00:00.000Z',
      expirationDate: '2099-01-01T10:00:00.000Z',
      accentColor: '00ff00',
      footerSize: 'hidden',
      defaultTimeout: 30,
      borrelMode: true,
    });
    expect(res.body.files).toHaveLength(1);
    expect(res.body.files[0].location).toMatch(/^\/static\/posters\//);
  });

  it('does not set optional fields the reviewer left out, even if they were requested', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await approve(id);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.label).toBeUndefined();
    expect(res.body.accentColor).toBeUndefined();
    expect(res.body.footerSize).toBe('full');
  });

  it('creates a video poster for a video request', async () => {
    // ARRANGE
    const id = await createRequest({}, { data: MP4_BUFFER, filename: 'poster.mp4' });

    // ACT
    const res = await approve(id);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('video');
  });

  it('deletes the request, its personal details and the private file', async () => {
    // ARRANGE
    const id = await createRequest();
    const file = (await findRequest(id))!.file!;
    expect(existsOnDisk(file)).toBe(true);

    // ACT
    const res = await approve(id);

    // ASSERT
    expect(res.status).toBe(200);
    expect(await findRequest(id)).toBeNull();
    expect(await getDataSource().getRepository(File).findOneBy({ id: file.id })).toBeNull();
    expect(existsOnDisk(file)).toBe(false);
    const list = await testApp.authorizedAgent.get(URL);
    expect(list.body.map((r: { id: number }) => r.id)).not.toContain(id);
  });

  it('shows the new poster at the end of the carousel when the carousel has an order', async () => {
    // ARRANGE
    const existing = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/items')
      .send({ ...approveBody, name: 'Existing', type: 'img' });
    createdPosterIds.push(existing.body.id);
    await testApp.authorizedAgent
      .put(`${CAROUSEL_URL}/order`)
      .send({ posterIds: [existing.body.id] });
    const id = await createRequest();

    // ACT
    const res = await approve(id);

    // ASSERT
    const carousel = await testApp.authorizedAgent.get(CAROUSEL_URL);
    const ids = carousel.body.posters.map((p: { id: number }) => p.id);
    expect(ids[ids.length - 1]).toBe(res.body.id);
  });

  it('shows the new poster at the end of the carousel when the carousel has no order', async () => {
    // ARRANGE
    await testApp.authorizedAgent.put(`${CAROUSEL_URL}/order`).send({ posterIds: [] });
    const id = await createRequest();

    // ACT
    const res = await approve(id);

    // ASSERT
    const carousel = await testApp.authorizedAgent.get(CAROUSEL_URL);
    const ids = carousel.body.posters.map((p: { id: number }) => p.id);
    expect(ids[ids.length - 1]).toBe(res.body.id);
  });

  it('notifies the backoffice without sending any request data', async () => {
    // ARRANGE
    const id = await createRequest();
    const emit = vi.spyOn(EmitterStore.getInstance().backofficeSyncEmitter, 'emit');

    // ACT
    await approve(id);

    // ASSERT
    expect(emit).toHaveBeenCalledWith('poster_request_update');
  });

  it('writes an audit log entry without personal details', async () => {
    // ARRANGE
    const id = await createRequest();
    const audit = vi.spyOn(logger, 'audit');

    // ACT
    const res = await approve(id);

    // ASSERT
    expect(audit).toHaveBeenCalledWith(
      expect.anything(),
      `Approve poster request (id: ${id}) as poster (id: ${res.body.id}).`,
    );
    const messages = audit.mock.calls.map((call) => String(call[1]));
    messages.forEach((message) => {
      expect(message).not.toContain('Jane');
      expect(message).not.toContain('jane@example.com');
      expect(message).not.toContain('GEWIS');
    });
  });
});

describe('POST /api/handler/screen/poster/requests/{id}/deny', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(`${URL}/1/deny`);

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for a user without privileged poster rights', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await bacAgent.post(`${URL}/${id}/deny`);

    // ASSERT
    expectApiError(res, 403);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('returns 404 for an unknown request', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(`${URL}/999999/deny`);

    // ASSERT
    expectApiError(res, 404);
  });

  it('deletes the request, its personal details and the file, without creating a poster', async () => {
    // ARRANGE
    const id = await createRequest({ name: 'Denied poster' });
    const file = (await findRequest(id))!.file!;

    // ACT
    const res = await testApp.authorizedAgent.post(`${URL}/${id}/deny`);

    // ASSERT
    expect(res.status).toBe(204);
    expect(await findRequest(id)).toBeNull();
    expect(await getDataSource().getRepository(File).findOneBy({ id: file.id })).toBeNull();
    expect(existsOnDisk(file)).toBe(false);
    const posters = await testApp.authorizedAgent.get('/api/handler/screen/poster/items');
    expect(posters.body.map((p: { name: string }) => p.name)).not.toContain('Denied poster');
  });

  it('notifies the backoffice and writes an audit log entry', async () => {
    // ARRANGE
    const id = await createRequest();
    const emit = vi.spyOn(EmitterStore.getInstance().backofficeSyncEmitter, 'emit');
    const audit = vi.spyOn(logger, 'audit');

    // ACT
    await testApp.authorizedAgent.post(`${URL}/${id}/deny`);

    // ASSERT
    expect(emit).toHaveBeenCalledWith('poster_request_update');
    expect(audit).toHaveBeenCalledWith(expect.anything(), `Deny poster request (id: ${id}).`);
  });
});
