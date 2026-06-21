<template>
  <Button icon="pi pi-plus" label="Create new event" severity="success" @click="open = true" />
  <TimedEventDialog v-model:visible="open" :on-save="onSave" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimedEventDialog from '@/components/timed-events/TimedEventDialog.vue';
import type { CreateTimedEventRequest } from '@/api';
import { useTimedEventsStore } from '@/stores/timed-events.store';

const open = ref<boolean>(false);

const store = useTimedEventsStore();

const onSave = async (params: CreateTimedEventRequest) => {
  return store.createTimedEvent(params);
};
</script>

<style scoped></style>
