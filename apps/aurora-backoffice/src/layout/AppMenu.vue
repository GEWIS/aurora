<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem :index="i" :item="item" />
    </template>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useServerSettingsStore } from '@/stores/server-settings.store';

const authStore = useAuthStore();
const settingsStore = useServerSettingsStore();

// Calculate all items in the menu based on the user's security groups
const model = computed<MenuItem[]>(() => {
  const showPosters =
    authStore.isInSecurityGroup('poster', 'base') && settingsStore.featureEnabled('Poster');
  const showAudit = authStore.isInSecurityGroup('audit', 'base');
  const showCenturion =
    authStore.isInSecurityGroup('centurion', 'privileged') &&
    settingsStore.featureEnabled('Centurion');
  const showTimeTrail =
    authStore.isInSecurityGroup('timetrail', 'base') &&
    settingsStore.featureEnabled('TimeTrailRace');

  const showEffects = authStore.isInSecurityGroup('effects', 'base');
  const showScenes = authStore.isInSecurityGroup('scenes', 'base');
  const showFixtures = authStore.isInSecurityGroup('handler', 'base');

  const showSettings = authStore.isInSecurityGroup('serverSettings', 'privileged');
  const showTimedEvents = authStore.isInSecurityGroup('timedEvents', 'privileged');
  const showSpotifySettings = authStore.isInSecurityGroup('spotify', 'privileged');
  const showBeatSettings = authStore.isInSecurityGroup('beats', 'privileged');
  const showIntegrationUsers = authStore.isInSecurityGroup('integrationUsers', 'privileged');

  return [
    {
      label: 'Home',
      items: [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
        showAudit && { label: 'Logs', icon: 'pi pi-fw pi-book', to: '/audit' },
      ].filter(Boolean),
    },
    showPosters && {
      label: 'Screens',
      items: [{ label: 'Posters', icon: 'pi pi-fw pi-image', to: '/poster/posters' }],
    },
    {
      label: 'Lights',
      items: [
        showEffects && { label: 'Effects', icon: 'pi pi-fw pi-sparkles', to: '/lights/effects' },
        showScenes && {
          label: 'Scenes',
          icon: 'pi pi-fw pi-sliders-h',
          to: '/lights/scenesController',
        },
        showFixtures && { label: 'Fixtures', icon: 'pi pi-fw pi-bolt', to: '/lights/fixtures' },
      ].filter(Boolean),
    },
    (showCenturion || showTimeTrail) && {
      label: 'Modes',
      items: [
        showTimeTrail && {
          label: 'Spoelbakkenrace',
          icon: 'pi pi-fw pi-hourglass',
          to: '/modes/timetrailrace',
        },
        showCenturion && { label: 'Centurion', icon: 'pi pi-fw pi-crown', to: '/modes/centurion' },
      ].filter(Boolean),
    },
    (showSettings || showTimedEvents || showSpotifySettings || showIntegrationUsers) && {
      label: 'Settings',
      items: [
        showSettings && { label: 'Server Settings', icon: 'pi pi-fw pi-cog', to: '/settings' },
        showTimedEvents && {
          label: 'Timed Events',
          icon: 'pi pi-fw pi-calendar-clock',
          to: '/timed-events',
        },
        (showSpotifySettings || showBeatSettings) && {
          label: 'Music Settings',
          icon: 'pi pi-headphones',
          to: '/music',
        },
        showIntegrationUsers && {
          label: 'Integrations',
          icon: 'pi pi-share-alt',
          to: '/integrations',
        },
      ],
    },
  ].filter(Boolean) as MenuItem[];
});
</script>
