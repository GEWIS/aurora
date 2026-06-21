<template>
  <div class="flex flex-row gap-1 beat-visualizer">
    <i :class="beat ? 'pi pi-circle' : 'pi pi-circle-fill'" />
    <i :class="beat ? 'pi pi-circle-fill' : 'pi pi-circle'" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useMusicBeatStore } from '@/stores/socket/music-beat.store';

const { beat: propsBeat = null } = defineProps<{
  beat?: boolean | null;
}>();

const store = useMusicBeatStore();

const beat = computed((): boolean => {
  if (propsBeat != undefined) return propsBeat;
  return store.beat;
});

onMounted(() => {
  if (propsBeat == undefined) {
    store.initBeat();
  }
});

onUnmounted(() => {
  if (propsBeat == undefined) {
    store.destroyBeat();
  }
});
</script>

<style scoped></style>
