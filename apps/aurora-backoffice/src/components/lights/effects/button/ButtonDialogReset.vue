<template>
  <LightsGroupsSelect v-model="lightsGroupIds" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { LightsButtonReset } from '@/api';
import LightsGroupsSelect from '@/components/lights/effects/button/LightsGroupsSelect.vue';

const props = defineProps<{
  defaultProperties?: LightsButtonReset;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonReset];
  inputValid: [valid: boolean];
}>();

const lightsGroupIds = ref<number[]>(props.defaultProperties?.lightsGroupIds || []);

const handleChange = () => {
  const properties: LightsButtonReset = {
    type: 'LightsButtonReset',
    lightsGroupIds: lightsGroupIds.value,
  };
  const inputIsValid: boolean = lightsGroupIds.value.length > 0;

  emit('update:modelValue', properties);
  emit('inputValid', inputIsValid);
};

watch([lightsGroupIds], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
