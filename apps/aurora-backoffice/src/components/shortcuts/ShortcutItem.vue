<template>
  <div class="w-full flex justify-between gap-2">
    <div>
      <i :class="['pi text-sm mr-2', icon]" />
      <span>{{ label }}</span>
    </div>
    <div>
      <div v-if="loading">
        <Spinner stroke-width="8" style="height: 1rem; width: 1rem" />
      </div>
      <div v-if="enabled">
        <i class="pi pi-play-circle text-green-500" />
      </div>
      <div v-if="disabled">
        <i class="pi pi-times-circle text-red-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  label?: string | ((...args: never) => string) | undefined;
  loading?: boolean | undefined;
  enabled?: boolean | undefined;
  disabled?: boolean | undefined;
}>();
</script>

<style scoped></style>
