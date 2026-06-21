<template>
  <div class="flex flex-col gap-2">
    <label for="static-poster-select">Static poster</label>
    <Select
      id="static-poster-select"
      v-model="selectedPosterId"
      :loading="posterStore.loading"
      option-value="id"
      :options="posterStore.staticPosters"
      placeholder="Choose a poster"
    >
      <template #option="slotProps">
        <div class="flex items-center">
          <StaticPosterPreview class="w-64" :poster="slotProps.option" />
        </div>
      </template>
      <template #value="slotProps">
        <StaticPosterPreview
          v-if="selectedPoster"
          class="w-64 inline-block"
          :poster="selectedPoster"
        />
        <span v-else>{{ slotProps.placeholder }}</span>
      </template>
    </Select>
  </div>

  <div class="flex flex-row gap-2">
    <Checkbox v-model="clockVisible" binary input-id="static-poster-clock-visible" />
    <label for="static-poster-clock-visible">Clock visible?</label>
  </div>

  <TimedEventDialogSaveButton :disabled="inputInvalid" :loading="loading" @click="handleSave">
    Save changes
  </TimedEventDialogSaveButton>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CreateTimedEventRequest, TimedEventSetStaticPoster } from '@gewis/aurora-api-client';
import StaticPosterPreview from '@/components/poster/StaticPosterPreview.vue';
import TimedEventDialogSaveButton from '@/components/timed-events/types/TimedEventDialogSaveButton.vue';
import type { TimedEventParamsProps } from '@/components/timed-events/types/TimedEventParamsProps';
import { usePosterStore } from '@/stores/poster/poster.store';

const props = defineProps<TimedEventParamsProps<TimedEventSetStaticPoster['params']>>();

const posterStore = usePosterStore();
void posterStore.init();

const selectedPosterId = ref<number | undefined>(
  props.originalEventSpecParams?.posterId ?? undefined,
);
const selectedPoster = computed(() => {
  return posterStore.staticPosters.find((poster) => poster.id === selectedPosterId.value);
});
const clockVisible = ref<boolean>(props.originalEventSpecParams?.clockVisible ?? true);
const loading = ref<boolean>(false);

const inputInvalid = computed(() => {
  return loading.value || !props.cronValid || selectedPosterId.value === undefined;
});

const handleSave = async () => {
  if (inputInvalid.value || !selectedPosterId.value) return;

  loading.value = true;
  const eventSpec: TimedEventSetStaticPoster = {
    type: 'timed-event-set-static-poster',
    params: {
      posterId: selectedPosterId.value,
      clockVisible: clockVisible.value,
    },
  };
  const params: CreateTimedEventRequest = {
    cronExpression: props.cronExpression,
    eventSpec,
  };

  await props.onSave(params, props.skipNext).finally(() => {
    loading.value = false;
  });
};
</script>

<style scoped></style>
