<template>
  <SelectorRatioSlider
    id="beats-to-move"
    :max="4"
    :min="1"
    name="Number of beats before changing position"
    :step="1"
    :value="beatsToMove"
    @update="(newVal: number) => (beatsToMove = newVal)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { MovementEffectsRandomPosition, type RandomPositionCreateParams } from '@/api';

const props = defineProps<{
  defaultModelValue?: RandomPositionCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [params: RandomPositionCreateParams];
}>();

const beatsToMove = ref<number>(props.defaultModelValue?.props.beatsToMove || 1);

const handleChange = () => {
  const payload: RandomPositionCreateParams = {
    type: MovementEffectsRandomPosition.RANDOM_POSITION,
    props: {
      beatsToMove: beatsToMove.value,
    },
  };
  emit('update:modelValue', payload);
};

watch([beatsToMove], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
