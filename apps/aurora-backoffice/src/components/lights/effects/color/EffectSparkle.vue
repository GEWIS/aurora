<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" />
  <SelectorRatioSlider
    id="sparkle-ratio"
    :max="1"
    :min="0"
    name="Turn-on ratio (every cycle)"
    :step="0.05"
    :value="ratio"
    @update="(newVal: number) => (ratio = newVal)"
  />
  <SelectorRatioSlider
    id="sparkle-dimDuration"
    :max="2000"
    :min="0"
    name="Turn-off time (in ms)"
    :step="25"
    :value="dimDuration"
    @update="(newVal: number) => (dimDuration = newVal)"
  />
  <SelectorRatioSlider
    id="sparkle-cycleTime"
    :max="2000"
    :min="0"
    name="Cycle time (in ms)"
    :step="25"
    :value="cycleTime"
    @update="(newVal: number) => (cycleTime = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { ColorEffectsSparkle, RgbColor, type SparkleCreateParams } from '@/api';

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: SparkleCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [params: SparkleCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue?.props.colors || []);
const ratio = ref<number>(props.defaultModelValue?.props.ratio || 0.2);
const dimDuration = ref<number>(props.defaultModelValue?.props.dimDuration || 800);
const cycleTime = ref<number>(props.defaultModelValue?.props.cycleTime || 200);

const handleChange = () => {
  const payload: SparkleCreateParams = {
    type: ColorEffectsSparkle.SPARKLE,
    props: {
      colors: colors.value,
      ratio: ratio.value,
      dimDuration: dimDuration.value,
      cycleTime: cycleTime.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([colors, ratio, dimDuration, cycleTime], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
