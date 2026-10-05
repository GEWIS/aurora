<template>
  <a
    v-if="request.type === PosterTypeExternal.EXTERN"
    class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300 text-primary-contrast flex flex-col gap-2 justify-center items-center p-4 hover:brightness-75 transition duration-200"
    :href="request.uri"
    rel="noopener noreferrer"
    target="_blank"
    :title="request.uri"
  >
    <i class="pi pi-external-link text-2xl" />
    <span class="text-sm truncate max-w-full">{{ host }}</span>
  </a>
  <div
    v-else
    class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300 text-primary-contrast flex justify-center items-center"
  >
    <template v-if="url">
      <img
        v-if="request.type === PosterTypeImage.IMG"
        :alt="request.name"
        class="w-full h-full object-contain"
        :src="url"
      />
      <video v-else class="w-full h-full object-contain" :controls="controls" muted :src="url" />
    </template>
    <span v-else-if="failed" class="text-sm italic">Preview unavailable</span>
    <Spinner v-else class="w-8 h-8" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  type PosterRequestResponse,
  PosterTypeExternal,
  PosterTypeImage,
} from '@gewis/aurora-api-client';
import { usePosterRequestStore } from '@/stores/poster/poster-request.store';

const props = defineProps<{
  request: PosterRequestResponse;
  controls?: boolean;
}>();

const store = usePosterRequestStore();

const url = ref<string | null>(null);
const failed = ref<boolean>(false);

const host = computed(() => {
  try {
    return new URL(props.request.uri ?? '').host;
  } catch {
    return props.request.uri ?? '';
  }
});

onMounted(async () => {
  if (props.request.type === PosterTypeExternal.EXTERN) return;

  // The file is private, so it is fetched with the session and shown through an object URL
  const blob = await store.fetchMedia(props.request.id);
  if (blob) {
    url.value = URL.createObjectURL(blob);
  } else {
    failed.value = true;
  }
});

onBeforeUnmount(() => {
  if (url.value) URL.revokeObjectURL(url.value);
});
</script>

<style scoped></style>
