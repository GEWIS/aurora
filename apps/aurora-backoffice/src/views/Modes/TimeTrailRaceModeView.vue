<template>
  <div :class="timeTrailInitialized ? 'grid grid-cols-1 xl:grid-cols-2 gap-10' : 'grid lg:grid-cols-6 xxl:grid-cols-4'">
    <div v-if="!timeTrailInitialized" class="hidden lg:flex" />
    <AppContainer
      :class="timeTrailInitialized ? '' : 'lg:col-span-4 xxl:col-span-2'"
      icon="pi-hourglass"
      :title="timeTrailRaceTitle"
    >
      <template #header>
        <div v-if="timeTrailInitialized">
          <Button icon="pi pi-times" @click="confirmRef?.confirmDialog" />
          <ConfirmWrapper
            ref="confirmRef"
            accept-label="Quit"
            message="Are you sure you want to quit this spoelbakkenrace?"
            :on-accept="timeTrailStore.quit"
          />
        </div>
      </template>
      <div v-if="!timeTrailInitialized">
        <TimeTrailRaceInitialize />
      </div>
      <div v-else>
        <TimeTrailRaceStepper />
      </div>
    </AppContainer>
    <AppContainer v-if="timeTrailInitialized" icon="pi pi-chart-bar" title="Scoreboard">
      <TimeTrailRaceScoreboard />
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import TimeTrailRaceInitialize from '@/components/modes/time-trail-race/TimeTrailRaceInitialize.vue';
import TimeTrailRaceStepper from '@/components/modes/time-trail-race/TimeTrailRaceStepper.vue';
import TimeTrailRaceScoreboard from '@/components/modes/time-trail-race/TimeTrailRaceScoreboard.vue';
import AppContainer from '@/layout/AppContainer.vue';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';
import { useLayoutStore } from '@/stores/layout.store';

const confirmRef = ref();

const layoutStore = useLayoutStore();
const timeTrailStore = useTimeTrailRaceStore();
void timeTrailStore.init();

const timeTrailInitialized = computed(() => {
  return timeTrailStore.getSessionName !== undefined && timeTrailStore.getState !== undefined;
});
const timeTrailRaceTitle = computed(() => {
  if (timeTrailStore.getSessionName) {
    return `Spoelbakkenrace (${timeTrailStore.getSessionName})`;
  }
  return 'Spoelbakkenrace';
});

onMounted(() => layoutStore.mountResizeListener());
onUnmounted(() => {
  layoutStore.unmountResizeListener();
  timeTrailStore.destroy();
});
</script>

<style scoped></style>
