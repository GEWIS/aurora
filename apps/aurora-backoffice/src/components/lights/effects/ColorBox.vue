<template>
  <div class="color-box border-1" :style="{ 'background-color': color }" />
</template>

<script setup lang="ts">
defineProps<{
  color: string;
}>();
</script>

<style scoped>
.color-box {
  width: 1rem;
  height: 1rem;
}
</style>
