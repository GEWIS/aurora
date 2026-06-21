<template>
  <Button icon="pi pi-pen-to-square" @click="open = true" />
  <TimedEventDialog v-model:visible="open" :on-save="onSave" :original-timed-event="timedEvent" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimedEventDialog from '@/components/timed-events/TimedEventDialog.vue';
import type { CreateTimedEventRequest, TimedEventResponse } from '@/api';
import { useTimedEventsStore } from '@/stores/timed-events.store';

const props = defineProps<{
  timedEvent: TimedEventResponse;
}>();

const open = ref<boolean>(false);

const store = useTimedEventsStore();

const onSave = async (params: CreateTimedEventRequest, skipNext?: boolean) => {
  if (skipNext == undefined) throw new Error('"skipNext" is required.');
  return store.updateTimedEvent(props.timedEvent.id, { ...params, skipNext });
};
</script>
<style scoped></style>
