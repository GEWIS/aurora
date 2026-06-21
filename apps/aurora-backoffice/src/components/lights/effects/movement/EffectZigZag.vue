<template>
  <SelectorRatioSlider
    id="cycle-time"
    :max="40000"
    :min="10000"
    name="Cycle time (in ms)"
    :step="1000"
    :value="cycleTime"
    @update="(newVal: number) => (cycleTime = newVal)"
  />
  <SelectorRatioSlider
    id="offset-factor"
    :max="1"
    :min="0"
    name="Offset factor"
    :step="0.05"
    :value="offsetFactor"
    @update="(newVal: number) => (offsetFactor = newVal)"
  />
  <SelectorRatioSlider
    id="horizontal-radius-factor"
    :max="1"
    :min="0"
    name="Horizontal radius factor"
    :step="0.05"
    :value="horizontalRadiusFactor"
    @update="(newVal: number) => (horizontalRadiusFactor = newVal)"
  />
  <SelectorRatioSlider
    id="vertical-radius-factor"
    :max="1"
    :min="0"
    name="Vertical radius factor"
    :step="0.05"
    :value="verticalRadiusFactor"
    @update="(newVal: number) => (verticalRadiusFactor = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { MovementEffectsZigZag, type ZigZagCreateParams } from '@/api';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';

const props = defineProps<{
  defaultModelValue?: ZigZagCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [params: ZigZagCreateParams];
}>();

const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 20000);
const offsetFactor = ref<number>(props.defaultModelValue?.props.offsetFactor || 0);
const horizontalRadiusFactor = ref<number>(props.defaultModelValue?.props.horizontalRadius || 0.5);
const verticalRadiusFactor = ref<number>(props.defaultModelValue?.props.verticalRadius || 0.8);

const handleChange = () => {
  const payload: ZigZagCreateParams = {
    type: MovementEffectsZigZag.ZIG_ZAG,
    props: {
      cycleTime: cycleTime.value,
      offsetFactor: offsetFactor.value,
      horizontalRadius: horizontalRadiusFactor.value,
      verticalRadius: verticalRadiusFactor.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([cycleTime, offsetFactor, horizontalRadiusFactor, verticalRadiusFactor], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
