<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <div class="lg:col-span-3 order-2 lg:order-1">
      <AppContainer icon="pi-image" title="Posters">
        <template #header>
          <PosterOperations />
        </template>
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <InputText v-model="search" class="w-full" placeholder="Search posters by name…" />
          <MultiSelect
            v-model="selectedTypes"
            class="w-full sm:w-72"
            :max-selected-labels="2"
            :options="typeOptions"
            placeholder="All types"
            show-clear
          />
          <MultiSelect
            v-model="selectedStatuses"
            class="w-full sm:w-72"
            :max-selected-labels="2"
            option-label="label"
            option-value="value"
            :options="statusOptions"
            placeholder="All statuses"
            show-clear
          />
        </div>
        <div v-if="posterStore.loading">
          <Spinner />
        </div>
        <div v-else-if="filteredPosters.length === 0" class="text-center italic opacity-70 py-8">
          No posters match the current filters
        </div>
        <div
          v-else
          class="grid auto-rows-fr gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-5"
        >
          <div v-for="poster in filteredPosters" :key="poster.name">
            <PosterCard :poster="poster" />
          </div>
        </div>
      </AppContainer>
    </div>

    <div class="lg:col-span-1 order-1 lg:order-2 flex flex-col gap-4">
      <AppContainer icon="pi-image" title="Static Poster">
        <div class="flex flex-col gap-2">
          <StaticPosterPreview v-if="activeStaticPoster" class="w-full" :poster="activeStaticPoster" />
          <div
            v-else
            class="w-full flex justify-center items-center rounded-lg aspect-video bg-surface-300 text-primary-contrast"
          >
            No active static poster
          </div>
          <div
            class="text-lg font-bold text-ellipsis whitespace-nowrap overflow-hidden"
            :title="activeStaticPoster?.name ?? ''"
          >
            {{ activeStaticPoster?.name ?? '-' }}
          </div>
          <div class="flex flex-row gap-3 items-center">
            <StaticPosterButtonClear />
            <StaticPosterClockToggle />
          </div>
        </div>
      </AppContainer>

      <AppContainer icon="pi-bars" title="Carousel Order">
        <PosterCarouselOrder />
      </AppContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PosterType } from '@/api';
import { getPosterStatus, posterStatusLabels, type PosterStatus } from '@/utils/posterUtils';
import AppContainer from '@/layout/AppContainer.vue';
import { usePosterStore } from '@/stores/poster/poster.store';
import PosterCard from '@/components/poster/PosterCard.vue';
import PosterOperations from '@/components/poster/PosterOperations.vue';
import StaticPosterPreview from '@/components/poster/StaticPosterPreview.vue';
import StaticPosterButtonClear from '@/components/poster/StaticPosterButtonClear.vue';
import StaticPosterClockToggle from '@/components/poster/StaticPosterClockToggle.vue';
import PosterCarouselOrder from '@/components/poster/PosterCarouselOrder.vue';

const posterStore = usePosterStore();
void posterStore.init();

const activeStaticPoster = computed(
  () => posterStore.staticPosters.find((p) => p.id === posterStore.static.activePosterId) ?? null,
);

const search = ref('');
const selectedTypes = ref<PosterType[] | null>([]);
const selectedStatuses = ref<PosterStatus[] | null>([]);

const typeOptions = computed(() => [...new Set(posterStore.posters.map((p) => p.type))].sort());

const statusOptions = Object.entries(posterStatusLabels).map(([value, label]) => ({
  label,
  value,
}));

const filteredPosters = computed(() => {
  const q = search.value.trim().toLowerCase();
  return posterStore.posters.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!selectedTypes.value?.length || selectedTypes.value.includes(p.type)) &&
      (!selectedStatuses.value?.length || selectedStatuses.value.includes(getPosterStatus(p))),
  );
});
</script>

<style scoped></style>
