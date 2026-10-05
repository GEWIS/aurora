import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { getDataSource } from '@aurora/database';
import ServerSetting from '@aurora/modules/server-settings/server-setting';
import { DiskStorage } from '@aurora/modules/files/storage';
import PosterRequest from '@aurora/modules/handlers/screen/poster/local/poster-request';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';
import { PNG_BUFFER } from '../shared/poster-files';

let testApp: TestApp;
let integrationKey: string;
const createdPosterIds: number[] = [];

const URL = '/api/handler/screen/poster/requests';
const POSTER_URI = 'https://example.com/poster';

const baseFields: Record<string, string> = {
  requesterName: 'Jane Doe',
  requesterEmail: 'jane@example.com',
  name: 'Live results',
};

/**
 * Minimal valid approve body for an external poster. Spread and override per test.
 */
const approveBody = {
  name: 'Live results',
  uri: POSTER_URI,
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
 * Submit a poster request as the test integration.
 * @param fields Form fields to send, merged onto the minimal valid fields with a uri.
 * @param withFile Whether to also attach a file.
 */
function submit(fields: Record<string, string> = {}, withFile = false) {
  const req = testApp.unauthorizedAgent.post(URL).set('X-API-Key', integrationKey);
  Object.entries({ ...baseFields, uri: POSTER_URI, ...fields }).forEach(([key, value]) => {
    req.field(key, value);
  });
  if (withFile) req.attach('file', PNG_BUFFER, { filename: 'poster.png' });
  return req;
}

/**
 * Submit an external poster request and return its id.
 */
async function createRequest(): Promise<number> {
  const res = await submit();
  expect(res.status).toBe(200);
  return res.body.id as number;
}

/**
 * Submit a media poster request and return its id.
 */
async function createMediaRequest(): Promise<number> {
  const res = await submit({ uri: '' }, true);
  expect(res.status).toBe(200);
  return res.body.id as number;
}

async function findRequest(id: number): Promise<PosterRequest | null> {
  return getDataSource().getRepository(PosterRequest).findOne({ where: { id } });
}

async function approve(id: number, body: Record<string, unknown> = approveBody) {
  const res = await testApp.authorizedAgent.post(`${URL}/${id}/approve`).send(body);
  if (res.status === 200) createdPosterIds.push(res.body.id);
  return res;
}

describe('POST /api/handler/screen/poster/requests with a uri', () => {
  it('returns 200 and stores an external poster request without a file', async () => {
    // ACT
    const res = await submit({ uri: ` ${POSTER_URI} ` });

    // ASSERT
    expect(res.status).toBe(200);
    const request = await findRequest(res.body.id);
    expect(request).toMatchObject({ type: 'extern', uri: POSTER_URI, file: null });
  });

  it('returns 400 when both a file and a uri are sent', async () => {
    // ARRANGE
    const before = await getDataSource().getRepository(PosterRequest).count();

    // ACT
    const res = await submit({}, true);

    // ASSERT
    expectApiError(res, 400);
    expect(await getDataSource().getRepository(PosterRequest).count()).toBe(before);
  });

  it.each([
    ['not a URL', 'not a url'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['an ftp URL', 'ftp://example.com/poster'],
    ['a URL longer than 255 characters', `https://example.com/${'a'.repeat(240)}`],
  ])('returns 400 for %s', async (_, uri) => {
    // ACT
    const res = await submit({ uri });

    // ASSERT
    expectApiError(res, 400);
  });
});

describe('Reviewing external poster requests', () => {
  it('lists the uri and no file name', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await testApp.authorizedAgent.get(URL);

    // ASSERT
    const request = res.body.find((r: { id: number }) => r.id === id);
    expect(request).toMatchObject({ type: 'extern', uri: POSTER_URI });
    expect(request).not.toHaveProperty('fileName');
  });

  it('returns 404 for the media of an external poster request', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await testApp.authorizedAgent.get(`${URL}/${id}/media`);

    // ASSERT
    expectApiError(res, 404);
  });

  it('approves into an enabled external poster with the reviewed uri', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await approve(id, { ...approveBody, uri: 'https://example.com/edited' });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      type: 'extern',
      enabled: true,
      uri: 'https://example.com/edited',
      files: [],
    });
    expect(await findRequest(id)).toBeNull();
  });

  it('returns 400 when approving an external poster request without a uri', async () => {
    // ARRANGE
    const id = await createRequest();
    const { uri: _, ...body } = approveBody;

    // ACT
    const res = await approve(id, body);

    // ASSERT
    expectApiError(res, 400);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('returns 400 when approving an external poster request with an invalid uri', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await approve(id, { ...approveBody, uri: 'javascript:alert(1)' });

    // ASSERT
    expectApiError(res, 400);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('returns 400 when approving a media poster request with a uri', async () => {
    // ARRANGE
    const id = await createMediaRequest();

    // ACT
    const res = await approve(id);

    // ASSERT
    expectApiError(res, 400);
    expect(await findRequest(id)).not.toBeNull();
  });

  it('denies an external poster request', async () => {
    // ARRANGE
    const id = await createRequest();

    // ACT
    const res = await testApp.authorizedAgent.post(`${URL}/${id}/deny`);

    // ASSERT
    expect(res.status).toBe(204);
    expect(await findRequest(id)).toBeNull();
  });
});
