<template>
  <div class="flex flex-row items-center justify-center gap-2">
    <label for="poster-borrel-mode-switch">Borrel mode</label>
    <ToggleSwitch
      id="poster-borrel-mode-switch"
      :disabled="store.loading || !isPrivileged"
      :model-value="store.enabled"
      @change="store.set(!store.enabled)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBorrelModeStore } from '@/stores/borrel-mode.store';
import { useAuthStore } from '@/stores/auth.store';

const store = useBorrelModeStore();
const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));
</script>

<style scoped></style>
