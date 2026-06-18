import { Repository } from 'typeorm';
import IntegrationUser from './entities/integration-user';
import dataSource from '../../../database';
import { HttpApiException } from '../../../helpers/custom-error';
import { HttpStatusCode } from 'axios';
import IntegrationEndpointManager from './integration-endpoint-manager';
import AuthService from '../auth-service';

export interface IntegrationUserResponse extends Pick<
  IntegrationUser,
  'id' | 'name' | 'endpoints'
> {
  lastSeen: string | null;
}

export interface IntegrationUserCreateRequest extends Pick<IntegrationUser, 'name' | 'endpoints'> {}

export interface IntegrationUserUpdateRequest extends Partial<IntegrationUserCreateRequest> {}

export default class IntegrationUserService {
  private repo: Repository<IntegrationUser>;

  constructor(repo?: Repository<IntegrationUser>) {
    this.repo = repo ?? dataSource.getRepository(IntegrationUser);
  }

  public static asResponse(user: IntegrationUser): IntegrationUserResponse {
    return {
      id: user.id,
      name: user.name,
      endpoints: user.endpoints,
      lastSeen: user.lastSeen?.toISOString() ?? null,
    };
  }

  public asResponse(user: IntegrationUser): IntegrationUserResponse {
    return IntegrationUserService.asResponse(user);
  }

  public async getAllIntegrationUsers(): Promise<IntegrationUser[]> {
    return this.repo.find();
  }

  public async getSingleIntegrationUser(id: number): Promise<IntegrationUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new HttpApiException(
        HttpStatusCode.NotFound,
        `Integration user with ID "${id}" not found.`,
      );
    }
    return user;
  }

  public async createIntegrationUser(
    params: IntegrationUserCreateRequest,
  ): Promise<IntegrationUser> {
    const integrationUser = await this.repo.save(params);
    const apiService = new AuthService();
    await apiService.createApiKey({ integrationUser });
    return integrationUser;
  }

  public async updateIntegrationUser(
    id: number,
    params: IntegrationUserUpdateRequest,
  ): Promise<IntegrationUser> {
    const user = await this.getSingleIntegrationUser(id);

    if (params.name != undefined) {
      user.name = params.name;
    }
    if (params.endpoints != undefined) {
      user.endpoints = params.endpoints;
    }

    return this.repo.save(user);
  }

  public async deleteIntegrationUser(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Get a list of all endpoints that can be used by integration users
   */
  public getIntegrationEndpoints(): string[] {
    const manager = IntegrationEndpointManager.getInstance();
    return manager.getIntegrationMethods();
  }

  /**
   * Throw an HttpApiException if the given list of endpoints contains names that are not
   * registered as integration endpoints.
   * @param endpoints
   * @throws HttpApiException list of endpoints contains invalid endpoints
   */
  public validateEndpoints(endpoints: string[]): void {
    const integrationEndpoints = this.getIntegrationEndpoints();
    const invalid = endpoints.filter((e) => {
      // Element should only be returned if it is not in the integration methods
      return !integrationEndpoints.includes(e);
    });
    if (invalid.length > 0) {
      throw new HttpApiException(
        HttpStatusCode.BadRequest,
        `Invalid endpoints: [${invalid.join(', ')}]`,
      );
    }
  }
}
