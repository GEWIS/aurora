<template>
  <Button
    :disabled="user.active || loading"
    icon="pi pi-user-plus"
    :loading="loading"
    :title="user.active ? 'User already active' : 'Make user active'"
    @click="handleClick()"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SpotifyUserResponse } from '@/api';
import { useSpotifyStore } from '@/stores/spotify.store';

const store = useSpotifyStore();

const props = defineProps<{
  user: SpotifyUserResponse;
}>();

const loading = ref<boolean>(false);

const handleClick = async () => {
  loading.value = true;
  await store.makeUserActive(props.user);
  loading.value = false;
};
</script>

<style scoped></style>
