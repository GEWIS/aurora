<template>
  <LightsGroupsSelect v-model="lightsGroupIds" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import LightsGroupsSelect from '@/components/lights/effects/button/LightsGroupsSelect.vue';
import type { LightsButtonStrobe } from '@/api';

const props = defineProps<{
  defaultProperties?: LightsButtonStrobe;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonStrobe];
  inputValid: [valid: boolean];
}>();

const lightsGroupIds = ref<number[]>(props.defaultProperties?.lightsGroupIds || []);

const handleChange = () => {
  const properties: LightsButtonStrobe = {
    type: 'LightsButtonStrobe',
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
