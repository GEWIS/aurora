<template>
  <StepperWrapper current-step="1" :steps="initializationSteps">
    <template #1>
      <div class="flex flex-col gap-2 mt-3 sm:mt-0">
        <div class="sm:text-lg text-center">Provide a name for this session</div>
        <InputText
          id="time-trail-race-session-name"
          v-model="sessionName"
          class="w-full sm:max-w-80 mx-auto"
          placeholder="Session name"
        />
      </div>
    </template>
    <template #2>
      <div class="flex flex-col gap-2 mt-3 sm:mt-0">
        <div class="sm:text-lg text-center">Select subscribers for this centurion</div>
        <SubscribersSelect
          :selected-audios="selectedAudios"
          :selected-light-groups="selectedLightGroups"
          :selected-screens="selectedScreens"
          @update:audios="(ids: number[]) => (selectedAudios = ids)"
          @update:light-groups="(ids: number[]) => (selectedLightGroups = ids)"
          @update:screens="(ids: number[]) => (selectedScreens = ids)"
        />
      </div>
    </template>
    <template #3>
      <div class="flex flex-col gap-2 mt-3 sm:mt-0">
        <div class="max-w-lg mx-auto">
          <div class="sm:text-lg text-center mb-3 font-semibold">Confirm time trail race initialization</div>
          <div class="text-justify">
            You are about to start to start a time trail race session called
            <span class="font-semibold">{{ sessionName }}</span
            >.
          </div>
          <SubscriberDetails
            class="mt-3"
            :selected-audios="selectedAudios"
            :selected-light-groups="selectedLightGroups"
            :selected-screens="selectedScreens"
          />
        </div>
      </div>
    </template>
  </StepperWrapper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SubscribersSelect from '@/components/modes/SubscribersSelect.vue';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import StepperWrapper, { type StepperStep } from '@/components/prime/StepperWrapper.vue';
import SubscriberDetails from '@/components/modes/SubscribersDetails.vue';

const store = useTimeTrailRaceStore();

const sessionName = ref<string>('');
const selectedAudios = ref<number[]>([]);
const selectedScreens = ref<number[]>([]);
const selectedLightGroups = ref<number[]>([]);

const confirmModalOpen = ref<boolean>(false);
const confirmModalLoading = ref<boolean>(false);

const initializationSteps = computed<StepperStep[]>(() => [
  { value: 'Session', nextDisabled: sessionName.value === '' },
  { value: 'Subscribers', nextDisabled: selectedAudios.value.length === 0 },
  { value: 'Confirmation', confirmFunction: initialize },
]);

const initialize = async () => {
  confirmModalLoading.value = true;
  await store.initializeTimeTrailMode(
    sessionName.value,
    selectedAudios.value,
    selectedScreens.value,
    selectedLightGroups.value,
  );
  confirmModalOpen.value = false;
  confirmModalLoading.value = false;
};
</script>
