import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import AppLayout from '@/layout/AppLayout.vue';
import { useLayoutStore } from '@/stores/layout.store';
import { type ISecurityGroups, type ISecuritySections, SecurityGroup } from '@/api';

interface SecurityRole {
  securityGroup: keyof ISecurityGroups;
  securitySection: keyof ISecuritySections;
}

declare module 'vue-router' {
  interface RouteMeta {
    security: SecurityRole | SecurityRole[];
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      children: [
        {
          path: '/auth',
          name: 'auth',
          component: () => import('@/views/Base/AuthView.vue'),
          children: [
            {
              path: 'callback',
              component: () => import('@/views/Base/AuthView.vue'),
              name: 'authCallback',
            },
          ],
        },
        {
          path: '/unauthorized',
          component: () => import('@/views/Base/UnauthorizedView.vue'),
          name: 'unauthorized',
        },
        {
          path: '/error',
          component: () => import('@/views/Base/InternalErrorView.vue'),
          name: 'error',
        },
      ],
    },
    {
      path: '',
      component: AppLayout,
      children: [
        {
          path: '',
          component: () => import('@/views/Base/DashboardView.vue'),
          name: 'dashboard',
        },
        {
          path: '/poster',
          children: [
            {
              path: 'posters',
              component: () => import('@/views/Poster/PosterView.vue'),
              name: 'posters',
            },
          ],
          meta: {
            security: {
              securityGroup: 'poster',
              securitySection: 'base',
            },
          },
        },
        {
          path: '/modes',
          children: [
            {
              path: 'centurion',
              component: () => import('@/views/Modes/CenturionModeView.vue'),
              name: 'centurionMode',
              meta: {
                security: {
                  securityGroup: 'centurion',
                  securitySection: 'privileged',
                },
              },
            },
            {
              path: 'timeTrailRace',
              component: () => import('@/views/Modes/TimeTrailRaceModeView.vue'),
              name: 'timeTrailRaceMode',
              meta: {
                security: {
                  securityGroup: 'timetrail',
                  securitySection: 'base',
                },
              },
            },
          ],
        },
        {
          path: '/lights',
          children: [
            {
              path: 'effects',
              component: () => import('@/views/Lights/EffectsController.vue'),
              name: 'lightEffects',
              meta: {
                security: {
                  securityGroup: 'effects',
                  securitySection: 'base',
                },
              },
            },
            {
              path: 'scenesController',
              component: () => import('@/views/Lights/ScenesController.vue'),
              name: 'lightsScenesController',
              meta: {
                security: {
                  securityGroup: 'scenes',
                  securitySection: 'base',
                },
              },
            },
            {
              path: 'fixtures',
              component: () => import('@/views/Lights/FixtureOverview.vue'),
              name: 'fixturesOverview',
              meta: {
                security: {
                  securityGroup: 'handler',
                  securitySection: 'base',
                },
              },
            },
          ],
        },
        {
          path: '/settings',
          component: () => import('@/views/Base/ServerSettingsView.vue'),
          name: 'ServerSettings',
          meta: {
            security: {
              securityGroup: 'serverSettings',
              securitySection: 'privileged',
            },
          },
        },
        {
          path: '/timed-events',
          component: () => import('@/views/Base/TimedEventsView.vue'),
          name: 'TimedEvents',
          meta: {
            security: {
              securityGroup: 'timedEvents',
              securitySection: 'privileged',
            },
          },
        },
        {
          path: '/music',
          component: () => import('@/views/Base/MusicSettingsView.vue'),
          name: 'MusicSettings',
          meta: {
            security: [
              {
                securityGroup: 'spotify',
                securitySection: 'privileged',
              },
              {
                securityGroup: 'beats',
                securitySection: 'privileged',
              },
            ],
          },
          children: [
            {
              path: 'spotify',
              children: [
                {
                  path: 'callback',
                  component: () => import('@/views/Base/MusicSettingsView.vue'),
                  name: 'SpotifyLoginCallback',
                },
              ],
            },
          ],
        },
        {
          path: '/integrations',
          component: () => import('@/views/Base/IntegrationsView.vue'),
          name: 'Integrations',
          meta: {
            security: {
              securityGroup: 'integrationUsers',
              securitySection: 'privileged',
            },
          },
        },
        {
          path: '/audit',
          component: () => import('@/views/Audit/AuditLogsView.vue'),
          name: 'AuditLogs',
          meta: {
            security: {
              securityGroup: 'audit',
              securitySection: 'base',
            },
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/Base/NotFoundView.vue'),
      name: 'notFound',
    },
  ],
});

router.beforeEach(async (to) => {
  const layoutStore = useLayoutStore();
  layoutStore.init();

  const authStore = useAuthStore();
  let authenticated = authStore.isAuthenticated();

  // Automatically login using mock when in development mode
  if (import.meta.env.VITE_NODE_ENV === 'development' && !authenticated) {
    console.info('Backoffice is in development mode: mocking auth...');
    await authStore.MockLogin({
      id: 'dev',
      name: 'dev',
      roles: [SecurityGroup.ADMIN],
    });
  }

  // Check if user still has valid cookies - ignore if specific request to /auth
  if (!authenticated && !to.path.startsWith('/auth')) {
    authenticated = await authStore.init();
  }

  // Getting whether authenticated and has rights to access the route
  // Only necessary if the user is authenticated
  let hasRights = true;
  if (authenticated) {
    if (to.meta.security && Array.isArray(to.meta.security)) {
      // If the security metadata is an array, the user needs to have one of the roles
      hasRights = to.meta.security.some(({ securityGroup, securitySection }) =>
        authStore.isInSecurityGroup(securityGroup, securitySection),
      );
    } else if (to.meta.security) {
      hasRights = authStore.isInSecurityGroup(to.meta.security.securityGroup, to.meta.security.securitySection);
    }
  }

  if (!authenticated && !to.path.startsWith('/auth')) {
    // If not authenticated; redirect to login
    return { name: 'auth', query: { path: to.fullPath } };
  } else if (authenticated && !hasRights) {
    // If authenticated, but does not have rights to access the route
    return { name: 'unauthorized' };
  }
});

export default router;
