<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" />
  <SelectorRatioSlider
    id="background-pulse-ratio"
    :max="1"
    :min="0"
    name="Turn-on ratio (every cycle)"
    :step="0.01"
    :value="ratio"
    @update="(newVal: number) => (ratio = newVal)"
  />
  <SelectorRatioSlider
    id="background-pulse-duration"
    :max="20000"
    :min="0"
    name="Pulse duration (in ms)"
    :step="1000"
    :value="pulseDuration"
    @update="(newVal: number) => (pulseDuration = newVal)"
  />
  <SelectorRatioSlider
    id="background-pulse-cycle-time"
    :max="10000"
    :min="0"
    name="Cycle time (in ms)"
    :step="100"
    :value="cycleTime"
    @update="(newVal: number) => (cycleTime = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { type BackgroundPulseCreateParams, ColorEffectsBackgroundPulse, RgbColor } from '@/api';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: BackgroundPulseCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: BackgroundPulseCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue?.props.colors || []);
const ratio = ref<number>(props.defaultModelValue?.props.ratio || 0.05);
const pulseDuration = ref<number>(props.defaultModelValue?.props.pulseDuration || 8000);
const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 800);

const handleChange = () => {
  const payload: BackgroundPulseCreateParams = {
    type: ColorEffectsBackgroundPulse.BACKGROUND_PULSE,
    props: {
      colors: colors.value,
      ratio: ratio.value,
      pulseDuration: pulseDuration.value,
      cycleTime: cycleTime.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([colors, ratio, pulseDuration, cycleTime], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
