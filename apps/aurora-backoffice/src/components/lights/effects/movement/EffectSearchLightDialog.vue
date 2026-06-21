<template>
  <EffectSettingsDialog
    can-save
    effect-name="SearchLight"
    @save="
      () => {
        if (effect) $emit('save', effect);
      }
    "
  >
    <EffectSearchLight v-model="effect" />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectSearchLight from '@/components/lights/effects/movement/EffectSearchLight.vue';
import type { SearchLightCreateParams } from '@/api';

defineEmits<{
  save: [params: SearchLightCreateParams];
}>();

const effect = ref<SearchLightCreateParams | undefined>();
</script>

<style scoped></style>
