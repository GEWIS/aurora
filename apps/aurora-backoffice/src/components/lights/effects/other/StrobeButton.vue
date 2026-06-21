<template>
  <Button
    :disabled="store.selectedLightsGroupIds.length === 0"
    @blur="disableStrobe()"
    @mousedown="enableStrobe()"
    @mouseleave="disableStrobe()"
    @mouseup="disableStrobe()"
    @touchend="disableStrobe()"
    @touchstart="enableStrobe()"
  >
    Strobe
  </Button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';

const store = useEffectsControllerStore();
const enabled = ref<boolean>(false);

const enableStrobe = () => {
  enabled.value = true;
  void store.enableStrobe();
};

const disableStrobe = () => {
  if (!enabled.value) return;
  void store.disableStrobe();
  enabled.value = false;
};
</script>

<style scoped></style>
