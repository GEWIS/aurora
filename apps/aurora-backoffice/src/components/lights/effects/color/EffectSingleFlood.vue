<template>
  <EffectSettingsDialog can-save effect-name="SingleFlood" @save="handleAddEffect">
    <SelectorRatioSlider
      id="dimMilliseconds"
      :max="3000"
      :min="0"
      name="Dim time (in ms)"
      :step="100"
      :value="dimMilliseconds"
      @update="(newVal: number) => (dimMilliseconds = newVal)"
    />
  </EffectSettingsDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ColorEffectsSingleFlood } from '@gewis/aurora-api-client';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';
import EffectSettingsDialog from '@/components/lights/effects/EffectSettingsDialog.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';

const store = useEffectsControllerStore();

const dimMilliseconds = ref<number>(500);

const handleAddEffect = async () => {
  await store.setColorEffect({
    type: ColorEffectsSingleFlood.SINGLE_FLOOD,
    props: {
      dimMilliseconds: dimMilliseconds.value,
    },
  });
};
</script>

<style scoped></style>
