<template>
  <div class="flex flex-col gap-3">
    <div class="flex justify-center">
      <div class="relative bg-cover w-full max-w-sm rounded-2xl justify-center">
        <img :alt="tape!.name" class="w-full rounded-2xl" :src="tape!.coverUrl" />
        <!-- prettier-ignore -->
        <div
          class="group absolute rounded-2xl top-0 w-full h-full flex justify-center items-center
          hover:bg-black/40 hover:backdrop-blur-sm transition duration-200 cursor-pointer"
          :class="{
            'bg-black/40': !store.playing,
            'backdrop-blur-sm': !store.playing
          }"
          @click="
            async () => {
              if (store.playing) {
                await store.pauseCenturion();
              } else {
                await store.startCenturion();
              }
            }
          "
        >
          <div
            class="bg-black rounded-full p-5 group-hover:opacity-100 opacity-0 duration-200"
            :class="{
              '!opacity-100': !store.playing
            }"
          >
            <i
              v-if="store.playing"
              class="pi pi-pause !text-4xl text-white text-center"
            />
            <i
              v-else
              class="pi pi-play !text-4xl text-white text-center translate-x-1"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="text-3xl font-semibold text-center w-full">
      {{ tape!.name }}
    </div>
    <div class="text-xl text-center w-full">
      {{ tape!.artist }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCenturionStore } from '@/stores/modes/centurion.store';
import type { MixTapeResponse } from '@/api';

defineProps<{
  tape?: MixTapeResponse;
}>();

const store = useCenturionStore();
</script>

<style scoped></style>
