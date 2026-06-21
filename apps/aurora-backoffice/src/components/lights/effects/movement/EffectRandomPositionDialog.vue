<template>
  <EffectSettingsDialog
    can-save
    effect-name="RandomPosition"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectRandomPosition v-model="effect" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectRandomPosition from '@/components/lights/effects/movement/EffectRandomPosition.vue';
import type { RandomPositionCreateParams } from '@/api';

defineEmits<{
  save: [params: RandomPositionCreateParams];
}>();

const effect = ref<RandomPositionCreateParams | undefined>();
</script>

<style scoped></style>
