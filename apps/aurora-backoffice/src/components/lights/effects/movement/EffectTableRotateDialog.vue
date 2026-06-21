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
import type { TableRotateCreateParams } from '@gewis/aurora-api-client';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectTableRotate from '@/components/lights/effects/movement/EffectTableRotate.vue';

defineEmits<{
  save: [params: TableRotateCreateParams];
}>();

const effect = ref<TableRotateCreateParams | undefined>();
</script>

<style scoped></style>
