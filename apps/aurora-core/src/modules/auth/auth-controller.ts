import { Controller } from '@tsoa/runtime';
import { Get, Route, Tags } from 'tsoa';
import AuthService from './auth-service';
import { ISecurityGroups, typedSecurityGroups } from '../../helpers/security-groups';
import { HttpApiException, HttpStatusCode } from '../../helpers/custom-error';

/**
 * The OidcConfig contains the details needed to authenticate with keycloak
 * These variables are based on the environment variables, and might differ
 * from system to system.
 */
interface OidcConfig {
  /**
   * The client id of the keycloak application
   */
  clientId: string;
  /**
   * The redirect uri of the keycloak application
   */
  redirectUri: string;
  /**
   * The auth url of the keycloak application
   */
  authUrl: string;
}

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  /**
   * Returns the oidc parameters
   */
  @Get('oidc')
  public async getOidcParameters(): Promise<OidcConfig> {
    let oidcConfig;

    try {
      oidcConfig = await new AuthService().getOIDCConfig();
    } catch (e) {
      throw new HttpApiException(
        HttpStatusCode.InternalServerError,
        'Cannot get OIDC configuration.',
      );
    }

    return {
      clientId: process.env.OIDC_CLIENT_ID || '',
      redirectUri: process.env.OIDC_REDIRECT_URI || '',
      authUrl: oidcConfig.authorization_endpoint || '',
    };
  }

  /**
   * Returns the security groups
   */
  @Get('groups')
  public getSecurityGroups(): ISecurityGroups {
    return typedSecurityGroups;
  }
}
