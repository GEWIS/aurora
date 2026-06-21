<template>
  <div class="text-justify">
    You are about to start
    <span class="font-semibold">{{ $props.tape.name }}</span> from
    <span class="font-semibold">{{ $props.tape.artist }}</span
    >. This mixtape has <span class="font-semibold">{{ $props.tape.horns }}</span> horns and a duration of
    <span class="font-semibold">{{ formatDuration($props.tape.duration) }}</span
    >, for an average of 1 horn every <span class="font-semibold">{{ timePerHorn }}</span> seconds.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDuration } from '@/utils/formatterUtils';
import type { MixTapeResponse } from '@/api';

const props = defineProps<{
  tape: MixTapeResponse;
}>();

const timePerHorn = computed(() => Math.round((props.tape.duration / props.tape.horns) * 1000) / 1000);
</script>
