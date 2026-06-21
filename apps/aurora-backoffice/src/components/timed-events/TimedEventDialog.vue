<template>
  <Dialog
    closable
    close-on-escape
    dismissable-mask
    header="Create new timed event"
    :keep-in-view-port="false"
    modal
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="cronExpression">Cron expression</label>
        <InputText
          id="cronExpression"
          v-model="cronExpression"
          :invalid="cronInvalid"
          placeholder="39 5 * * *"
          type="text"
        />
        <Message v-if="cronInvalid" severity="error" size="small" variant="simple"
          >Please type a valid cron expression</Message
        >
        <Message v-else severity="secondary" size="small" variant="simple">{{ cronToString(cronExpression) }}</Message>
      </div>
      <div class="flex flex-col gap-2">
        <label for="event-type">Event type</label>
        <Select
          id="event-type"
          v-model="selectedType"
          option-label="label"
          option-value="name"
          :options="possibleTypes"
          placeholder="Choose a type"
        />
      </div>
      <div v-if="originalTimedEvent" class="flex flex-col gap-2">
        <label for="skip-next">Skip next?</label>
        <ToggleSwitch v-model="skipNext" />
      </div>
      <TimedEventParamsHandlerAudio
        v-if="selectedType === 'switch-handler-audio'"
        :cron-expression="cronExpression"
        :cron-valid="!cronInvalid"
        :on-save="onSaveWrapper"
        :original-event-spec-params="
          originalTimedEvent?.eventSpec.type === 'switch-handler-audio'
            ? originalTimedEvent?.eventSpec.params
            : undefined
        "
        :skip-next="skipNext"
      />
      <TimedEventParamsHandlerLights
        v-else-if="selectedType === 'switch-handler-lights'"
        :cron-expression="cronExpression"
        :cron-valid="!cronInvalid"
        :on-save="onSaveWrapper"
        :original-event-spec-params="
          originalTimedEvent?.eventSpec.type === 'switch-handler-lights'
            ? originalTimedEvent?.eventSpec.params
            : undefined
        "
        :skip-next="skipNext"
      />
      <TimedEventParamsHandlerScreen
        v-else-if="selectedType === 'switch-handler-screen'"
        :cron-expression="cronExpression"
        :cron-valid="!cronInvalid"
        :on-save="onSaveWrapper"
        :original-event-spec-params="
          originalTimedEvent?.eventSpec.type === 'switch-handler-screen'
            ? originalTimedEvent?.eventSpec.params
            : undefined
        "
        :skip-next="skipNext"
      />
      <TimedEventParamsStaticPoster
        v-else-if="selectedType === 'timed-event-set-static-poster'"
        :cron-expression="cronExpression"
        :cron-valid="!cronInvalid"
        :on-save="onSaveWrapper"
        :original-event-spec-params="
          originalTimedEvent?.eventSpec.type === 'timed-event-set-static-poster'
            ? originalTimedEvent?.eventSpec.params
            : undefined
        "
        :skip-next="skipNext"
      />
      <TimedEventDialogSaveButton
        v-else
        :disabled="loading || cronInvalid || selectedType === ''"
        :loading="loading"
        @click="saveEvent"
      >
        Save changes
      </TimedEventDialogSaveButton>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, type Ref, ref } from 'vue';
import { toString as cronToString } from 'cronstrue';
import type { CreateTimedEventRequest, EventSpec, TimedEventResponse } from '@/api';
import TimedEventParamsHandlerScreen from '@/components/timed-events/types/TimedEventParamsHandlerScreen.vue';
import TimedEventParamsHandlerAudio from '@/components/timed-events/types/TimedEventParamsHandlerAudio.vue';
import TimedEventParamsHandlerLights from '@/components/timed-events/types/TimedEventParamsHandlerLights.vue';
import TimedEventDialogSaveButton from '@/components/timed-events/types/TimedEventDialogSaveButton.vue';
import TimedEventParamsStaticPoster from '@/components/timed-events/types/TimedEventParamsStaticPoster.vue';

const props = defineProps<{
  originalTimedEvent?: TimedEventResponse;
  visible: boolean;
  onSave: (params: CreateTimedEventRequest, skipNext?: boolean) => Promise<void>;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

const loading = ref<boolean>(false);

const cronExpression = ref<string>(props.originalTimedEvent?.cronExpression ?? '');
const cronInvalid: ComputedRef<boolean> = computed(() => {
  try {
    cronToString(cronExpression.value);
    return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return true;
  }
});

const selectedType = ref<EventSpec['type'] | ''>(props.originalTimedEvent?.eventSpec.type ?? '');
const possibleTypes: Ref<{ name: EventSpec['type']; label: string }[]> = ref([
  { name: 'system-reset', label: 'System reset' },
  { name: 'clean-audit-logs', label: 'Clean audit logs' },
  { name: 'switch-handler-audio', label: 'Switch handler audio' },
  { name: 'switch-handler-lights', label: 'Switch handler lights group' },
  { name: 'switch-handler-screen', label: 'Switch handler screen' },
  { name: 'timed-event-set-static-poster', label: 'Set static poster' },
] as { name: EventSpec['type']; label: string }[]);

const skipNext = ref<boolean>(false);

const onSaveWrapper = async (params: CreateTimedEventRequest, skipNext?: boolean) => {
  await props.onSave(params, skipNext);
  emit('update:visible', false as never);
};

const saveEvent = () => {
  if (selectedType.value === '') return;

  loading.value = true;

  switch (selectedType.value) {
    case 'system-reset':
      void onSaveWrapper(
        { cronExpression: cronExpression.value, eventSpec: { type: 'system-reset' } },
        skipNext.value,
      ).then(() => {
        loading.value = false;
      });
      return;
    case 'clean-audit-logs':
      void onSaveWrapper(
        { cronExpression: cronExpression.value, eventSpec: { type: 'clean-audit-logs' } },
        skipNext.value,
      ).then(() => {
        loading.value = false;
      });
      return;
  }
};
</script>

<style scoped></style>
