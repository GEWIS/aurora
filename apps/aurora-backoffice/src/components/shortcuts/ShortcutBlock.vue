<template>
  <AppContainer icon="pi-file-import" title="Shortcuts">
    <div v-if="menus.length > 0" class="columns-1 sm:columns-2">
      <div v-for="items in menus" :key="items[0].key" class="break-inside-avoid">
        <Menu class="!border-none" :model="items">
          <template #submenuheader="{ item }">
            <h6 class="mb-0 text-override">
              {{ item.label }}
            </h6>
          </template>
          <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
              <a :href="href" v-bind="props.action" @click="navigate">
                <DashboardShortcutItem
                  :disabled="item.disabledIcon"
                  :enabled="item.enabledIcon"
                  :icon="item.icon"
                  :label="item.label"
                  :loading="item.loading"
                />
              </a>
            </router-link>
            <a v-else v-bind="props.action">
              <DashboardShortcutItem
                :enabled="item.enabledIcon"
                :icon="item.icon"
                :label="item.label"
                :loading="item.loading"
              />
            </a>
          </template>
        </Menu>
      </div>
    </div>
    <div v-else>No shortcuts available.</div>
  </AppContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHandlersStore } from '@/stores/handlers.store';
import { useSubscriberStore } from '@/stores/subscriber.store';
import { useSceneControllerStore } from '@/stores/scene-controller.store';
import { useCenturionStore } from '@/stores/modes/centurion.store';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import DashboardShortcutItem from '@/components/shortcuts/ShortcutItem.vue';
import { type IShortcutItem } from '@/components/shortcuts/IShortcutItem';
import AppContainer from '@/layout/AppContainer.vue';
import { disableAllModes } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import { useServerSettingsStore } from '@/stores/server-settings.store';

const handlersStore = useHandlersStore();
const subscriberStore = useSubscriberStore();
const sceneStore = useSceneControllerStore();
const authStore = useAuthStore();
const settingsStore = useServerSettingsStore();

const centurionModeStore = useCenturionStore();
if (authStore.isInSecurityGroup('centurion', 'privileged')) {
  void centurionModeStore.getCurrentCenturion(true);
}
const timeTrailRaceModeStore = useTimeTrailRaceStore();
if (authStore.isInSecurityGroup('timetrail', 'base')) {
  void timeTrailRaceModeStore.getTimeTrailMode();
}

// TODO why does this reactivity not work as expected?
const sceneMenuItems = computed<IShortcutItem[]>(() =>
  sceneStore.favoriteScenes.map((s) => {
    const lightGroupIds = s.effects
      .map((e) => e.lightsGroups.map((g) => g.id))
      .flat()
      .flat()
      .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
    return {
      label: s.name,
      icon: 'pi-lightbulb',
      command: async () => {
        await handlersStore.setLightsHandler(lightGroupIds, 'ScenesHandler');
        await sceneStore.applyScene(s.id);
      },
    };
  }),
);

// Add items based on the user's security groups
const defaults = computed<IShortcutItem[] | boolean>(() => {
  const showReset = authStore.isInSecurityGroup('handler', 'privileged');
  if (!showReset) {
    return false;
  }

  return [
    {
      label: 'Defaults',
      items: [
        {
          label: 'Reset to defaults',
          icon: 'pi-power-off',
          command: async () => {
            await handlersStore.reset();
          },
        },
      ],
    },
  ].filter(Boolean) as IShortcutItem[];
});

// Add items based on the user's security groups
const lights = computed<IShortcutItem[] | boolean>(() => {
  const showLights = authStore.isInSecurityGroup('handler', 'privileged');

  if (!showLights) {
    return false;
  }

  return [
    {
      label: 'Lights',
      items: [
        {
          label: 'Disable',
          icon: 'pi-power-off',
          command: async () => {
            const ids = subscriberStore.lightsGroups.map((g) => g.id);
            await handlersStore.setLightsHandler(ids);
          },
        },
        ...sceneMenuItems.value,
        {
          label: 'Random effects',
          icon: 'pi-sparkles',
          command: async () => {
            const ids = subscriberStore.lightsGroups.map((g) => g.id);
            await handlersStore.setLightsHandler(ids, 'RandomEffectsHandler');
          },
        },
      ],
    },
  ].filter(Boolean) as IShortcutItem[];
});

// Add items based on the user's security groups
const modes = computed<IShortcutItem[] | boolean>(() => {
  const showCenturion =
    authStore.isInSecurityGroup('centurion', 'privileged') && settingsStore.featureEnabled('Centurion');
  const showTimeTrail =
    authStore.isInSecurityGroup('timetrail', 'base') && settingsStore.featureEnabled('TimeTrailRace');
  const showModes = authStore.isInSecurityGroup('mode', 'base') && (showCenturion || showTimeTrail);

  if (!(showModes || showCenturion || showTimeTrail)) {
    return false;
  }

  return [
    {
      label: 'Modes',
      items: [
        showModes &&
          authStore.isInSecurityGroup('mode', 'base') && {
            label: 'Disable',
            icon: 'pi-power-off',
            command: async () => {
              await disableAllModes();
              await Promise.all([centurionModeStore.getCurrentCenturion(), timeTrailRaceModeStore.getTimeTrailMode()]);
            },
          },
        showCenturion && {
          label: 'Centurion',
          icon: 'pi-prime',
          route: '/modes/centurion',
          loading: centurionModeStore.loading,
          enabledIcon: centurionModeStore.enabled,
          disabledIcon: centurionModeStore.disabled,
        },
        showTimeTrail && {
          label: 'Spoelbakkenrace',
          icon: 'pi-hourglass',
          route: '/modes/timeTrailRace',
          loading: timeTrailRaceModeStore.loading,
          enabledIcon: timeTrailRaceModeStore.enabled,
          disabledIcon: timeTrailRaceModeStore.disabled,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean) as IShortcutItem[];
});

const menus = computed<Array<Array<IShortcutItem>>>(
  () => [defaults.value, lights.value, modes.value].filter(Boolean) as Array<Array<IShortcutItem>>,
);
</script>

<style lang="scss">
.text-override {
  color: var(--p-text-color);
}
</style>
