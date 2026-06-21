<template>
  <div>
    <h4 class="m-1">Color*</h4>
    <div class="flex flex-row flex-wrap gap-1">
      <ToggleButton
        v-for="color in colors"
        :key="color"
        class="p-button-secondary"
        :model-value="modelValue.includes(color as RgbColor)"
        :off-label="color"
        :on-label="color"
        @click="handleColorClick(color as RgbColor)"
      >
        <template #icon>
          <div class="mr-1">
            <ColorBox :color="store.getHexColor(color as RgbColor)" />
          </div>
        </template>
      </ToggleButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColorStore } from '@/stores/color.store';
import ColorBox from '@/components/lights/effects/ColorBox.vue';
import { RgbColor } from '@/api';

const store = useColorStore();

const props = defineProps<{
  singleColor?: boolean;
  modelValue: RgbColor[];
}>();
const emit = defineEmits<{
  'update:modelValue': [colors: RgbColor[]];
}>();

const colors = Object.values(RgbColor);

const handleColorClick = (color: RgbColor) => {
  let selectedColors = [...props.modelValue];
  const i = selectedColors.findIndex((c) => c === color);
  if (props.singleColor) {
    selectedColors = [color];
  } else if (i < 0) {
    selectedColors.push(color);
  } else {
    selectedColors.splice(i, 1);
  }
  emit('update:modelValue', selectedColors);
};
</script>

<style scoped></style>
