<template>
  <EffectSettingsDialog
    :can-save="!!effect && effect.props.colors.length > 0"
    effect-name="Background Pulse"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectBackgroundPulse v-model="effect" show-colors />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import type { BackgroundPulseCreateParams } from '@/api';
import EffectBackgroundPulse from '@/components/lights/effects/color/EffectBackgroundPulse.vue';

defineEmits<{
  save: [params: BackgroundPulseCreateParams];
}>();

const effect = ref<BackgroundPulseCreateParams | undefined>();
</script>

<style scoped></style>
