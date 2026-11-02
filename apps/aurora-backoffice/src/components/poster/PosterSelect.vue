<template>
  <div>
    <Select
      id="static-poster-select"
      v-model="selectedPosterId"
      filter
      :loading="posterStore.loading"
      option-label="name"
      option-value="id"
      :options="filteredPostersRef"
      placeholder="Choose a poster"
    >
      <template #header>
        <div class="flex flex-col gap-2 p-2">
          <MultiSelect
            v-model="selectedTypes"
            append-to="self"
            class="w-full sm:w-72"
            :max-selected-labels="2"
            :options="typeOptions"
            placeholder="All types"
            show-clear
          />
          <MultiSelect
            v-model="selectedStatuses"
            append-to="self"
            class="w-full sm:w-72"
            :max-selected-labels="2"
            option-label="label"
            option-value="value"
            :options="statusOptions"
            placeholder="All statuses"
            show-clear
          />
        </div>
      </template>

      <template #option="slotProps">
        <div class="flex items-center">
          <StaticPosterPreview class="w-64" :poster="slotProps.option" />
        </div>
      </template>
      <template #value="slotProps">
        <StaticPosterPreview
          v-if="selectedPoster"
          class="w-64 inline-block"
          :poster="selectedPoster"
        />
        <span v-else>{{ slotProps.placeholder }}</span>
      </template>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePosterFilters } from '@/composables/usePosterFilters';
import { usePosterStore } from '@/stores/poster/poster.store';
import StaticPosterPreview from '@/components/poster/StaticPosterPreview.vue';

const posterStore = usePosterStore();
void posterStore.init();

const selectedPosterId = defineModel<{ value?: number | undefined }>();

const selectedPoster = computed(() => {
  return posterStore.staticPosters.find((poster) => poster.id === selectedPosterId.value);
});

const { selectedTypes, selectedStatuses, typeOptions, statusOptions, filteredPosters } =
  usePosterFilters(() => posterStore.staticPosters);
const filteredPostersRef = ref(filteredPosters);
</script>
