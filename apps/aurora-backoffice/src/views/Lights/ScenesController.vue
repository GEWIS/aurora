<template>
  <AppContainer icon="pi-sliders-h" title="Scenes">
    <template #header>
      <div class="flex flex-row gap-5 align-items-center">
        <SceneDialogCreate v-if="isPrivileged" />
        <Button
          :disabled="store.activeSceneId === null || store.loading"
          size="small"
          @click="store.clearScene()"
        >
          <i class="pi pi-moon mr-2" />
          Clear scene
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
      <Column header="Effects">
        <template #body="slotProps">
          <!-- One row per effect with its lights groups next to it, aligned in a second column -->
          <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-center">
            <template v-for="(effect, index) in slotProps.data.effects" :key="index">
              <SavedEffect :effect="effect" />
              <span class="text-sm italic text-muted-color">
                {{ effect.lightsGroups.map((g: BaseLightsGroupResponse) => g.name).join(', ') }}
              </span>
            </template>
          </div>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 items-center">
            <Tag
              v-if="slotProps.data.id === store.activeSceneId"
              severity="success"
              value="Active"
            />
            <Button
              :severity="slotProps.data.id === store.activeSceneId ? 'secondary' : undefined"
              size="small"
              title="Apply scene"
              @click="store.applyScene(slotProps.data)"
            >
              <i class="pi pi-lightbulb" />
            </Button>
            <template v-if="isPrivileged">
              <SceneDialogUpdate :scene="slotProps.data" />
              <SceneDeleteButton :id="slotProps.data.id" />
            </template>
          </div>
        </template>
      </Column>
    </DataTable>
  </AppContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseLightsGroupResponse } from '@gewis/aurora-api-client';
import BeatVisualizer from '@/components/audio/BeatVisualizer.vue';
import { useSceneControllerStore } from '@/stores/scene-controller.store';
import { useAuthStore } from '@/stores/auth.store';
import SceneDeleteButton from '@/components/lights/scenes/SceneDeleteButton.vue';
import SceneDialogCreate from '@/components/lights/scenes/SceneDialogCreate.vue';
import SceneDialogUpdate from '@/components/lights/scenes/SceneDialogUpdate.vue';
import SavedEffect from '@/components/lights/effects/SavedEffect.vue';
import AppContainer from '@/layout/AppContainer.vue';

const store = useSceneControllerStore();
void store.initPage();

const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('scenes', 'privileged'));
</script>

<style lang="scss">
@use '@/assets/layout/layout.scss';

th {
  @extend h6;
}
</style>
