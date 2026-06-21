<template>
  <TimedEventParamsHandler
    :cron-expression="cronExpression"
    :cron-valid="cronValid"
    event-spec-type="switch-handler-audio"
    :handlers="handlers"
    :on-save="onSave"
    :original-event-spec-params="originalEventSpecParams"
    :skip-next="skipNext"
    :subscribers="audios"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSubscriberStore } from '@/stores/subscriber.store';
import { useHandlersStore } from '@/stores/handlers.store';
import TimedEventParamsHandler from '@/components/timed-events/types/TimedEventParamsHandler.vue';
import type { SwitchHandlerParams } from '@/api';
import type { TimedEventParamsProps } from '@/components/timed-events/types/TimedEventParamsProps';

defineProps<TimedEventParamsProps<SwitchHandlerParams>>();

defineEmits<{
  'update:modelValue': [params: SwitchHandlerParams];
}>();

const subscriberStore = useSubscriberStore();
const handlersStore = useHandlersStore();

const audios = computed(() => {
  return subscriberStore.audios.map((s) => ({ label: s.name, id: s.id }));
});
const handlers = computed(() => {
  return handlersStore.audioHandlers.map((s) => ({ name: s.name }));
});
</script>

<style scoped></style>
