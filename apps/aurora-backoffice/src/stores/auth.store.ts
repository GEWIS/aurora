import { defineStore } from 'pinia';
import _ from 'lodash';
import { useHandlersStore } from '@/stores/handlers.store';
import { useColorStore } from '@/stores/color.store';
import { useSocketStore } from '@/stores/socket.store';
import { useSubscriberStore } from '@/stores/subscriber.store';
import { useStatusStore } from '@/stores/status.store';
import {
  authMock,
  authOidc,
  type AuthUser,
  getInformation,
  getSecurityGroups,
  type ISecurityGroups,
  type ISecuritySections,
  type OidcParameters,
  SecurityGroup,
} from '@/api';
import { useSceneControllerStore } from '@/stores/scene-controller.store';
import { useAuditStore } from '@/stores/audit.store';
import { useServerSettingsStore } from '@/stores/server-settings.store';

/**
 * Auth store
 * @param name - The name of the user
 * @param roles - The roles of the user
 * @param development - Whether in development mode
 * @param securityGroups - The security groups
 */
interface AuthStore {
  name: string | null;
  roles: SecurityGroup[];
  securityGroups?: ISecurityGroups;
  authenticating: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStore => ({
    name: null,
    roles: [],
    securityGroups: undefined,
    authenticating: false,
  }),
  getters: {
    getName: (state) => state.name,
    getRoles: (state) => state.roles,
    getSecurityGroups: (state) => state.securityGroups,
    getAuthenticating: (state) => state.authenticating,
  },
  actions: {
    /**
     * Initialize the store
     */
    async init(): Promise<boolean> {
      this.authenticating = true;
      const user = await getInformation();
      if (!user.data) {
        this.authenticating = false;
        return false;
      }

      const securityGroups = await getSecurityGroups();
      if (!securityGroups.data) {
        this.authenticating = false;
        return false;
      }

      this.name = user.data.name;
      this.roles = user.data.roles;
      this.securityGroups = securityGroups.data;
      this.authenticating = false;

      await this.initStores();
      return true;
    },
    /**
     * Login a user using OIDC
     * @param oidcParameters - The OIDC parameters
     */
    async OIDCLogin(oidcParameters: OidcParameters): Promise<boolean> {
      this.authenticating = true;
      const user = await authOidc({
        body: oidcParameters,
      });

      if (!user.data) {
        this.authenticating = false;
        return false;
      }

      const securityGroups = await getSecurityGroups();
      if (!securityGroups.data) {
        this.authenticating = false;
        return false;
      }

      this.name = user.data.name;
      this.roles = user.data.roles;
      this.securityGroups = securityGroups.data;
      this.authenticating = false;

      await this.initStores();
      return true;
    },
    /**
     * Login a user using any possible data
     * @param authUser
     */
    async MockLogin(authUser: AuthUser): Promise<boolean> {
      this.authenticating = true;
      const user = await authMock({
        body: authUser,
      });

      const securityGroups = await getSecurityGroups();
      this.authenticating = false;
      if (!user.data || !securityGroups.data) return false;

      this.name = user.data.name;
      this.roles = user.data.roles;
      this.securityGroups = securityGroups.data;

      await this.initStores();
      return true;
    },
    /**
     * Initialize the stores -- only those which the user has access to
     */
    async initStores(): Promise<void> {
      await useServerSettingsStore().initFeatureFlags();
      await useSocketStore().connect();
      if (this.isInSecurityGroup('serverSettings', 'privileged')) {
        await useServerSettingsStore().initSettings();
      }
      if (this.isInSecurityGroup('handler', 'base')) {
        await useHandlersStore().init();
      }
      if (this.isInSecurityGroup('light', 'base')) {
        await useColorStore().init();
      }
      if (
        this.isInSecurityGroup('audio', 'base') &&
        this.isInSecurityGroup('light', 'base') &&
        this.isInSecurityGroup('screen', 'base')
      ) {
        await useSubscriberStore().init();
        useStatusStore().init();
      }
      if (this.isInSecurityGroup('scenes', 'base')) {
        await useSceneControllerStore().init();
      }
      if (this.isInSecurityGroup('audit', 'base')) {
        await useAuditStore().init();
      }
    },
    /**
     * Check if the user is authenticated
     */
    isAuthenticated(): boolean {
      return this.name !== undefined && this.roles.length > 0;
    },
    /**
     * Check if the user is in a security group
     * @param group - The endpoint for the security
     * @param section - The security group to check for
     */
    isInSecurityGroup(group: keyof ISecurityGroups, section: keyof ISecuritySections): boolean {
      if (!this.securityGroups) return false;
      return _.intersection(this.roles, this.securityGroups[group][section]).length > 0;
    },
  },
});
