<template>
  <div class="grid lg:grid-cols-6 xxl:grid-cols-4">
    <div class="hidden lg:flex" />
    <AppContainer class="lg:col-span-4 xxl:col-span-2" icon="pi-crown" title="Centurion">
      <template #header>
        <div v-if="currentTape">
          <Button icon="pi pi-times" @click="confirmRef?.confirmDialog" />
          <ConfirmWrapper
            ref="confirmRef"
            accept-label="Quit"
            message="Are you sure you want to quit this centurion?"
            :on-accept="centurionStore.quitCenturion"
          />
        </div>
      </template>
      <div v-if="currentTape">
        <CoverPlayButton :tape="currentTape" />
        <divider />
        <CenturionTapeTimeline :tape="currentTape" />
      </div>
      <div v-else>
        <InitializeCenturion :vertical="layoutStore.getWindowWidth < TailwindWidth.sm" />
      </div>
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useCenturionStore } from '@/stores/modes/centurion.store';
import InitializeCenturion from '@/components/modes/centurion/InitializeCenturion.vue';
import CoverPlayButton from '@/components/modes/centurion/CoverPlayButton.vue';
import AppContainer from '@/layout/AppContainer.vue';
import type { MixTapeResponse } from '@/api';
import CenturionTapeTimeline from '@/components/modes/centurion/TapeTimeline.vue';
import { useLayoutStore, TailwindWidth } from '@/stores/layout.store';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';

const confirmRef = ref();
const centurionStore = useCenturionStore();
const layoutStore = useLayoutStore();
void centurionStore.init();

onMounted(() => layoutStore.mountResizeListener());
onUnmounted(() => {
  layoutStore.unmountResizeListener();
  void centurionStore.destroy();
});

const currentTape = computed<MixTapeResponse | undefined>(() => {
  const tapes = centurionStore.getTapes;
  if (!tapes) return undefined;

  const currentTape = centurionStore.getCurrentTape;
  if (!currentTape) return undefined;

  return tapes?.find((t) => t.name === currentTape?.name);
});
</script>
