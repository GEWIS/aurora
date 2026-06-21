<template>
  <div class="flex flex-row gap-2 justify-center items-center">
    <label for="static-poster-clock-toggle">Clock</label>
    <ToggleSwitch
      id="static-poster-clock-toggle"
      :disabled="loading || !isPrivileged"
      :model-value="store.static.clockVisible"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosterStore } from '@/stores/poster/poster.store';
import { useAuthStore } from '@/stores/auth.store';

const store = usePosterStore();
const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));

const loading = ref<boolean>(false);

const handleClick = async () => {
  loading.value = true;
  await store.setStaticClockVisibility(!store.static.clockVisible);
  loading.value = false;
};
</script>

<style scoped></style>
