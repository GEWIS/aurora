<template>
  <div class="relative text-sm">
    <i :class="['pi cursor-pointer', statusIcon]" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" />
    <div v-if="showTooltip" class="tooltip absolute left-full top-0 ml-2 whitespace-nowrap rounded px-2 py-1 z-10">
      <div v-if="connected && status">
        <div>{{ timeStatus }}</div>
        <div>Latency: {{ latency }}</div>
        <div>Uptime: {{ uptime }}</div>
      </div>
      <div v-else>
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue';
import type { Status } from '@/stores/status.store';
import type {
  AudioResponse,
  LightsControllerResponse,
  PartialRecordSocketioNamespacesString,
  ScreenResponse,
} from '@/api';

const props = defineProps<{
  subscriber: AudioResponse | ScreenResponse | LightsControllerResponse;
  status: Status | undefined;
}>();

const showTooltip = ref(false);
const connected: ComputedRef<boolean> = computed(() => {
  const socketIds = props.subscriber.socketIds as PartialRecordSocketioNamespacesString;
  return Object.entries(socketIds ?? {}).length > 0;
});

const timeDrift: ComputedRef<number> = computed(() => {
  const { coreTimestamp, systemTimestamp } = props.status ?? {};
  if (!coreTimestamp || !systemTimestamp) return 0;
  return Math.round((coreTimestamp - systemTimestamp) / 1000);
});

const isSynced: ComputedRef<boolean> = computed(() => {
  const latency = props.status?.latencyMilliseconds ?? Infinity;
  return timeDrift.value === 0 && latency < 100;
});

const timeStatus: ComputedRef<string> = computed(() => {
  const systemTimestamp = props.status?.systemTimestamp;
  if (!systemTimestamp) return 'N/A';

  const systemTime = new Date(systemTimestamp).toLocaleTimeString();
  const drift = timeDrift.value;

  if (drift === 0) {
    return `${systemTime} (synchronized)`;
  }

  const direction = drift > 0 ? 'behind' : 'ahead';
  return `${systemTime} (${Math.abs(drift)}s ${direction})`;
});

const latency: ComputedRef<string> = computed(() =>
  props.status?.latencyMilliseconds != null ? `${props.status.latencyMilliseconds}ms` : 'N/A',
);

const uptime: ComputedRef<string> = computed(() =>
  props.status?.uptimeSeconds != null ? formatDuration(props.status.uptimeSeconds) : 'N/A',
);

const statusIcon: ComputedRef<string[]> = computed(() => {
  if (!connected.value) return ['pi-sort-alt-slash', 'text-gray-500'];
  if (!props.status || isSynced.value) {
    return ['pi-sort-alt', 'text-green-300'];
  }
  return ['pi-exclamation-triangle', 'text-yellow-300'];
});

const statusText: ComputedRef<string> = computed(() => {
  if (!connected.value) return 'disconnected';
  if (!props.status) return 'status unavailable';
  return 'connected';
});

function formatDuration(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}
</script>

<style lang="scss">
.tooltip {
  background-color: var(--surface-hover);
  color: var(--text-on-surface);
}
</style>
