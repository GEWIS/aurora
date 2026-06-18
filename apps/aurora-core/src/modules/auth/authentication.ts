import * as express from 'express';
import { HttpApiException, HttpStatusCode } from '../../helpers/custom-error';
import { AuthUser } from './auth-user';
import { SecurityGroup } from '../../helpers/security';

/**
 * Express middleware to authenticate the user
 * @param request - The request object
 * @param securityName - The name of the security scheme
 * @param scopes - The required scopes
 * @returns The authenticated user
 */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes: string[] = [],
): Promise<AuthUser> {
  if (securityName === 'local') {
    if (!request.isAuthenticated() || request.user === undefined) {
      throw new HttpApiException(HttpStatusCode.Unauthorized, 'You are not logged in.');
    }
    // Everyone can access, but needs at least one role
    if (scopes.includes('*') && request.user.roles.length > 0) {
      return request.user;
    }
    // Should have one overlapping role/scope
    if (scopes.some((scope) => request.user!.roles.includes(scope as SecurityGroup))) {
      return request.user;
    }

    throw new HttpApiException(HttpStatusCode.Forbidden);
  } else if (securityName === 'integration') {
    if (!request.isAuthenticated() || !request.user) {
      throw new HttpApiException(HttpStatusCode.Unauthorized, 'You are not logged in.');
    }

    // User should be an integration user and should have endpoints assigned
    if (request.user.integrationUserId === undefined || !request.user.endpoints) {
      throw new HttpApiException(HttpStatusCode.Forbidden);
    }

    // Should have one overlapping scope
    if (scopes.some((scope) => request.user!.endpoints!.includes(scope))) {
      return request.user;
    }

    throw new HttpApiException(HttpStatusCode.Forbidden);
  }
  throw new HttpApiException(HttpStatusCode.InternalServerError, 'Unknown security scheme.');
}
