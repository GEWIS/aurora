<template>
  <div class="flex flex-col gap-2">
    <label for="screen-filter-brightness">Brightness: {{ brightness }}%</label>
    <Slider id="screen-filter-brightness" v-model="brightness" :max="100" :min="10" />
  </div>

  <div class="flex flex-col gap-2">
    <label for="screen-filter-warmth">Blue light filter: {{ warmth }}%</label>
    <Slider id="screen-filter-warmth" v-model="warmth" :max="100" :min="0" />
  </div>

  <div class="flex flex-col gap-2">
    <label for="screen-filter-transition">Transition duration (minutes)</label>
    <InputNumber
      v-model="transitionMinutes"
      input-id="screen-filter-transition"
      :max="60"
      :min="0"
      show-buttons
    />
    <Message severity="secondary" size="small" variant="simple">
      Screens gradually fade to the new filter over this duration.
    </Message>
  </div>

  <TimedEventDialogSaveButton :disabled="inputInvalid" :loading="loading" @click="handleSave" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CreateTimedEventRequest, TimedEventSetScreenFilter } from '@gewis/aurora-api-client';
import TimedEventDialogSaveButton from '@/components/timed-events/types/TimedEventDialogSaveButton.vue';
import type { TimedEventParamsProps } from '@/components/timed-events/types/TimedEventParamsProps';
import { DEFAULT_SCREEN_FILTER } from '@/stores/screen-filter.store';

const DEFAULT_TRANSITION_MINUTES = 15;

const props = defineProps<TimedEventParamsProps<TimedEventSetScreenFilter['params']>>();

const brightness = ref<number>(
  props.originalEventSpecParams?.brightness ?? DEFAULT_SCREEN_FILTER.brightness,
);
const warmth = ref<number>(props.originalEventSpecParams?.warmth ?? DEFAULT_SCREEN_FILTER.warmth);
const transitionMinutes = ref<number>(
  props.originalEventSpecParams?.transitionSeconds !== undefined
    ? Math.round(props.originalEventSpecParams.transitionSeconds / 60)
    : DEFAULT_TRANSITION_MINUTES,
);
const loading = ref<boolean>(false);

const inputInvalid = computed(() => {
  return loading.value || !props.cronValid;
});

const handleSave = async () => {
  if (inputInvalid.value) return;

  loading.value = true;
  const eventSpec: TimedEventSetScreenFilter = {
    type: 'timed-event-set-screen-filter',
    params: {
      brightness: brightness.value,
      warmth: warmth.value,
      transitionSeconds: transitionMinutes.value * 60,
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
