<template>
  <div class="w-full text-center text-4xl font-bold">{{ timeString }}</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import { toStopwatchString } from '@/utils/timeUtils';

const now = ref(new Date());
const interval = ref<number>();
const timeTrailStore = useTimeTrailRaceStore();

const timeString = computed(() => {
  const totalDiffMs = timeTrailStore.startTime
    ? now.value.getTime() - timeTrailStore.startTime.getTime()
    : Number.NaN;
  return toStopwatchString(totalDiffMs);
});

const setTime = () => {
  now.value = new Date();
};

onMounted(() => {
  interval.value = setInterval(setTime, 20);
});
onUnmounted(() => {
  clearInterval(interval.value);
});
</script>

<style scoped></style>
