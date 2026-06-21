<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" />
  <SelectorBoolean id="addBlacks" v-model="addBlacks" name="Add blacks" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ColorEffectsRandomColor, type RandomColorCreateParams, RgbColor } from '@/api';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorBoolean from '@/components/lights/effects/props/SelectorBoolean.vue';

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: RandomColorCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: RandomColorCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue?.props.colors || []);
const addBlacks = ref<boolean>(props.defaultModelValue?.props.nrBlacks !== 0 || false);

const handleChange = () => {
  const payload: RandomColorCreateParams = {
    type: ColorEffectsRandomColor.RANDOM_COLOR,
    props: {
      colors: colors.value,
      nrBlacks: addBlacks.value ? 1 : 0,
    },
  };
  emit('update:modelValue', payload);
};

watch([colors, addBlacks], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
