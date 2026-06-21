<template>
  <EffectSettingsDialog
    :can-save="!!effect && !!effect.props.color"
    effect-name="StaticColor"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectStaticColor v-model="effect" show-colors />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { StaticColorCreateParams } from '@gewis/aurora-api-client';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectStaticColor from '@/components/lights/effects/color/EffectStaticColor.vue';

defineEmits<{
  save: [params: StaticColorCreateParams];
}>();

const effect = ref<StaticColorCreateParams>();
</script>

<style scoped></style>
