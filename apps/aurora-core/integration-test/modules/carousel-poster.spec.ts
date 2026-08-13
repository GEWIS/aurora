import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import { TestEnvironment, type TestApp } from '../shared/test-app';
import { expectApiError, expectValidationError } from '../shared/response-matchers';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await TestEnvironment.getInstance().getTestApp();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Creates a poster through the API and returns its id.
 */
async function createPoster(): Promise<number> {
  const res = await testApp.authorizedAgent.post('/api/handler/screen/poster/items').send({
    name: 'Carousel Test Poster',
    type: 'img',
    footerSize: 'full',
    defaultTimeout: 15,
    borrelMode: false,
  });
  expect(res.status).toBe(200);
  return res.body.id as number;
}

describe('GET /api/handler/screen/poster/carousel', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/carousel');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (empty posters, borrel mode off)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ posters: [], borrelMode: false });
  });
});

describe('GET /api/handler/screen/poster/carousel/order', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/carousel/order');

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with an empty array when no order is set', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel/order');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('PUT /api/handler/screen/poster/carousel/order', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/handler/screen/poster/carousel/order')
      .send({ posterIds: [] });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 400 when posterIds is not an array', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/carousel/order')
      .send({ posterIds: 'not-an-array' });

    // ASSERT
    expectValidationError(res);
  });

  it('returns 204 with an empty order', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/carousel/order')
      .send({ posterIds: [] });

    // ASSERT
    expect(res.status).toBe(204);
  });

  it('returns 204 and persists the given order', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/carousel/order')
      .send({ posterIds: [id] });

    // ASSERT
    expect(res.status).toBe(204);

    const order = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel/order');
    expect(order.body).toEqual([id]);
  });
});

describe('POST /api/handler/screen/poster/carousel/{id}/enabled', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/carousel/1/enabled')
      .send({ enabled: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 404 when the poster does not exist', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/carousel/999999/enabled')
      .send({ enabled: true });

    // ASSERT
    expectApiError(res, 404);
  });

  it('returns 200 and toggles the enabled state of an existing poster', async () => {
    // ARRANGE
    const id = await createPoster();

    // ACT
    const res = await testApp.authorizedAgent
      .post(`/api/handler/screen/poster/carousel/${id}/enabled`)
      .send({ enabled: false });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.enabled).toBe(false);
  });
});

describe('POST /api/handler/screen/poster/carousel/force-update', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.post(
      '/api/handler/screen/poster/carousel/force-update',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 when authenticated', async () => {
    // ACT
    const res = await testApp.authorizedAgent.post(
      '/api/handler/screen/poster/carousel/force-update',
    );

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('GET /api/handler/screen/poster/carousel/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/borrel-mode',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth (borrel mode inactive but feature present)', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/borrel-mode',
    );

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ present: true, enabled: false });
  });
});

describe('PUT /api/handler/screen/poster/carousel/borrel-mode', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .put('/api/handler/screen/poster/carousel/borrel-mode')
      .send({ enabled: true });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 204 with admin auth and valid body', async () => {
    // ACT
    const res = await testApp.authorizedAgent
      .put('/api/handler/screen/poster/carousel/borrel-mode')
      .send({ enabled: true });

    // ASSERT
    expect(res.status).toBe(204);
  });
});

describe('GET /api/handler/screen/poster/carousel/train-departures', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/train-departures',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 500 when NS API is not configured', async () => {
    // ARRANGE — force the "not configured" path regardless of the ambient env.
    const previousKey = process.env.NS_KEY;
    delete process.env.NS_KEY;

    try {
      // ACT
      const res = await testApp.authorizedAgent.get(
        '/api/handler/screen/poster/carousel/train-departures',
      );

      // ASSERT
      expect(res.status).toBe(500);
    } finally {
      if (previousKey === undefined) delete process.env.NS_KEY;
      else process.env.NS_KEY = previousKey;
    }
  });
});

describe('POST /api/handler/screen/poster/carousel/photo', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent
      .post('/api/handler/screen/poster/carousel/photo')
      .send({ imageUrl: 'https://example.com/img.jpg' });

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 403 when GEWIS API rejects unauthenticated request', async () => {
    // ARRANGE
    const rejection = new AxiosError('Forbidden');
    rejection.response = { status: 403, statusText: 'Forbidden' } as AxiosResponse;
    const axiosSpy = vi.spyOn(axios, 'get').mockRejectedValue(rejection);

    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/carousel/photo')
      .send({ albumIds: [1] });

    // ASSERT
    expect(res.status).toBe(403);
    axiosSpy.mockRestore();
  });

  it('returns a poster URL served by aurora, not by GEWIS', async () => {
    // ARRANGE
    const axiosSpy = vi.spyOn(axios, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/photos?page=')) return { data: { data: [{ id: 42 }] } } as AxiosResponse;
      return { data: { data: { name: 'Bata 2025' } } } as AxiosResponse;
    });

    // ACT
    const res = await testApp.authorizedAgent
      .post('/api/handler/screen/poster/carousel/photo')
      .send({ albumIds: [7] });

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body.label).toBe('Bata 2025');
    expect(res.body.url).toBe('/api/handler/screen/poster/carousel/photo/42');
    axiosSpy.mockRestore();
  });
});

describe('GET /api/handler/screen/poster/carousel/photo/{photoId}', () => {
  const rendition = Buffer.from('webp-bytes');

  function renditionResponse(): AxiosResponse {
    return { data: rendition, headers: { 'content-type': 'image/webp' } } as AxiosResponse;
  }

  function renditionPending(): AxiosError {
    const rejection = new AxiosError('Service Unavailable');
    rejection.response = {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'retry-after': '1' },
    } as unknown as AxiosResponse;
    return rejection;
  }

  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get('/api/handler/screen/poster/carousel/photo/42');

    // ASSERT
    expectApiError(res, 401);
  });

  it('serves the rendition of the requested photo', async () => {
    // ARRANGE
    const axiosSpy = vi.spyOn(axios, 'get').mockResolvedValue(renditionResponse());

    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel/photo/42');

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/webp');
    expect(Buffer.from(res.body)).toEqual(rendition);
    expect(axiosSpy.mock.calls.map((call) => call[0])).toEqual([
      'https://gewis.nl/api/photos/42/image/w1920',
    ]);
    axiosSpy.mockRestore();
  });

  it('retries the same photo until the rendition is generated', async () => {
    // ARRANGE
    const axiosSpy = vi
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(renditionPending())
      .mockResolvedValueOnce(renditionResponse());

    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel/photo/42');

    // ASSERT
    expect(res.status).toBe(200);
    expect(Buffer.from(res.body)).toEqual(rendition);
    expect(axiosSpy.mock.calls.map((call) => call[0])).toEqual([
      'https://gewis.nl/api/photos/42/image/w1920',
      'https://gewis.nl/api/photos/42/image/w1920',
    ]);
    axiosSpy.mockRestore();
  });

  it('returns 503 when the rendition is never generated', async () => {
    // ARRANGE
    const axiosSpy = vi.spyOn(axios, 'get').mockRejectedValue(renditionPending());

    // ACT
    const res = await testApp.authorizedAgent.get('/api/handler/screen/poster/carousel/photo/42');

    // ASSERT
    expect(res.status).toBe(503);
    expect(axiosSpy).toHaveBeenCalledTimes(3);
    axiosSpy.mockRestore();
  });
});

describe('GET /api/handler/screen/poster/carousel/olympics/medal-table', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/medal-table',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and medal table data', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/medal-table',
    );

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('GET /api/handler/screen/poster/carousel/olympics/country-medals', () => {
  it('returns 401 without auth', async () => {
    // ACT
    const res = await testApp.unauthorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/country-medals',
    );

    // ASSERT
    expectApiError(res, 401);
  });

  it('returns 200 with admin auth and Dutch medals data', async () => {
    // ACT
    const res = await testApp.authorizedAgent.get(
      '/api/handler/screen/poster/carousel/olympics/country-medals',
    );

    // ASSERT
    expect(res.status).toBe(200);
  });
});
