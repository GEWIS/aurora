<template>
  <div class="flex flex-row gap-2 justify-center items-center">
    <div v-if="editing">
      <span class="pi pi-pencil text-3xl" />
    </div>
    <div class="flex flex-col gap-1">
      <div>
        <span v-if="button.icon" :class="['pi', button.icon]" />
        {{ button.name }}
      </div>
      <div v-if="button.properties.type === 'LightsButtonColors'" class="flex flex-row gap-1">
        <ColorBox
          v-for="color in (button.properties as LightsButtonColors).colors"
          :key="color"
          :color="colorStore.getHexColor(color as RgbColor)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type LightsButtonColors, type LightsPredefinedEffectResponse, RgbColor } from '@/api';
import ColorBox from '@/components/lights/effects/ColorBox.vue';
import { useColorStore } from '@/stores/color.store';

const colorStore = useColorStore();

defineProps<{
  button: LightsPredefinedEffectResponse;
  editing?: boolean;
}>();
</script>

<style scoped></style>
