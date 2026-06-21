<template>
  <EffectSettingsDialog
    :can-save="!!effect && effect.props.colors.length > 0"
    effect-name="BeatFadeOut"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectBeatFadeOut v-model="effect" show-colors />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import { type BeatFadeOutCreateParams } from '@/api';
import EffectBeatFadeOut from '@/components/lights/effects/color/EffectBeatFadeOut.vue';

defineEmits<{
  save: [params: BeatFadeOutCreateParams];
}>();

const effect = ref<BeatFadeOutCreateParams | undefined>();
</script>

<style scoped></style>
