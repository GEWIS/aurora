<template>
  <AppContainer icon="pi-sliders-h" title="Scenes">
    <template #header>
      <div class="flex flex-row gap-5 align-items-center">
        <Button size="small">
          <i class="pi pi-moon mr-2" />
          Clear scenes
        </Button>
        <BeatVisualizer />
      </div>
    </template>
    <DataTable :loading="store.loading" :value="store.scenes">
      <Column field="name" header="Name" />
      <Column field="favorite" header="Favorite">
        <template #body="slotProps">
          <i v-if="slotProps.data.favorite" class="pi pi-check" />
          <i v-else class="pi pi-times" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex flex-row gap-1">
            <Button size="small" title="Apply scene" @click="store.applyScene(slotProps.data.id)">
              <i class="pi pi-lightbulb" />
            </Button>
            <SceneDeleteButton :id="slotProps.data.id" />
          </div>
        </template>
      </Column>
    </DataTable>
  </AppContainer>
</template>

<script setup lang="ts">
import BeatVisualizer from '@/components/audio/BeatVisualizer.vue';
import { useSceneControllerStore } from '@/stores/scene-controller.store';
import SceneDeleteButton from '@/components/lights/scenes/SceneDeleteButton.vue';
import AppContainer from '@/layout/AppContainer.vue';

const store = useSceneControllerStore();
void store.initPage();
</script>

<style lang="scss">
@use '@/assets/layout/layout.scss';

th {
  @extend h6;
}
</style>
