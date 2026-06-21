<template>
  <MultiSelect
    filter
    :model-value="modelValue"
    option-label="name"
    option-value="id"
    :options="store.lightsGroups"
    placeholder="Select lights..."
    :title="
      store.lightsGroups
        .filter((a) => modelValue.includes(a.id))
        .map((a) => a.name)
        .join(', ')
    "
    @update:model-value="(value) => $emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import { useSubscriberStore } from '@/stores/subscriber.store';

const store = useSubscriberStore();

defineProps<{
  modelValue: number[];
}>();

defineEmits<{
  'update:modelValue': [ids: number[]];
}>();
</script>

<style scoped></style>
