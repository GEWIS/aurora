<template>
  <TimedEventParamsHandler
    :cron-expression="cronExpression"
    :cron-valid="cronValid"
    event-spec-type="switch-handler-lights"
    :handlers="handlers"
    :on-save="onSave"
    :original-event-spec-params="originalEventSpecParams"
    :skip-next="skipNext"
    :subscribers="lightsGroups"
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

const subscriberStore = useSubscriberStore();
const handlersStore = useHandlersStore();

const lightsGroups = computed(() => {
  return subscriberStore.lightsGroups.map((s) => ({ label: s.name, id: s.id }));
});
const handlers = computed(() => {
  return handlersStore.lightsHandlers.map((s) => ({ name: s.name }));
});
</script>

<style scoped></style>
