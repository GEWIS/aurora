<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" single-color />
  <SelectorPattern v-model="pattern" />
  <SelectorDirection v-model="direction" />
  <SelectorRatioSlider
    id="waveSize"
    :max="8"
    :min="1"
    name="Number of waves"
    :step="1"
    :value="nrWaves"
    @update="(newVal: number) => (nrWaves = newVal)"
  />
  <SelectorRatioSlider
    id="waveCycleTime"
    :max="5000"
    :min="0"
    name="Cycle time (in ms)"
    :step="100"
    :value="cycleTime"
    @update="(newVal: number) => (cycleTime = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { ColorEffectsWave, LightsEffectDirection, LightsEffectPattern, RgbColor, type WaveCreateParams } from '@/api';
import SelectorDirection from '@/components/lights/effects/props/SelectorDirection.vue';
import SelectorPattern from '@/components/lights/effects/props/SelectorPattern.vue';

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: WaveCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [effect: WaveCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue?.props.colors || []);
const nrWaves = ref<number>(props.defaultModelValue?.props.nrWaves || 1);
const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 1000);
const pattern = ref<LightsEffectPattern>(props.defaultModelValue?.props.pattern || LightsEffectPattern.HORIZONTAL);
const direction = ref<LightsEffectDirection>(
  props.defaultModelValue?.props.direction || LightsEffectDirection.FORWARDS,
);

const handleChange = () => {
  const payload: WaveCreateParams = {
    type: ColorEffectsWave.WAVE,
    props: {
      colors: colors.value,
      nrWaves: nrWaves.value,
      cycleTime: cycleTime.value,
      pattern: pattern.value,
      direction: direction.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([colors, nrWaves, cycleTime, pattern, direction], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
