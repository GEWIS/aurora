<template>
  <FloatLabel class="w-full mt-1" variant="on">
    <Select
      class="w-full"
      :input-id="inputId"
      :model-value="modelValue"
      option-label="name"
      option-value="value"
      :options="directions"
      @update:model-value="(value: LightsEffectDirection) => $emit('update:modelValue', value)"
    />
    <label :for="inputId">Direction</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';
import { LightsEffectDirection } from '@gewis/aurora-api-client';

// The same effect settings can be shown multiple times on a page (e.g. in a scene)
const inputId = `direction-${useId()}`;

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
