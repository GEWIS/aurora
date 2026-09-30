<template>
  <!-- Float labels only work on text inputs, so the label is placed next to the switch.
       The minimum height matches the (float labelled) inputs next to it -->
  <div class="flex flex-row items-center gap-2 min-h-10">
    <ToggleSwitch
      :input-id="inputId"
      :model-value="modelValue"
      @update:model-value="(value: boolean) => $emit('update:modelValue', value)"
    />
    <label :for="inputId">{{ name }}</label>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  name: string;
  id: string;
}>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  'update:modelValue': [checked: boolean];
}>();

// The same effect settings can be shown multiple times on a page (e.g. in a scene)
const inputId = `${props.id}-${useId()}`;
</script>

<style scoped></style>
