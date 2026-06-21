<template>
  <div class="flex flex-row items-center justify-center gap-2">
    <label for="poster-borrel-mode-switch">Borrel mode</label>
    <ToggleSwitch
      id="poster-borrel-mode-switch"
      :disabled="store.loading || !isPrivileged"
      :model-value="store.carousel.borrelModeActive"
      @change="store.setBorrelMode!(!store.carousel.borrelModeActive)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePosterStore } from '@/stores/poster/poster.store';
import { useAuthStore } from '@/stores/auth.store';

const store = usePosterStore();
const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));
</script>

<style scoped></style>
