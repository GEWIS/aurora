<template>
  <Card>
    <template #title>
      <div class="flex flex-wrap gap-2 justify-between mb-4 items-center">
        <div class="uppercase mb-0"><i :class="['pi mr-3', icon]" style="font-size: 1.25rem" />{{ title }}</div>
        <div class="flex-1 text-end flex justify-end items-center">
          <slot name="header" />
        </div>
      </div>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
});
</script>

<style scoped></style>
