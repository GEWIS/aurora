<template>
  <div class="w-full aspect-video rounded-lg overflow-hidden bg-surface-300">
    <template v-if="files.length">
      <Galleria
        v-model:active-index="activeIndex"
        :circular="files.length > 1"
        container-class="w-full h-full"
        :num-visible="1"
        :show-indicators="files.length > 1"
        :show-item-navigators="files.length > 1"
        :show-thumbnails="false"
        :value="files"
      >
        <template #item="{ item }">
          <div class="w-full aspect-video">
            <img
              v-if="!isVideo"
              :alt="name"
              class="w-full h-full object-cover cursor-zoom-in"
              :src="item.location"
              @click="openFullscreen"
            />
            <video v-else :key="item.location" class="w-full h-full object-cover" controls muted>
              <source :src="item.location" />
            </video>
          </div>
        </template>
      </Galleria>

      <Galleria
        v-model:active-index="activeIndex"
        v-model:visible="fullscreenVisible"
        :circular="files.length > 1"
        :full-screen="true"
        :pt="{
          closeButton: {
            class:
              'z-[1100] flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white transition',
          },
        }"
        :show-indicators="files.length > 1"
        :show-item-navigators="files.length > 1"
        :show-thumbnails="false"
        :value="files"
      >
        <template #closeicon>
          <i class="pi pi-times text-xl" />
        </template>
        <template #item="{ item }">
          <img v-if="!isVideo" :alt="name" class="max-h-screen max-w-full object-contain" :src="item.location" />
          <video v-else :key="item.location" class="max-h-screen max-w-full object-contain" controls>
            <source :src="item.location" />
          </video>
        </template>
      </Galleria>
    </template>
    <div v-else class="w-full h-full flex justify-center items-center text-primary-contrast">
      <i class="pi pi-image text-2xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Galleria from 'primevue/galleria';
import type { FileResponse } from '@/api';

defineProps<{
  files: FileResponse[];
  name: string;
  isVideo?: boolean;
}>();

const activeIndex = ref(0);
const fullscreenVisible = ref(false);

const openFullscreen = () => {
  fullscreenVisible.value = true;
};
</script>
