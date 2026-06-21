<template>
  <div>
    <div class="w-fit cursor-pointer" @click="$emit('update:modelValue', !modelValue)">
      <Checkbox :id="id" binary :model-value="modelValue" :name="id" />
      <label class="ml-2 cursor-pointer" :for="id">{{ name }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: boolean;
  name: string;
  id: string;
}>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  'update:modelValue': [checked: boolean];
}>();
</script>

<style scoped></style>
