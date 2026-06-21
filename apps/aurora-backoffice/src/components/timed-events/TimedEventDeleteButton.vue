<template>
  <Button icon="pi pi-times" severity="danger" @click="confirmRef?.confirmDialog" />
  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Delete"
    :loading="loading"
    message="Are you sure you want to delete this timed event?"
    :on-accept="
      () => {
        loading = true;
        store.deleteTimedEvent(props.timedEvent.id).finally(() => {
          loading = false;
        });
      }
    "
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TimedEventResponse } from '@/api';
import { useTimedEventsStore } from '@/stores/timed-events.store';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';

const store = useTimedEventsStore();

const props = defineProps<{
  timedEvent: TimedEventResponse;
}>();

const confirmRef = ref();
const loading = ref<boolean>(false);
</script>

<style scoped></style>
