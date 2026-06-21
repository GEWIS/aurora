<template>
  <Select
    class="overflow-hidden text-overflow-ellipsis w-full"
    :disabled="disabled"
    :loading="loading"
    :model-value="currentHandler?.name"
    option-label="name"
    option-value="name"
    :options="possibleHandlers"
    placeholder="Select handler"
    show-clear
    @update:model-value="
      (newHandler: string | null) => {
        $emit('change', newHandler);
      }
    "
  />
</template>

<script setup lang="ts">
import type { Handler } from '@/stores/handlers.store';

defineProps<{
  currentHandler?: Handler;
  possibleHandlers: Handler[];
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  change: [handler: string | null];
}>();
</script>

<style scoped></style>
