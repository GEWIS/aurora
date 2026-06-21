<template>
  <Tag v-tooltip.bottom="{ value: description }" severity="secondary">{{ props.label }}</Tag>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  description: string;
}>();
</script>

<style scoped></style>
