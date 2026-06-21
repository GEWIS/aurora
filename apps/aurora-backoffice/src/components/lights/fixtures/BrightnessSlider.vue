<template>
  <div v-if="props.lightsGroup" class="rounded flex flex-col gap-4">
    <div class="flex flex-row gap-6 justify-center items-center pl-3">
      <Slider v-model="brightness" class="w-full" :max="1" :min="0" name="brightness" :step="0.01" />
      <InputNumber class="w-1/2" input-class="w-full" :model-value="brightness" size="small" />
    </div>
    <div class="flex flex-row gap-3">
      <Button
        class="w-full"
        :disabled="store.brightnessLoading"
        icon="pi pi-undo"
        label="Reset"
        :loading="store.brightnessLoading"
        severity="secondary"
        @click="handleReset()"
      />
      <Button
        class="w-full"
        :disabled="store.brightnessLoading"
        icon="pi pi-save"
        label="Save"
        :loading="store.brightnessLoading"
        @click="handleSave()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { LightsGroupResponse } from '@/api';
import { useLightsStore } from '@/stores/lights.store';

const store = useLightsStore();

const props = defineProps<{
  lightsGroup: LightsGroupResponse;
}>();

const emit = defineEmits<{
  close: [];
}>();

const initialBrightness = computed<number>(() => {
  const fixtures = [
    ...props.lightsGroup.pars,
    ...props.lightsGroup.movingHeadWheels,
    ...props.lightsGroup.movingHeadRgbs,
  ];
  return fixtures.reduce((m, f) => Math.min(m, f.masterDimmer ?? 1), 1);
});

const brightness = ref<number>(initialBrightness.value);

const handleSave = async () => {
  await store.setLightsGroupBrightness(props.lightsGroup.id, brightness.value);
  emit('close');
};
const handleReset = async () => {
  await store.resetLightsGroupBrightness(props.lightsGroup.id);
  emit('close');
};
</script>

<style scoped></style>
