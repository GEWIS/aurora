<template>
  <StepperWrapper current-step="1" :steps="initializationSteps">
    <template #1>
      <div class="flex flex-col gap-2 mt-3 sm:mt-0">
        <div class="sm:text-lg text-center">Select a mixtape for this centurion</div>
        <Select
          class="w-full sm:max-w-80 mx-auto"
          :model-value="selectedTape"
          option-group-children="items"
          option-group-label="label"
          option-label="name"
          :options="availableTapes"
          placeholder="Select tape"
          :title="selectedTape?.name"
          @update:model-value="
            (value: MixTapeResponse) => {
              selectedTape = value;
            }
          "
        >
          <template #optiongroup="slotProps">
            <p>{{ slotProps.option.label }}</p>
          </template>
        </Select>
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
          <div class="sm:text-lg text-center mb-3 font-semibold">Confirm centurion initialization</div>
          <TapeDetails v-if="selectedTape" :tape="selectedTape" />
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
import SubscriberDetails from '@/components/modes/SubscribersDetails.vue';
import { useCenturionStore } from '@/stores/modes/centurion.store';
import type { MixTapeResponse } from '@/api';
import TapeDetails from '@/components/modes/centurion/TapeDetails.vue';
import type { StepperStep } from '@/components/prime/StepperWrapper.vue';
import StepperWrapper from '@/components/prime/StepperWrapper.vue';
import SubscribersSelect from '@/components/modes/SubscribersSelect.vue';

interface GroupedTape {
  label: string;
  code: string;
  items: MixTapeResponse[];
}

interface ArtistGroupedTape {
  [key: string]: GroupedTape;
}

defineProps<{
  vertical: boolean;
}>();

const centurionStore = useCenturionStore();

const selectedAudios = ref<number[]>([]);
const selectedScreens = ref<number[]>([]);
const selectedLightGroups = ref<number[]>([]);
const selectedTape = ref<MixTapeResponse | undefined>(undefined);

// The available tapes; grouped by artist
const availableTapes = computed<GroupedTape[] | undefined>(() => {
  const tapes = centurionStore.getTapes;
  if (tapes == null) return undefined;

  const tapeByArtist = tapes.reduce((accumulated, tape) => {
    if (!accumulated[tape.artist]) {
      accumulated[tape.artist] = {
        label: tape.artist,
        code: tape.artist,
        items: [],
      };
    }
    accumulated[tape.artist].items.push(tape);
    return accumulated;
  }, {} as ArtistGroupedTape);

  return Object.keys(tapeByArtist).reduce((acc, artistKey) => {
    acc.push(tapeByArtist[artistKey]);
    return acc;
  }, [] as GroupedTape[]);
});

const initializationSteps = computed<StepperStep[]>(() => [
  { value: 'Mixtape', nextDisabled: selectedTape.value === undefined },
  { value: 'Subscribers', nextDisabled: selectedAudios.value.length === 0 },
  { value: 'Confirmation', confirmFunction: initialize, confirmLoading: centurionStore.loading },
]);

// Initialize the centurion
const initialize = async () => {
  await centurionStore.initializeCenturion(
    selectedTape.value!.name,
    selectedTape.value!.artist,
    selectedAudios.value,
    selectedScreens.value,
    selectedLightGroups.value,
  );
};
</script>
