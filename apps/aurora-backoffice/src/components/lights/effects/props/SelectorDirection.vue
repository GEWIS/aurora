<template>
  <FloatLabel class="w-full mt-1" variant="on">
    <Select
      class="w-full"
      input-id="direction-select"
      :model-value="modelValue"
      option-label="name"
      option-value="value"
      :options="directions"
      @update:model-value="(value: LightsEffectDirection) => $emit('update:modelValue', value)"
    />
    <label for="direction-select">Direction</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LightsEffectDirection } from '@/api';

defineProps<{
  modelValue: LightsEffectDirection;
}>();

defineEmits<{
  'update:modelValue': [modelValue: LightsEffectDirection];
}>();

const directions = ref([
  { name: 'Forwards', value: LightsEffectDirection.FORWARDS },
  { name: 'Backwards', value: LightsEffectDirection.BACKWARDS },
]);
</script>

<style scoped></style>
