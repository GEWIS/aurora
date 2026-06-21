<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" />
  <SelectorPattern v-model="pattern" />
  <SelectorDirection v-model="direction" />
  <SelectorBoolean id="enableFade" v-model="enableFade" name="Enable fade" />
  <SelectorBoolean id="addBlacks" v-model="addBlacks" name="Add blacks" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorBoolean from '@/components/lights/effects/props/SelectorBoolean.vue';
import {
  type BeatFadeOutCreateParams,
  ColorEffectsBeatFadeOut,
  LightsEffectDirection,
  LightsEffectPattern,
  RgbColor,
} from '@/api';
import SelectorPattern from '@/components/lights/effects/props/SelectorPattern.vue';
import SelectorDirection from '@/components/lights/effects/props/SelectorDirection.vue';

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: BeatFadeOutCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: BeatFadeOutCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue?.props.colors || []);
const enableFade = ref<boolean>(props.defaultModelValue?.props.enableFade || false);
const addBlacks = ref<boolean>(props.defaultModelValue?.props.nrBlacks !== 0 || false);
const pattern = ref<LightsEffectPattern>(props.defaultModelValue?.props.pattern || LightsEffectPattern.HORIZONTAL);
const direction = ref<LightsEffectDirection>(
  props.defaultModelValue?.props.direction || LightsEffectDirection.FORWARDS,
);

const handleChange = () => {
  const payload: BeatFadeOutCreateParams = {
    type: ColorEffectsBeatFadeOut.BEAT_FADE_OUT,
    props: {
      colors: colors.value,
      enableFade: enableFade.value,
      nrBlacks: addBlacks.value ? 1 : 0,
      pattern: pattern.value,
      direction: direction.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([colors, enableFade, addBlacks, pattern, direction], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
