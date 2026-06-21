<template>
  <div v-if="orderedPosters.length === 0" class="text-center italic opacity-70 py-4">No posters to order</div>
  <ul v-else class="flex flex-col gap-1">
    <li
      v-for="(poster, index) in orderedPosters"
      :key="poster.id"
      class="flex items-center gap-2 w-full px-2 py-2 rounded select-none border border-surface"
      :class="{
        'cursor-move': isPrivileged,
        'cursor-default': !isPrivileged,
        'opacity-50': dragIndex === index,
        'opacity-40 grayscale': isPosterInactive(poster),
      }"
      :draggable="isPrivileged"
      @dragend="onDragEnd"
      @dragenter.prevent="onDragEnter(index)"
      @dragover.prevent
      @dragstart="onDragStart(index)"
      @drop="onDrop"
    >
      <i class="pi pi-bars opacity-40 shrink-0" />
      <span class="flex-1 text-ellipsis whitespace-nowrap overflow-hidden" :title="poster.name">
        {{ poster.name }}
      </span>
      <Tag class="shrink-0 text-xs" severity="secondary" :value="poster.type" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { type PosterResponse } from '@/api';
import { usePosterStore } from '@/stores/poster/poster.store';
import { useAuthStore } from '@/stores/auth.store';

const store = usePosterStore();
const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));

const isPosterInactive = (poster: PosterResponse): boolean => {
  if (!poster.enabled) return true;
  if (poster.borrelMode && !store.carousel.borrelModeActive) return true;
  return false;
};

const orderedPosters = ref<PosterResponse[]>([]);
const dragIndex = ref<number | null>(null);

const isDateIneligible = (poster: PosterResponse): boolean => {
  const now = new Date();
  if (poster.startDate && new Date(poster.startDate) > now) return true;
  if (poster.expirationDate && new Date(poster.expirationDate) < now) return true;
  return false;
};

const buildOrdered = () => {
  const byId = new Map(store.posters.map((p) => [p.id, p]));
  const ordered: PosterResponse[] = [];
  const seen = new Set<number>();
  for (const id of store.carousel.carouselOrder) {
    const poster = byId.get(id);
    if (poster && !isDateIneligible(poster)) {
      ordered.push(poster);
      seen.add(id);
    }
  }
  for (const poster of store.posters) {
    if (!seen.has(poster.id) && !isDateIneligible(poster)) ordered.push(poster);
  }
  orderedPosters.value = ordered;
};

watch(() => [store.posters, store.carousel.carouselOrder], buildOrdered, { immediate: true, deep: true });

const onDragStart = (index: number) => {
  dragIndex.value = index;
};

const onDragEnter = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return;
  const items = orderedPosters.value;
  const [moved] = items.splice(dragIndex.value, 1);
  items.splice(index, 0, moved);
  dragIndex.value = index;
};

const onDrop = () => {
  if (!isPrivileged.value) return;
  void store.setPosterOrder(orderedPosters.value.map((p) => p.id));
  dragIndex.value = null;
};

const onDragEnd = () => {
  dragIndex.value = null;
};
</script>

<style scoped></style>
