<template>
  <EffectSettingsDialog
    :can-save="!!effect && effect.props.colors.length > 0"
    effect-name="Random Color"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectRandomColor v-model="effect" show-colors />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RandomColorCreateParams } from '@/api';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectRandomColor from '@/components/lights/effects/color/EffectRandomColor.vue';

defineEmits<{
  save: [params: RandomColorCreateParams];
}>();

const effect = ref<RandomColorCreateParams | undefined>();
</script>

<style scoped></style>
