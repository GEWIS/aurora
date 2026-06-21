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
import type { SearchLightCreateParams } from '@gewis/aurora-api-client';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import EffectSearchLight from '@/components/lights/effects/movement/EffectSearchLight.vue';

defineEmits<{
  save: [params: SearchLightCreateParams];
}>();

const effect = ref<SearchLightCreateParams | undefined>();
</script>

<style scoped></style>
