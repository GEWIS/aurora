<template>
  <div class="flex flex-column w-fit">
    <label class="font-bold block mb-1" :for="id">{{ name }}</label>
    <div class="card">
      <div class="">
        <InputNumber
          :id="id"
          class="w-full"
          :max-fraction-digits="2"
          :min-fraction-digits="0"
          :model-value="value"
          @blur="(event) => handleNumberInputChange(event.value)"
        />
        <Slider class="w-full" :max="max" :min="min" :model-value="value" :step="step" @change="onChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
