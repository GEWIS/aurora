<template>
  <SelectorLightsColor v-model="colors" />
  <span class="mt-4 italic">* Lights groups to immediately apply the color to</span>
  <LightsGroupsSelect v-model="lightsGroupIds" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import { type LightsButtonColors, RgbColor } from '@/api';
import LightsGroupsSelect from '@/components/lights/effects/button/LightsGroupsSelect.vue';

const props = defineProps<{
  defaultProperties?: LightsButtonColors;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonColors];
  inputValid: [valid: boolean];
}>();

const colors = ref<RgbColor[]>(props.defaultProperties?.colors || []);
const lightsGroupIds = ref<number[]>(props.defaultProperties?.lightsGroupIds || []);

const handleChange = () => {
  const properties: LightsButtonColors = {
    type: 'LightsButtonColors',
    colors: colors.value,
    lightsGroupIds: lightsGroupIds.value.length > 0 ? lightsGroupIds.value : undefined,
  };
  const inputIsValid: boolean = colors.value.length > 0;

  emit('update:modelValue', properties);
  emit('inputValid', inputIsValid);
};

watch([colors, lightsGroupIds], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
