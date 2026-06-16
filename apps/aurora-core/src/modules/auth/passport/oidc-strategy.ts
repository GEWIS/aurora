import { jwtDecode } from 'jwt-decode';
import { Request as ExRequest, Response as ExResponse } from 'express';
import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { HttpApiException, HttpStatusCode } from '../../../helpers/custom-error';
import logger from '../../../logger';
import { parseRoles } from '../../../helpers/security';
import AuthService, { OidcConfig } from '../auth-service';

export interface AuthStoreToken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  nonce: string;
  session_state: string;
  at_hash: string;
  sid: string;
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  roles?: string[];
  preferred_username: string;
  given_name: string;
}

enum OidcProviders {
  KEYCLOAK = 'KEYCLOAK',
  ENTRA_ID = 'ENTRA_ID',
}

passport.use(
  'oidc',
  new CustomStrategy(async (req, callback) => {
    if (!req.body.state || !req.body.session_state || !req.body.code) {
      logger.error('Missing OIDC state, session state or code.');
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }

    if (
      !process.env.OIDC_PROVIDER ||
      !process.env.OIDC_CONFIG ||
      !process.env.OIDC_CLIENT_ID ||
      !process.env.OIDC_CLIENT_SECRET ||
      !process.env.OIDC_REDIRECT_URI
    ) {
      logger.error('Not all OIDC environment variables are properly defined');
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }

    if (!Object.values(OidcProviders).includes(process.env.OIDC_PROVIDER as OidcProviders)) {
      logger.error(
        'The environment variable OIDC_PROVIDER is not a valid OIDC provider. Options are ' +
          Object.values(OidcProviders).join('; '),
      );
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }

    let oidcConfig: OidcConfig;

    try {
      oidcConfig = await new AuthService().getOIDCConfig();
    } catch (e) {
      logger.error(e);
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }

    if (!oidcConfig) {
      logger.error('Failed to fetch the OIDC configuration endpoint.');
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }

    const oidcResponse = await fetch(oidcConfig.token_endpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
        redirect_uri: process.env.OIDC_REDIRECT_URI,
        code: req.body.code,
        scope: 'openid profile user.read',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    try {
      const oidcData = await oidcResponse.json();

      const tokenDetails = jwtDecode<AuthStoreToken>(oidcData!.id_token);
      let oidcRoles: string[] | undefined;

      switch (process.env.OIDC_PROVIDER) {
        case OidcProviders.KEYCLOAK: {
          oidcRoles = tokenDetails.resource_access
            ? tokenDetails.resource_access[process.env.OIDC_CLIENT_ID || ''].roles
            : [];
          break;
        }
        case OidcProviders.ENTRA_ID: {
          oidcRoles = tokenDetails.roles || [];
          break;
        }
      }

      const securityRoles = parseRoles(oidcRoles!);

      if (securityRoles.length === 0) {
        callback(null, false);
        return;
      } else {
        callback(null, {
          id: tokenDetails.preferred_username,
          name: tokenDetails.given_name,
          roles: securityRoles,
        });
        return;
      }
    } catch (e) {
      logger.error(e);
      callback(new HttpApiException(HttpStatusCode.InternalServerError));
      return;
    }
  }),
);
