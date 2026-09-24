<template>
  <div class="@container col-span-full">
    <h4 class="m-1">
      <template v-if="singleColor">Color</template>
      <template v-else>
        Colors <span class="text-sm font-normal text-muted-color">(pick one or more)</span>
      </template>
    </h4>
    <!-- Equal-width columns that divide the 18 colors evenly, based on the available width.
         The breakpoints leave room for the longest color name ("blindingwhite") -->
    <div class="grid grid-cols-2 @[32rem]:grid-cols-3 @[64rem]:grid-cols-6 gap-1">
      <ToggleButton
        v-for="color in colors"
        :key="color"
        class="p-button-secondary w-full"
        :model-value="modelValue.includes(color as RgbColor)"
        :off-label="color"
        :on-label="color"
        :title="color"
        @click="handleColorClick(color as RgbColor)"
      >
        <template #icon>
          <div class="mr-1 shrink-0">
            <ColorBox :color="store.getHexColor(color as RgbColor)" />
          </div>
        </template>
      </ToggleButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RgbColor } from '@gewis/aurora-api-client';
import { useColorStore } from '@/stores/color.store';
import ColorBox from '@/components/lights/effects/ColorBox.vue';

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

<style scoped>
/* Shorten color names that do not fit instead of letting them overflow the button */
.p-togglebutton,
:deep(.p-togglebutton-content) {
  min-width: 0;
}

:deep(.p-togglebutton-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
