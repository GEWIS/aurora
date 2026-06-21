<template>
  <template v-if="overlap">
    <slot />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ISecurityGroups, type ISecuritySections } from '@/api';
import { useAuthStore } from '@/stores/auth.store';

const props = defineProps<{
  group: keyof ISecurityGroups;
  section: keyof ISecuritySections;
}>();

const authStore = useAuthStore();

const overlap = computed(() => {
  return authStore.isInSecurityGroup(props.group, props.section);
});
</script>
