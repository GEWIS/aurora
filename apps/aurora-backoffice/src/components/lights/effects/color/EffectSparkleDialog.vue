<template>
  <EffectSettingsDialog
    :can-save="!!effect && effect.props.colors.length > 0"
    effect-name="Sparkle"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectSparkle v-model="effect" show-colors />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectSparkle from '@/components/lights/effects/color/EffectSparkle.vue';
import type { SparkleCreateParams } from '@/api';

defineEmits<{
  save: [params: SparkleCreateParams];
}>();

const effect = ref<SparkleCreateParams | undefined>();
</script>

<style scoped></style>
