<template>
  <FloatLabel class="w-full mt-1" variant="on">
    <Select
      class="w-full"
      :input-id="inputId"
      :model-value="modelValue"
      option-label="name"
      option-value="value"
      :options="patterns"
      @update:model-value="(value: LightsEffectPattern) => $emit('update:modelValue', value)"
    />
    <label :for="inputId">Pattern</label>
  </FloatLabel>
</template>

<script lang="ts" setup>
import { ref, useId } from 'vue';
import { LightsEffectPattern } from '@gewis/aurora-api-client';

// The same effect settings can be shown multiple times on a page (e.g. in a scene)
const inputId = `pattern-${useId()}`;

defineProps<{
  modelValue: LightsEffectPattern;
}>();

defineEmits<{
  'update:modelValue': [modelValue: LightsEffectPattern];
}>();

const patterns = ref([
  { name: 'Horizontal', value: LightsEffectPattern.HORIZONTAL },
  { name: 'Vertical', value: LightsEffectPattern.VERTICAL },
  {
    name: 'Diagonal (top left to bottom right)',
    value: LightsEffectPattern.DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT,
  },
  {
    name: 'Diagonal (bottom left to top right)',
    value: LightsEffectPattern.DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT,
  },
  { name: 'Centered (circular)', value: LightsEffectPattern.CENTERED_CIRCULAR },
  { name: 'Centered (squared)', value: LightsEffectPattern.CENTERED_SQUARED },
  { name: 'Rotational', value: LightsEffectPattern.ROTATIONAL },
]);
</script>

<style scoped></style>
