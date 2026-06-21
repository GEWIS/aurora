<template>
  <ul class="list-disc list-inside">
    <li v-if="$props.selectedAudios.length > 0">
      Audio will be played from
      <span class="font-semibold">{{ formatArray(audios.map((x) => x.name)) }}</span>
    </li>
    <li v-if="$props.selectedScreens.length > 0">
      Visuals will be displayed on
      <span class="font-semibold">{{ formatArray(screens.map((x) => x.name)) }}</span>
    </li>
    <li v-if="$props.selectedLightGroups.length > 0">
      Light effects will be displayed on
      <span class="font-semibold">{{ formatArray(lightGroups.map((x) => x.name)) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSubscriberStore } from '@/stores/subscriber.store';

const subscriberStore = useSubscriberStore();

const props = defineProps<{
  selectedAudios: number[];
  selectedScreens: number[];
  selectedLightGroups: number[];
}>();

const audios = computed(() => subscriberStore.audios.filter((a) => props.selectedAudios.includes(a.id)));
const screens = computed(() => subscriberStore.screens.filter((a) => props.selectedScreens.includes(a.id)));
const lightGroups = computed(() =>
  subscriberStore.lightsGroups.filter((a) => props.selectedLightGroups.includes(a.id)),
);

function formatArray(array: string[]): string {
  if (array.length === 0) return '';
  if (array.length === 1) return array[0];
  return `${array.slice(0, -1).join(', ')} & ${array[array.length - 1]}`;
}
</script>
