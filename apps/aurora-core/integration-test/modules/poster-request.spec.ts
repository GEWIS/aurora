import { describe, beforeAll, afterAll, afterEach, it, expect, vi } from 'vitest';
import { getDataSource } from '@aurora/database';
import ServerSetting from '@aurora/modules/server-settings/server-setting';
import EmitterStore from '@aurora/modules/events/emitter-store';
import { DiskStorage } from '@aurora/modules/files/storage';
import PosterRequest from '@aurora/modules/handlers/screen/poster/local/poster-request';
import { MAX_UPLOAD_FILE_SIZE } from '@aurora/http';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';
import { createIntegrationKey } from '../shared/api-key';

let testApp: TestApp;
let integrationKey: string;

const URL = '/api/handler/screen/poster/requests';

// Smallest valid 1x1 PNG, so file-type detection recognises it as image/png.
const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64',
);
// JPEG signature, enough for file-type to recognise it as image/jpeg.
const JPG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
// MP4 "ftyp" box, enough for file-type to recognise it as video/mp4.
const MP4_BUFFER = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x18]),
  Buffer.from('ftypmp42', 'ascii'),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from('mp42isom', 'ascii'),
]);
// GIF signature: a valid image, but not one of the accepted types.
const GIF_BUFFER = Buffer.from('GIF89a\x01\x00\x01\x00\x00\x00\x00;', 'binary');

const baseFields: Record<string, string> = {
  requesterName: 'Jane Doe',
  requesterEmail: 'jane@example.com',
  name: 'Open Podium',
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

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  // Remove the uploaded files, so test runs do not fill the private storage directory
  const storage = new DiskStorage('poster-requests', false);
  const requests = await getDataSource().getRepository(PosterRequest).find();
  await Promise.all(requests.map((r) => storage.deleteFile(r.file)));
});

/**
 * Submit a poster request as the test integration.
 * @param fields Form fields to send, merged onto the minimal valid fields.
 * @param file File to attach, or null to send none.
 */
function submit(
  fields: Record<string, string> = {},
  file: { data: Buffer; filename: string } | null = { data: PNG_BUFFER, filename: 'poster.png' },
) {
  const req = testApp.unauthorizedAgent.post(URL).set('X-API-Key', integrationKey);
  Object.entries({ ...baseFields, ...fields }).forEach(([key, value]) => {
    req.field(key, value);
  });
  if (file) req.attach('file', file.data, { filename: file.filename });
  return req;
}

async function findRequest(id: number): Promise<PosterRequest | null> {
  return getDataSource().getRepository(PosterRequest).findOne({ where: { id } });
}

describe('POST /api/handler/screen/poster/requests', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post(URL)
      .field('requesterName', 'Jane Doe')
      .attach('file', PNG_BUFFER, { filename: 'poster.png' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 for an integration without the createPosterRequest endpoint', async () => {
    // ARRANGE
    const key = await createIntegrationKey(['addOrder']);

    // ACT
    const res = await testApp.unauthorizedAgent
      .post(URL)
      .set('X-API-Key', key)
      .field(baseFields)
      .attach('file', PNG_BUFFER, { filename: 'poster.png' });

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 403 for a logged in admin, as only integrations can submit requests', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post(URL)
      .field(baseFields)
      .attach('file', PNG_BUFFER, { filename: 'poster.png' });

    // ASSERT
    expectApiError(res, 403);
  });

  it('returns 200 with only the id and creation date, and stores the minimal request', async () => {
    // ACT
    const res = await submit();

    // ASSERT
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(['createdAt', 'id']);
    const request = await findRequest(res.body.id);
    expect(request).toMatchObject({
      requesterName: 'Jane Doe',
      requesterEmail: 'jane@example.com',
      requesterAssociation: null,
      message: null,
      name: 'Open Podium',
      type: 'img',
      footerSize: 'full',
      defaultTimeout: 15,
      borrelMode: false,
    });
  });

  it('stores every optional field, trimmed and with a normalized accent color', async () => {
    // ACT
    const res = await submit({
      requesterAssociation: ' GEWIS ',
      message: 'Please show this during the break.',
      label: 'Open Podium',
      startDate: '2026-10-05T10:00:00.000Z',
      expirationDate: '2026-10-12T22:00:00.000Z',
      accentColor: '#FFF200',
      footerSize: 'minimal',
      defaultTimeout: '20',
      borrelMode: 'true',
    });

    // ASSERT
    expect(res.status).toBe(200);
    const request = await findRequest(res.body.id);
    expect(request).toMatchObject({
      requesterAssociation: 'GEWIS',
      message: 'Please show this during the break.',
      label: 'Open Podium',
      accentColor: 'fff200',
      footerSize: 'minimal',
      defaultTimeout: 20,
      borrelMode: true,
    });
    expect(request!.startDate!.toISOString()).toBe('2026-10-05T10:00:00.000Z');
    expect(request!.expirationDate!.toISOString()).toBe('2026-10-12T22:00:00.000Z');
  });

  it('links the request to the submitting integration', async () => {
    // ACT
    const res = await submit();

    // ASSERT
    const request = await findRequest(res.body.id);
    expect(request!.integrationUser?.name).toBe('Test Integration');
  });

  it('stores the file in private storage, not under the public static directory', async () => {
    // ACT
    const res = await submit();

    // ASSERT
    const request = await findRequest(res.body.id);
    expect(request!.file.relativeDirectory).toMatch(/^private[\\/]poster-requests$/);
    expect(request!.file.originalName).toBe('poster.png');
  });

  it.each([
    ['a JPG', JPG_BUFFER, 'poster.jpg', 'img'],
    ['a PNG', PNG_BUFFER, 'poster.png', 'img'],
    ['an MP4', MP4_BUFFER, 'poster.mp4', 'video'],
  ])('accepts %s and derives the poster type', async (_, data, filename, type) => {
    // ACT
    const res = await submit({}, { data, filename });

    // ASSERT
    expect(res.status).toBe(200);
    expect((await findRequest(res.body.id))!.type).toBe(type);
  });

  it('notifies the backoffice without sending any request data', async () => {
    // ARRANGE
    const emit = vi.spyOn(EmitterStore.getInstance().backofficeSyncEmitter, 'emit');

    // ACT
    const res = await submit();

    // ASSERT
    expect(res.status).toBe(200);
    expect(emit).toHaveBeenCalledWith('poster_request_update');
  });

  it('returns 415 for a file type other than JPG, PNG or MP4', async () => {
    // ARRANGE
    const before = await getDataSource().getRepository(PosterRequest).count();

    // ACT
    const res = await submit({}, { data: GIF_BUFFER, filename: 'poster.gif' });

    // ASSERT
    expectApiError(res, 415);
    expect(await getDataSource().getRepository(PosterRequest).count()).toBe(before);
  });

  it('returns 415 when the content does not match the file extension', async () => {
    // ACT
    const res = await submit({}, { data: Buffer.from('not-an-image'), filename: 'poster.png' });

    // ASSERT
    expectApiError(res, 415);
  });

  it('returns 413 for a file larger than 20 MB', async () => {
    // ARRANGE
    const data = Buffer.concat([PNG_BUFFER, Buffer.alloc(MAX_UPLOAD_FILE_SIZE)]);

    // ACT
    const res = await submit({}, { data, filename: 'poster.png' });

    // ASSERT
    expectApiError(res, 413);
  });

  it('returns 400 without a file', async () => {
    // ACT
    const res = await submit({}, null);

    // ASSERT
    expect(res.status).toBe(400);
  });

  it.each(['requesterName', 'requesterEmail', 'name'])(
    'returns 400 without required field %s',
    async (field) => {
      // ARRANGE
      const req = testApp.unauthorizedAgent.post(URL).set('X-API-Key', integrationKey);
      Object.entries(baseFields)
        .filter(([key]) => key !== field)
        .forEach(([key, value]) => req.field(key, value));

      // ACT
      const res = await req.attach('file', PNG_BUFFER, { filename: 'poster.png' });

      // ASSERT
      expectValidationError(res);
    },
  );

  it.each([
    ['a blank required field', { name: '   ' }],
    ['an invalid email address', { requesterEmail: 'not-an-email' }],
    ['a name longer than 255 characters', { name: 'a'.repeat(256) }],
    ['a message longer than 5000 characters', { message: 'a'.repeat(5001) }],
    ['an invalid accent color', { accentColor: 'red' }],
    ['a timeout below 1 second', { defaultTimeout: '0' }],
    ['a fractional timeout', { defaultTimeout: '1.5' }],
    [
      'an expiration date before the start date',
      { startDate: '2026-10-12T00:00:00.000Z', expirationDate: '2026-10-05T00:00:00.000Z' },
    ],
  ])('returns 400 for %s', async (_, fields) => {
    // ACT
    const res = await submit(fields);

    // ASSERT
    expectApiError(res, 400);
  });

  it.each([
    ['an unknown footer size', { footerSize: 'huge' }],
    ['an invalid date', { startDate: 'tomorrow' }],
    ['a non-numeric timeout', { defaultTimeout: 'fifteen' }],
  ])('returns a validation error for %s', async (_, fields) => {
    // ACT
    const res = await submit(fields);

    // ASSERT
    expectValidationError(res);
  });
});

describe('GET /api/user/integration/endpoints', () => {
  it('includes createPosterRequest', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/user/integration/endpoints');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toContain('createPosterRequest');
  });
});
