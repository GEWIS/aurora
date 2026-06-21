<template>
  <FloatLabel class="w-full mt-1" variant="on">
    <Select
      class="w-full"
      input-id="pattern-select"
      :model-value="modelValue"
      option-label="name"
      option-value="value"
      :options="patterns"
      @update:model-value="(value: LightsEffectPattern) => $emit('update:modelValue', value)"
    />
    <label for="pattern-select">Pattern</label>
  </FloatLabel>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { LightsEffectPattern } from '@/api';

defineProps<{
  modelValue: LightsEffectPattern;
}>();

defineEmits<{
  'update:modelValue': [modelValue: LightsEffectPattern];
}>();

const patterns = ref([
  { name: 'Horizontal', value: LightsEffectPattern.HORIZONTAL },
  { name: 'Vertical', value: LightsEffectPattern.VERTICAL },
  { name: 'Diagonal (top left to bottom right)', value: LightsEffectPattern.DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT },
  { name: 'Diagonal (bottom left to top right)', value: LightsEffectPattern.DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT },
  { name: 'Centered (circular)', value: LightsEffectPattern.CENTERED_CIRCULAR },
  { name: 'Centered (squared)', value: LightsEffectPattern.CENTERED_SQUARED },
  { name: 'Rotational', value: LightsEffectPattern.ROTATIONAL },
]);
</script>

<style scoped></style>
