<template>
  <SelectorRatioSlider
    id="radiusFactor"
    :max="2"
    :min="0"
    name="Radius factor"
    :step="0.1"
    :value="radiusFactor"
    @update="(newVal: number) => (radiusFactor = newVal)"
  />
  <SelectorRatioSlider
    id="cycleTime"
    :max="20000"
    :min="0"
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
import { MovementEffectsSearchLight, type SearchLightCreateParams } from '@/api';

const props = defineProps<{
  defaultModelValue?: SearchLightCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [props: SearchLightCreateParams];
}>();

const radiusFactor = ref<number>(props.defaultModelValue?.props.radiusFactor || 1);
const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 4000);
const offsetFactor = ref<number>(props.defaultModelValue?.props.offsetFactor || 0.25);

const handleChange = () => {
  const payload: SearchLightCreateParams = {
    type: MovementEffectsSearchLight.SEARCH_LIGHT,
    props: {
      cycleTime: cycleTime.value,
      offsetFactor: offsetFactor.value,
      radiusFactor: radiusFactor.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([radiusFactor, cycleTime, offsetFactor], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
