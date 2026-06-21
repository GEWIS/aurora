<template>
  <div v-if="store.getCurrentPlayer !== undefined" class="flex flex-col gap-2">
    <div class="text-2xl text-center font-semibold">{{ store.getCurrentPlayer.name }}'s final score</div>
    <div class="w-max-lg mx-auto">
      <table>
        <tbody>
          <tr>
            <td class="font-bold pr-8">Time:</td>
            <td>
              {{ stopwatch }}
            </td>
          </tr>
          <tr>
            <td class="font-bold pr-8">Position:</td>
            <td>{{ position }} / {{ store.scoreboard.length }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ScoreboardItem } from '@/api';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import { toStopwatchString } from '@/utils/timeUtils';

const store = useTimeTrailRaceStore();

const position = computed(() => {
  return (store.scoreboard.findIndex((s) => s.uuid === store.currentPlayer?.uuid) ?? -2) + 1;
});

const stopwatch = computed(() => {
  if (!store.getCurrentPlayer) return '';
  const time = (store.getCurrentPlayer as ScoreboardItem).timeMs;
  if (!time) return '';
  return toStopwatchString(time);
});
</script>

<style scoped></style>
