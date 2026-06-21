<template>
  <SelectorRatioSlider
    id="cycleTime"
    :max="20000"
    :min="2000"
    name="Cycle time (in ms)"
    :step="1000"
    :value="cycleTime"
    @update="(newVal: number) => (cycleTime = newVal)"
  />
  <SelectorRatioSlider
    id="offsetFactor"
    :max="1"
    :min="0"
    name="Offset factor"
    :step="0.05"
    :value="offsetFactor"
    @update="(newVal: number) => (offsetFactor = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { MovementEffectsTableRotate, type TableRotateCreateParams } from '@/api';

const props = defineProps<{
  defaultModelValue?: TableRotateCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [props: TableRotateCreateParams];
}>();

const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 10000);
const offsetFactor = ref<number>(props.defaultModelValue?.props.offsetFactor || 0.25);

const handleChange = () => {
  const payload: TableRotateCreateParams = {
    type: MovementEffectsTableRotate.TABLE_ROTATE,
    props: {
      cycleTime: cycleTime.value,
      offsetFactor: offsetFactor.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([cycleTime, offsetFactor], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
