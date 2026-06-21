<template>
  <Select
    id="controller-button-color-effect"
    v-model="chosenEffect"
    option-label="label"
    option-value="value"
    :options="effectOptions"
    placeholder="Select an effect..."
  />
  <LightsGroupsSelect v-model="lightsGroupIds" />
  <Divider />
  <EffectBackgroundPulse
    v-if="chosenEffect === ColorEffectsBackgroundPulse.BACKGROUND_PULSE"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsBackgroundPulse.BACKGROUND_PULSE
        ? defaultProperties.effectProps
        : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
  <EffectBeatFadeOut
    v-if="chosenEffect === ColorEffectsBeatFadeOut.BEAT_FADE_OUT"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsBeatFadeOut.BEAT_FADE_OUT
        ? defaultProperties.effectProps
        : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
  <EffectRandomColor
    v-if="chosenEffect === ColorEffectsRandomColor.RANDOM_COLOR"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsRandomColor.RANDOM_COLOR
        ? defaultProperties.effectProps
        : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
  <EffectSparkle
    v-if="chosenEffect === ColorEffectsSparkle.SPARKLE"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsSparkle.SPARKLE ? defaultProperties.effectProps : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
  <EffectStaticColor
    v-if="chosenEffect === ColorEffectsStaticColor.STATIC_COLOR"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsStaticColor.STATIC_COLOR
        ? defaultProperties.effectProps
        : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
  <EffectWave
    v-if="chosenEffect === ColorEffectsWave.WAVE"
    :default-model-value="
      defaultProperties?.effectProps.type === ColorEffectsWave.WAVE ? defaultProperties.effectProps : undefined
    "
    :show-colors="false"
    @update:model-value="(e) => (effect = e)"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  ColorEffectsBackgroundPulse,
  ColorEffectsBeatFadeOut,
  ColorEffectsRandomColor,
  ColorEffectsSparkle,
  ColorEffectsStaticColor,
  ColorEffectsWave,
  type LightsButtonEffectColor,
  type LightsEffectsColorCreateParams,
} from '@/api';
import LightsGroupsSelect from '@/components/lights/effects/button/LightsGroupsSelect.vue';
import EffectBeatFadeOut from '@/components/lights/effects/color/EffectBeatFadeOut.vue';
import EffectWave from '@/components/lights/effects/color/EffectWave.vue';
import EffectStaticColor from '@/components/lights/effects/color/EffectStaticColor.vue';
import EffectSparkle from '@/components/lights/effects/color/EffectSparkle.vue';
import EffectBackgroundPulse from '@/components/lights/effects/color/EffectBackgroundPulse.vue';
import EffectRandomColor from '@/components/lights/effects/color/EffectRandomColor.vue';

const props = defineProps<{
  defaultProperties?: LightsButtonEffectColor;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonEffectColor];
  inputValid: [valid: boolean];
}>();

const chosenEffect = ref<LightsEffectsColorCreateParams['type'] | undefined>(props.defaultProperties?.effectProps.type);
const lightsGroupIds = ref<number[]>(props.defaultProperties?.lightsGroupIds || []);
const effect = ref<LightsEffectsColorCreateParams | undefined>(props.defaultProperties?.effectProps || undefined);

const effectOptions = computed(() => {
  return [
    { label: 'Background pulse', value: ColorEffectsBackgroundPulse.BACKGROUND_PULSE },
    { label: 'BeatFadeOut', value: ColorEffectsBeatFadeOut.BEAT_FADE_OUT },
    { label: 'Random color', value: ColorEffectsRandomColor.RANDOM_COLOR },
    { label: 'Sparkle', value: ColorEffectsSparkle.SPARKLE },
    { label: 'Static color', value: ColorEffectsStaticColor.STATIC_COLOR },
    { label: 'Wave', value: ColorEffectsWave.WAVE },
  ];
});

const handleChange = () => {
  const inputIsValid: boolean = chosenEffect.value !== undefined && lightsGroupIds.value.length > 0;
  emit('inputValid', inputIsValid);

  if (effect.value === undefined) return;
  const properties: LightsButtonEffectColor = {
    type: 'LightsButtonEffectColor',
    lightsGroupIds: lightsGroupIds.value,
    effectProps: effect.value,
  };
  emit('update:modelValue', properties);
};

watch([chosenEffect, lightsGroupIds, effect], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
