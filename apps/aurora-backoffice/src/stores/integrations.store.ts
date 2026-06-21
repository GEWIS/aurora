import { defineStore } from 'pinia';
import {
  createIntegrationUser,
  deleteIntegrationUser,
  getAllIntegrationUsers,
  getIntegrationEndpoints,
  getIntegrationUserKey,
  type IntegrationUserCreateRequest,
  type IntegrationUserResponse,
  type IntegrationUserUpdateRequest,
  updateIntegrationUser,
} from '@/api';

export interface IntegrationUser extends IntegrationUserResponse {
  apiKey?: string;
}

interface IntegrationsStore {
  integrationUsers: IntegrationUser[];
  integrationEndpoints: string[];
  loading: boolean;
}

export const useIntegrationsStore = defineStore('integration-users', {
  state: (): IntegrationsStore => ({
    integrationUsers: [],
    integrationEndpoints: [],
    loading: true,
  }),
  actions: {
    async init(): Promise<void> {
      const res = await getAllIntegrationUsers();
      if (res.response.ok && res.data) {
        this.integrationUsers = res.data;
      }
      const res2 = await getIntegrationEndpoints();
      if (res2.response.ok && res2.data) {
        this.integrationEndpoints = res2.data;
      }
      this.loading = false;
    },
    async createUser(params: IntegrationUserCreateRequest): Promise<void> {
      const res = await createIntegrationUser({ body: params });
      if (res.response.ok && res.data) {
        this.integrationUsers.push(res.data);
      }
    },
    async updateUser(id: number, params: IntegrationUserUpdateRequest): Promise<void> {
      const res = await updateIntegrationUser({ path: { id }, body: params });
      if (res.response.ok && res.data) {
        const index = this.integrationUsers.findIndex((u) => u.id === id);
        if (index >= 0) {
          this.integrationUsers.splice(index, 1, res.data);
        }
      }
    },
    async deleteUser(id: number): Promise<void> {
      const res = await deleteIntegrationUser({ path: { id } });
      if (res.response.ok) {
        const index = this.integrationUsers.findIndex((u) => u.id === id);
        if (index >= 0) {
          this.integrationUsers.splice(index, 1);
        }
      }
    },
    async showApiKey(id: number): Promise<void> {
      const res = await getIntegrationUserKey({ path: { id } });
      if (res.response.ok && res.data) {
        const index = this.integrationUsers.findIndex((u) => u.id === id);
        if (index >= 0) {
          this.integrationUsers[index].apiKey = res.data;
        }
      }
    },
    hideApiKey(id: number): void {
      const index = this.integrationUsers.findIndex((u) => u.id === id);
      if (index >= 0) {
        this.integrationUsers[index].apiKey = undefined;
      }
    },
  },
});
