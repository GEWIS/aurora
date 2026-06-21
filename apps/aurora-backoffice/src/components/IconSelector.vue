<template>
  <Select
    id="icon-selector"
    class="w-full"
    filter
    filter-match-mode="contains"
    :model-value="modelValue"
    option-label="name"
    option-value="value"
    :options="options"
    placeholder="Icon (optional)"
    show-clear
    :virtual-scroller-options="{ itemSize: 40 }"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <template #value="slotProps">
      <div v-if="slotProps.value" class="flex items-center gap-2">
        <i :class="slotProps.value" />
        {{ getNameFromValue(slotProps.value) }}
      </div>
      <div v-else>{{ slotProps.placeholder }}</div>
    </template>
    <template #option="slotProps">
      <div v-if="slotProps.option.value" class="flex items-center gap-2">
        <i :class="slotProps.option.value" />
        {{ slotProps.option.name }}
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { PrimeIcons } from '@primevue/core/api';
import { computed } from 'vue';

defineProps<{
  modelValue?: string;
}>();

defineEmits<{
  'update:modelValue': [icon: string];
}>();

const getNameFromValue = (value: string) => {
  const nameParts: string[] = value.split(' ')[1].split('-');
  nameParts.splice(0, 1);
  let name = nameParts.join(' ');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name;
};

const options = computed(() => {
  return Object.values(PrimeIcons).map((value: string) => {
    const name = getNameFromValue(value);
    return { value, name };
  });
});
</script>

<style scoped></style>
