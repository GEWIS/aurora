<template>
  <Button
    :disabled="!isPrivileged || loading"
    icon="pi pi-times"
    label="Clear"
    :loading="loading"
    severity="secondary"
    title="Clear the currently active poster from screen"
    @click="handleClick()"
  />
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
  await store.clearStaticActivePoster();
  loading.value = false;
};
</script>

<style scoped></style>
