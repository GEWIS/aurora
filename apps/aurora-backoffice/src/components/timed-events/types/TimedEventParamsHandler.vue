<template>
  <div class="flex flex-col gap-2">
    <label for="subscriber">Subscriber</label>
    <Select
      id="subscriber"
      v-model="selectedSubscriber"
      :invalid="selectedSubscriber == undefined"
      option-label="label"
      option-value="id"
      :options="props.subscribers"
      placeholder="Choose a subscriber"
    />
  </div>
  <div class="flex flex-col gap-2">
    <label for="handler">Handler</label>
    <Select
      id="handler"
      v-model="selectedHandler"
      option-label="name"
      option-value="name"
      :options="props.handlers"
      placeholder="No handler"
      show-clear
    />
  </div>
  <TimedEventDialogSaveButton :disabled="inputInvalid" :loading="loading" @click="onSave">
    Save changes
  </TimedEventDialogSaveButton>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  CreateTimedEventRequest,
  SwitchHandlerParams,
  TimedEventSwitchHandlerAudio,
  TimedEventSwitchHandlerLights,
  TimedEventSwitchHandlerScreen,
} from '@/api';
import TimedEventDialogSaveButton from '@/components/timed-events/types/TimedEventDialogSaveButton.vue';

const props = defineProps<{
  originalEventSpecParams?: SwitchHandlerParams;
  subscribers: { label: string; id: number }[];
  handlers: { name: string }[];
  cronExpression: string;
  cronValid: boolean;
  skipNext?: boolean;
  eventSpecType:
    | TimedEventSwitchHandlerAudio['type']
    | TimedEventSwitchHandlerLights['type']
    | TimedEventSwitchHandlerScreen['type'];
  onSave: (params: CreateTimedEventRequest, skipNext?: boolean) => Promise<void>;
}>();

const loading = ref<boolean>(false);

const selectedSubscriber = ref<number | undefined>(props.originalEventSpecParams?.id);
const selectedHandler = ref<string>(props.originalEventSpecParams?.handler ?? '');

const inputInvalid = computed(() => {
  return loading.value || !props.cronValid || selectedSubscriber.value === undefined || selectedSubscriber.value < 0;
});

const onSave = () => {
  if (inputInvalid.value || selectedSubscriber.value === undefined) return;

  loading.value = true;
  const specParams: SwitchHandlerParams = {
    id: selectedSubscriber.value,
    handler: selectedHandler.value,
  };

  // Typescript is unfortunately not mega smart, so it's not seeing these specParam
  // are actually one and the same (but with a different type)
  let params: CreateTimedEventRequest;
  switch (props.eventSpecType) {
    case 'switch-handler-audio':
      params = {
        cronExpression: props.cronExpression,
        eventSpec: {
          type: props.eventSpecType,
          params: specParams,
        },
      };
      break;
    case 'switch-handler-lights':
      params = {
        cronExpression: props.cronExpression,
        eventSpec: {
          type: props.eventSpecType,
          params: specParams,
        },
      };
      break;
    case 'switch-handler-screen':
      params = {
        cronExpression: props.cronExpression,
        eventSpec: {
          type: props.eventSpecType,
          params: specParams,
        },
      };
      break;
  }

  if (!params) return;
  void props.onSave(params, props.skipNext).finally(() => {
    loading.value = false;
  });
};
</script>

<style scoped></style>
