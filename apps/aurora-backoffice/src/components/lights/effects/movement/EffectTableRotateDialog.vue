<template>
  <EffectSettingsDialog
    can-save
    effect-name="TableRotate"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectTableRotate v-model="effect" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectTableRotate from '@/components/lights/effects/movement/EffectTableRotate.vue';
import type { TableRotateCreateParams } from '@/api';

defineEmits<{
  save: [params: TableRotateCreateParams];
}>();

const effect = ref<TableRotateCreateParams | undefined>();
</script>

<style scoped></style>
