<template>
  <table class="w-full">
    <tbody>
      <tr v-for="(score, index) in store.scoreboard" :key="score.name">
        <td class="text-right font-bold pr-1">
          {{ index + 1 }}
        </td>
        <td class="text-right font-bold pr-2" :class="score.bac && 'player-bac'">
          <i v-if="score.alcoholFree" class="pi pi-asterisk mr-1" title="Alcohol free" />
          {{ score.name }}
        </td>
        <td>{{ toStopwatchString(score.timeMs) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';
import { toStopwatchString } from '@/utils/timeUtils';

const store = useTimeTrailRaceStore();
</script>

<style scoped>
.player-bac {
  text-shadow: lightgreen 0 0 2px;
}
</style>
