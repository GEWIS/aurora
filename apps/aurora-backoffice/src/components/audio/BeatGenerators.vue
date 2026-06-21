<template>
  <AppContainer icon="pi pi-database" title="Active Beat Generators">
    <template #header>
      <div class="flex flex-row gap-5 items-center">
        <ArtificialBeatDialog />
        <BeatVisualizer />
      </div>
    </template>
    <div class="flex flex-col gap-3">
      <Message icon="pi pi-info-circle" severity="info">
        The table below shows all beat generators that are currently active. The one with the arrow is the generator
        with precedence: this generator is authoritative and determines the beats through Aurora. It is not possible to
        change the beat generators here; this window is purely for debugging purposes.
      </Message>
      <DataTable
        v-if="store.generators.length > 0"
        data-key="id"
        :loading="loading"
        :selection="selected"
        :value="store.generators"
      >
        <Column class="w-1">
          <template #body="slotProps">
            <i v-if="slotProps.data.hasPrecedence" class="pi pi-arrow-right"></i>
          </template>
        </Column>
        <Column field="name"></Column>
        <Column>
          <template #body="slotProps">
            <BeatVisualizer :beat="slotProps.data.beat" />
          </template>
        </Column>
      </DataTable>
      <div v-else class="flex justify-center items-center italic mt-8">No beat generators are active.</div>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import AppContainer from '@/layout/AppContainer.vue';
import { useMusicBeatStore } from '@/stores/socket/music-beat.store';
import BeatVisualizer from '@/components/audio/BeatVisualizer.vue';
import ArtificialBeatDialog from '@/components/audio/ArtificialBeatDialog.vue';

const loading = ref<boolean>(true);

const store = useMusicBeatStore();
void store.initBeatGenerators().then(() => {
  loading.value = false;
});

const selected = computed((): string[] => {
  return store.generators.filter((g) => g.hasPrecedence).map((g) => g.id);
});

onUnmounted(() => {
  void store.destroyBeatGenerators();
});
</script>

<style scoped></style>
