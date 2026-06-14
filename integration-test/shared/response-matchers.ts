import { expect } from 'vitest';
import supertest from 'supertest';

/**
 * Assert a ValidateError-shaped response from tsoa.
 * Status is always 400. Body is { message: 'Bad Request', details?: { field: { message, value } } }
 */
export function expectValidationError(res: supertest.Response, expectedStatus = 400): void {
  expect(res.status).toBe(expectedStatus);
  expect(res.body).toHaveProperty('message', 'Bad Request');
  if (res.body.details) {
    expect(typeof res.body.details).toBe('object');
  }
}

/**
 * Assert an HttpApiException-shaped response (401, 403, 404, etc.).
 * Body is { name: string, message: string, status: number, statusCode?: number }
 */
export function expectApiError(res: supertest.Response, status: number): void {
  expect(res.status).toBe(status);
  expect(res.body).toHaveProperty('name');
  expect(res.body).toHaveProperty('message');
  expect(res.body).toHaveProperty('status', status);
}

/**
 * Assert a 409 FeatureDisabled response (bare string, not JSON).
 */
export function expectFeatureDisabled(res: supertest.Response): void {
  expect(res.status).toBe(409);
  expect(res.text).toBe('Not enabled');
}
