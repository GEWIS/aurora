<template>
  <AppBox class="h-full flex flex-col gap-3">
    <div class="relative">
      <PosterMediaGallery
        v-if="poster.type === PosterType.IMG || poster.type === PosterType.VIDEO"
        :files="poster.files"
        :is-video="poster.type === PosterType.VIDEO"
        :name="poster.name"
      />
      <a
        v-else-if="poster.type === PosterType.EXTERN"
        class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300 text-primary-contrast flex justify-center items-center hover:brightness-50 transition duration-200"
        :href="mediaUrl"
        target="_blank"
      >
        {{ capitalize(poster.type) }}
      </a>
      <div
        v-else-if="poster.type === PosterType.PHOTO"
        class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300 text-primary-contrast flex flex-col justify-center items-center"
      >
        <i class="pi pi-images text-2xl" />
        <span>{{ poster.albums?.length ?? 0 }} album(s)</span>
      </div>
      <div
        v-else
        class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300 text-primary-contrast flex justify-center items-center"
      >
        {{ capitalize(poster.type) }}
      </div>
      <PosterStatusIndicator class="absolute top-2 right-2 z-10 ring-2 ring-black/30" :poster="poster" />
    </div>

    <div class="flex flex-col gap-1 min-w-0">
      <div class="font-bold truncate" :title="poster.name">
        {{ poster.name }}
      </div>
      <div
        v-if="poster.type !== PosterType.PHOTO"
        class="min-h-[1.25rem] text-sm truncate"
        :class="poster.label ? 'opacity-70' : 'opacity-40 italic'"
      >
        {{ poster.label || '(no title)' }}
      </div>
      <div class="text-xs italic opacity-50">
        <i class="pi pi-clock" />
        {{ poster.defaultTimeout }} seconds
      </div>
    </div>

    <div class="mt-auto flex flex-row items-center gap-2">
      <span v-tooltip.top="poster.trello ? 'Managed via Trello' : undefined" class="flex-1 flex">
        <PosterButtonDelete :disabled="poster.trello || !isPrivileged" :poster="poster" />
      </span>
      <span v-tooltip.top="poster.trello ? 'Managed via Trello' : undefined" class="flex-1 flex">
        <PosterEdit :disabled="poster.trello || !isPrivileged" :poster="poster" />
      </span>
      <StaticPosterButtonShow :disabled="poster.type === PosterType.PHOTO || !isPrivileged" :poster="poster" />
    </div>
  </AppBox>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type PosterResponse, PosterType } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import AppBox from '@/layout/AppBox.vue';
import PosterButtonDelete from '@/components/poster/PosterButtonDelete.vue';
import PosterEdit from '@/components/poster/PosterEdit.vue';
import PosterMediaGallery from '@/components/poster/PosterMediaGallery.vue';
import PosterStatusIndicator from '@/components/poster/PosterStatusIndicator.vue';
import StaticPosterButtonShow from '@/components/poster/StaticPosterButtonShow.vue';

const props = defineProps<{
  poster: PosterResponse;
}>();

const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));

const mediaUrl = computed(() => props.poster.files?.[0]?.location ?? props.poster.uri ?? '');

const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
</script>
