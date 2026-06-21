<template>
  <MultiSelect
    v-model="switchIds"
    filter
    option-label="name"
    option-value="id"
    :options="store.lightsSwitches"
    placeholder="Select lights..."
    :title="
      store.lightsSwitches
        .filter((a) => switchIds.includes(a.id))
        .map((a) => a.name)
        .join(', ')
    "
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';
import type { LightsButtonSwitch } from '@/api';

const props = defineProps<{
  defaultProperties?: LightsButtonSwitch;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonSwitch];
  inputValid: [valid: boolean];
}>();

const store = useEffectsControllerStore();
const switchIds = ref<number[]>(props.defaultProperties?.switchIds || []);

const handleChange = () => {
  const properties: LightsButtonSwitch = {
    type: 'LightsButtonSwitch',
    switchIds: switchIds.value,
  };
  const inputIsValid: boolean = switchIds.value.length > 0;

  emit('update:modelValue', properties);
  emit('inputValid', inputIsValid);
};

watch([switchIds], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
