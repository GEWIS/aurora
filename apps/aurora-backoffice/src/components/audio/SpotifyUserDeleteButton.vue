<template>
  <Button icon="pi pi-times" severity="danger" @click="confirmRef?.confirmDialog" />
  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Delete"
    delete
    :loading="loading"
    :message="confirmMessage"
    :on-accept="
      () => {
        loading = true;
        store.deleteSpotifyUser(user.id).finally(() => {
          loading = false;
        });
      }
    "
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSpotifyStore } from '@/stores/spotify.store';
import type { SpotifyUserResponse } from '@/api';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';

const store = useSpotifyStore();

const props = defineProps<{
  user: SpotifyUserResponse;
}>();

const confirmRef = ref();
const loading = ref<boolean>(false);
const confirmMessage = computed<string>(() => {
  return `Are you sure you want to delete Spotify user "${props.user.name}"?`;
});
</script>

<style scoped></style>
