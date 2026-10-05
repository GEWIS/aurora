<template>
  <AppContainer icon="pi-inbox" title="Poster requests">
    <p class="mt-0 mb-4 opacity-70">
      Posters submitted through an integration, such as a website form. Review a request to check
      and adjust it before approving it into the carousel, or deny it.
    </p>
    <div v-if="store.loading">
      <Spinner />
    </div>
    <div v-else-if="store.requests.length === 0" class="text-center italic opacity-70 py-8">
      No pending poster requests
    </div>
    <div
      v-else
      class="grid auto-rows-fr gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-5"
    >
      <div v-for="request in store.requests" :key="request.id">
        <PosterRequestCard :request="request" />
      </div>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import AppContainer from '@/layout/AppContainer.vue';
import PosterRequestCard from '@/components/poster/PosterRequestCard.vue';
import { usePosterRequestStore } from '@/stores/poster/poster-request.store';
import { usePosterStore } from '@/stores/poster/poster.store';

const store = usePosterRequestStore();
// Refresh on every visit, in case the store was initialized a while ago
void (store.initialized ? store.fetchRequests() : store.init());

// Needed to know whether borrel mode is present, and to show approved posters in the poster list
void usePosterStore().init();
</script>

<style scoped></style>
