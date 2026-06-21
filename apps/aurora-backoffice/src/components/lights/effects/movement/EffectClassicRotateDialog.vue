<template>
  <EffectSettingsDialog
    can-save
    effect-name="ClassicRotate"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectClassicRotate v-model="effect" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectClassicRotate from '@/components/lights/effects/movement/EffectClassicRotate.vue';
import type { ClassicRotateCreateParams } from '@/api';

defineEmits<{
  save: [params: ClassicRotateCreateParams];
}>();

const effect = ref<ClassicRotateCreateParams | undefined>();
</script>

<style scoped></style>
