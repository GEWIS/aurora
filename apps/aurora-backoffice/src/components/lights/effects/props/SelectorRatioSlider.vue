<template>
  <div class="flex flex-col gap-3 w-full">
    <FloatLabel variant="on">
      <InputNumber
        class="w-full"
        :input-id="inputId"
        :max-fraction-digits="2"
        :min-fraction-digits="0"
        :model-value="value"
        @blur="(event) => handleNumberInputChange(event.value)"
      />
      <label :for="inputId">{{ name }}</label>
    </FloatLabel>
    <Slider
      class="w-full"
      :max="max"
      :min="min"
      :model-value="value"
      :step="step"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';

const props = defineProps<{
  value: number;
  min: number;
  max: number;
  step: number;
  id: string;
  name: string;
}>();

const emit = defineEmits<{
  update: [value: number];
}>();

// The same effect settings can be shown multiple times on a page (e.g. in a scene)
const inputId = `${props.id}-${useId()}`;

const handleNumberInputChange = (newValue: string) => {
  const asNumber = Number(newValue);
  if (!Number.isNaN(asNumber)) onChange(asNumber);
};

const onChange = (newValue: number) => {
  if (newValue < props.min) {
    emit('update', props.min);
  } else if (newValue > props.max) {
    emit('update', props.max);
  } else {
    emit('update', newValue);
  }
};
</script>

<style scoped></style>
