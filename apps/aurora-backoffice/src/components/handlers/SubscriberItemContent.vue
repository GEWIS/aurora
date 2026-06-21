<template>
  <div>
    <div class="mb-2">
      <div class="flex max-w-full w-full">
        <h6 class="mb-0 overflow-hidden white-space-nowrap text-overflow-ellipsis">
          {{ subscriber.name }}
        </h6>
        <StatusIcon class="ml-2" :status="props.status" :subscriber="props.subscriber" />
      </div>
    </div>
    <SubscriberHandlerChangeSelect
      :current-handler="currentHandler"
      :disabled="disabled"
      :loading="loading"
      :possible-handlers="possibleHandlers"
      @change="(newHandler: string | null) => $emit('change', newHandler)"
    />
  </div>
</template>

<script setup lang="ts">
import SubscriberHandlerChangeSelect from '@/components/handlers/SubscriberHandlerChangeSelect.vue';
import StatusIcon from '@/components/handlers/StatusIcon.vue';
import type { Handler } from '@/stores/handlers.store';
import type { AudioResponse, LightsControllerResponse, ScreenResponse } from '@/api';
import type { Status } from '@/stores/status.store';

const props = defineProps<{
  subscriber: AudioResponse | ScreenResponse | LightsControllerResponse;
  currentHandler: Handler | undefined;
  possibleHandlers: Handler[];
  loading?: boolean;
  disabled?: boolean;
  status: Status | undefined;
}>();

defineEmits<{
  change: [handler: string | null];
}>();
</script>

<style lang="scss"></style>
