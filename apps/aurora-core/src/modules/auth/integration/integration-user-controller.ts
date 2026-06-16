import { Controller, Patch } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Route, Tags } from 'tsoa';
import { Security } from '../index';
import { SecurityNames } from '../../../helpers/security';
import { securityGroups } from '../../../helpers/security-groups';
import IntegrationUserService, {
  IntegrationUserCreateRequest,
  IntegrationUserResponse,
  IntegrationUserUpdateRequest,
} from './integration-user-service';
import AuthService from '../auth-service';

@Tags('User')
@Route('user/integration')
export class IntegrationUserController extends Controller {
  /**
   * Get a list of all endpoints that an integration user could access.
   */
  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Get('endpoints')
  public getIntegrationEndpoints(): string[] {
    const service = new IntegrationUserService();
    return service.getIntegrationEndpoints();
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Get('')
  public async getAllIntegrationUsers(): Promise<IntegrationUserResponse[]> {
    const service = new IntegrationUserService();
    const users = await service.getAllIntegrationUsers();
    return users.map((u) => service.asResponse(u));
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Get('{id}')
  public async getSingleIntegrationUser(id: number): Promise<IntegrationUserResponse> {
    const service = new IntegrationUserService();
    const user = await service.getSingleIntegrationUser(id);
    return service.asResponse(user);
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Get('{id}/key')
  public async getIntegrationUserKey(id: number): Promise<string> {
    const integrationService = new IntegrationUserService();
    const user = await integrationService.getSingleIntegrationUser(id);

    const authService = new AuthService();
    let key = await authService.getIntegrationUserApiKey(user);
    if (!key) {
      // Somehow the key does not exist, so let's create one.
      key = await authService.createApiKey({ integrationUser: user });
    }
    return key.key;
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Post('')
  public async createIntegrationUser(
    @Body() body: IntegrationUserCreateRequest,
  ): Promise<IntegrationUserResponse> {
    const service = new IntegrationUserService();
    service.validateEndpoints(body.endpoints);
    const user = await service.createIntegrationUser(body);
    return service.asResponse(user);
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Patch('{id}')
  public async updateIntegrationUser(
    id: number,
    @Body() body: IntegrationUserUpdateRequest,
  ): Promise<IntegrationUserResponse> {
    const service = new IntegrationUserService();
    if (body.endpoints) {
      service.validateEndpoints(body.endpoints);
    }
    const user = await service.updateIntegrationUser(id, body);
    return service.asResponse(user);
  }

  @Security(SecurityNames.LOCAL, securityGroups.integrationUsers.privileged)
  @Delete('{id}')
  public async deleteIntegrationUser(id: number): Promise<void> {
    const service = new IntegrationUserService();
    await service.getSingleIntegrationUser(id);
    await service.deleteIntegrationUser(id);
  }
}
