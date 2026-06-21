<template>
  <template v-if="development">
    <slot />
  </template>
</template>

<script setup lang="ts">
const development = import.meta.env.VITE_NODE_ENV === 'development';
</script>
