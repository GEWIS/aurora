<template>
  <Menu class="!border-none columns-1 sm:columns-2" :model="timelineItems">
    <template #item="{ item: event, props: menuProps }">
      <a class="flex justify-between" v-bind="menuProps.action">
        <div class="flex gap-4">
          <span v-if="event.timestamp"
            ><b>{{ event.timestamp }}</b></span
          >
          <div class="flex gap-2 align-middle">
            <div v-if="'songs' in event">
              <div class="flex flex-col gap-4">
                <span v-if="event.icon" :class="event.icon + ' mr-1'" />
                <div v-for="song in event.songs" :key="song" class="flex flex-col gap-2">
                  <i>{{ song.artist }}</i>
                  <span>{{ song.title }}</span>
                </div>
              </div>
            </div>
            <div v-else>
              <span v-if="event.icon" :class="event.icon + ' mr-1'" />
              {{ event.label }}
            </div>
          </div>
        </div>
        <span v-if="event.disabled" class="pi pi-spin pi-spinner" />
      </a>
      <divider v-if="!Array.isArray(event.label)" />
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from 'primevue/menuitem';
import { useCenturionStore } from '@/stores/modes/centurion.store';
import type { MixTapeResponse, SongData, SongEvent } from '@/api';
import { formatDuration } from '@/utils/formatterUtils';

interface TimelineItem extends MenuItem {
  songs?: Array<SongData>;
  timestamp: string;
}

const store = useCenturionStore();

const props = defineProps<{
  tape?: MixTapeResponse;
}>();

const getTracks = (event: SongEvent): Array<SongData> => {
  let tracks = event.data;
  if (!Array.isArray(tracks)) tracks = [tracks];
  return tracks;
};

const timelineItems = computed((): Array<TimelineItem> => {
  const startItem: TimelineItem = {
    timestamp: formatDuration(0),
    disabled: store.skipping,
    command: () => {
      void store.skipCenturion(0);
    },
    label: 'Start',
  };

  const events =
    props.tape?.events.reduce((timelineItems, event) => {
      const timelineItem: TimelineItem = {
        timestamp: formatDuration(event.timestamp),
        disabled: store.skipping,
        command: () => {
          void store.skipCenturion(event.timestamp);
        },
      };

      if (event.type === 'horn') {
        timelineItem.label = event.data.counter.toString();
        timelineItem.icon = 'pi pi-volume-up';
      }

      if (event.type === 'song') {
        timelineItem.songs = getTracks(event as unknown as SongEvent);
      }

      timelineItems.push(timelineItem);
      return timelineItems;
    }, [] as Array<TimelineItem>) ?? [];

  return [startItem, ...events];
});
</script>

<style scoped></style>
