<template>
  <EffectSettingsDialog :can-save="effect.props.colors.length === 1" effect-name="Wave" @save="$emit('save', effect)">
    <EffectWave v-model="effect" :show-colors="true" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectWave from '@/components/lights/effects/color/EffectWave.vue';
import { ColorEffectsWave, LightsEffectDirection, LightsEffectPattern, type WaveCreateParams } from '@/api';

defineEmits<{
  save: [effect: WaveCreateParams];
}>();

const effect = ref<WaveCreateParams>({
  type: ColorEffectsWave.WAVE,
  props: {
    colors: [],
    nrWaves: 1,
    cycleTime: 1000,
    pattern: LightsEffectPattern.HORIZONTAL,
    direction: LightsEffectDirection.FORWARDS,
  },
});
</script>

<style scoped></style>
