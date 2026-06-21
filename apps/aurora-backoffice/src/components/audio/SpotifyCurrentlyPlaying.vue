<template>
  <AppContainer icon="pi-headphones" title="Currently playing">
    <div v-if="store.currentlyPlaying != null" class="flex flex-row items-center gap-4">
      <div class="w-32">
        <img
          :alt="store.currentlyPlaying.cover"
          :src="store.currentlyPlaying.cover"
          :style="{ width: '100%', borderRadius: '5px' }"
        />
      </div>
      <div class="flex flex-col gap-1 justify-content-center">
        <span class="text-xl">{{ store.currentlyPlaying?.title }}</span>
        <span class="text-lg">{{ store.currentlyPlaying?.artists.join(', ') }}</span>
      </div>
    </div>
    <div v-else>
      <span class="font-italic">Nothing playing on Spotify at the moment</span>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useCurrentlyPlayingStore } from '@/stores/socket/currently-playing.store';
import AppContainer from '@/layout/AppContainer.vue';

const store = useCurrentlyPlayingStore();
void store.init();

onUnmounted(() => {
  store.destroy();
});
</script>

<style scoped></style>
