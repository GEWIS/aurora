<template>
  <StepperWrapper :current-step="currentStep" :steps="timeTrailSteps">
    <template #1>
      <TimeTrailRaceRegisterPlayer ref="registerPlayer" @can-register="canRegister = $event" />
    </template>
    <template #2 />
    <template #3 />
    <template #4>
      <TimeTrailRacePlaying />
    </template>
    <template #5>
      <TimeTrailRaceScore />
    </template>
  </StepperWrapper>

  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Reset"
    message="Are you sure you want to reset this trail race?"
    :on-accept="timeTrailStore.resetPlayer"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import { TimeTrailRaceState } from '@/api';
import TimeTrailRaceRegisterPlayer from '@/components/modes/time-trail-race/PlayerRegister.vue';
import TimeTrailRacePlaying from '@/components/modes/time-trail-race/PlayerTimer.vue';
import TimeTrailRaceScore from '@/components/modes/time-trail-race/PlayerScore.vue';
import StepperWrapper, { type StepperStep } from '@/components/prime/StepperWrapper.vue';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';

const registerPlayer = ref();
const confirmRef = ref();
const canRegister = ref<boolean>(false);

const timeTrailStore = useTimeTrailRaceStore();
// Make sure that on reload you are always in correct state
if (!timeTrailStore.getCurrentPlayer) {
  void timeTrailStore.resetPlayer();
}

const timeTrailSteps = computed<StepperStep[]>(() => [
  {
    value: 'Register',
    nextText: 'Register player',
    nextIcon: null,
    nextDisabled: timeTrailStore.loading || currentStep.value != '1' || !canRegister.value,
    nextFunction: registerPlayer.value?.registerPlayer,
  },
  {
    value: 'Ready',
    previousIcon: 'pi pi-history',
    previousDisabled: timeTrailStore.loading,
    previousFunction: confirmRef.value?.confirmDialog,
    overridePreviousFunction: true,
    nextText: 'Player ready',
    nextIcon: null,
    nextDisabled: timeTrailStore.loading || currentStep.value != '2',
    nextFunction: timeTrailStore.ready.bind(timeTrailStore),
  },
  {
    value: 'Start',
    previousIcon: 'pi pi-history',
    previousDisabled: timeTrailStore.loading,
    previousFunction: confirmRef.value?.confirmDialog,
    overridePreviousFunction: true,
    nextText: 'Start!',
    nextIcon: null,
    nextDisabled: timeTrailStore.loading || currentStep.value != '3',
    nextFunction: timeTrailStore.start.bind(timeTrailStore),
  },
  {
    value: 'Finish',
    previousIcon: 'pi pi-history',
    previousDisabled: timeTrailStore.loading,
    previousFunction: confirmRef.value?.confirmDialog,
    overridePreviousFunction: true,
    nextText: 'Finish!',
    nextIcon: null,
    nextDisabled: timeTrailStore.loading || currentStep.value != '4',
    nextFunction: timeTrailStore.finish.bind(timeTrailStore),
  },
  {
    value: 'Reveal',
    previousIcon: 'pi pi-history',
    previousDisabled: timeTrailStore.loading,
    previousFunction: confirmRef.value?.confirmDialog,
    overridePreviousFunction: true,
    confirmText: 'Reveal score',
    confirmIcon: null,
    confirmDisabled: timeTrailStore.loading || currentStep.value != '5',
    confirmFunction: timeTrailStore.revealScore.bind(timeTrailStore),
  },
]);

const currentStep = computed(() => {
  switch (timeTrailStore.getState) {
    case undefined:
    case TimeTrailRaceState.INITIALIZED:
    case TimeTrailRaceState.SCOREBOARD:
      return '1';
    case TimeTrailRaceState.PLAYER_REGISTERED:
      return '2';
    case TimeTrailRaceState.PLAYER_READY:
      return '3';
    case TimeTrailRaceState.STARTED:
      return '4';
    case TimeTrailRaceState.FINISHED:
      return '5';
    default:
      return '1';
  }
});
</script>
