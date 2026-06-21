<template>
  <div>
    <Button :disabled="disabled" :loading="loading" severity="success" @click="$emit('click')"> Save changes </Button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  disabled: boolean;
  loading: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style scoped></style>
