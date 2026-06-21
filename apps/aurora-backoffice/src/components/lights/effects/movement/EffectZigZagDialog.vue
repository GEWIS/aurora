<template>
  <EffectSettingsDialog
    can-save
    effect-name="ZigZag"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectZigZag v-model="effect" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ZigZagCreateParams } from '@gewis/aurora-api-client';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectZigZag from '@/components/lights/effects/movement/EffectZigZag.vue';

defineEmits<{
  save: [params: ZigZagCreateParams];
}>();

const effect = ref<ZigZagCreateParams | undefined>();
</script>

<style scoped></style>
