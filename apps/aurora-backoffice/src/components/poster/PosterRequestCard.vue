<template>
  <AppBox class="h-full flex flex-col gap-3">
    <PosterRequestMedia :request="request" />

    <div class="flex flex-col gap-1 min-w-0">
      <div class="font-bold truncate" :title="request.name">
        {{ request.name }}
      </div>
      <div class="text-sm opacity-70 truncate" :title="requester">
        {{ requester }}
      </div>
      <div class="text-xs italic opacity-50">
        <i class="pi pi-calendar" />
        {{ formatPosterPeriod(request.startDate, request.expirationDate) }}
      </div>
      <div class="text-xs italic opacity-50">
        <i class="pi pi-inbox" />
        Received {{ formatPosterDate(request.createdAt) }}
      </div>
      <div v-if="request.message" class="text-xs opacity-70 line-clamp-2" :title="request.message">
        <i class="pi pi-comment" />
        {{ request.message }}
      </div>
    </div>

    <div class="mt-auto flex flex-row items-center gap-2">
      <PosterRequestReview :request="request" />
    </div>
  </AppBox>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PosterRequestResponse } from '@gewis/aurora-api-client';
import AppBox from '@/layout/AppBox.vue';
import PosterRequestMedia from '@/components/poster/PosterRequestMedia.vue';
import PosterRequestReview from '@/components/poster/PosterRequestReview.vue';
import { formatPosterDate, formatPosterPeriod } from '@/utils/posterUtils';

const props = defineProps<{
  request: PosterRequestResponse;
}>();

const requester = computed(() =>
  props.request.requesterAssociation
    ? `${props.request.requesterName} (${props.request.requesterAssociation})`
    : props.request.requesterName,
);
</script>

<style scoped></style>
