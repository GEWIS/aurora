<template>
  <!-- Icon as content (not the icon prop), so it has the same size as the other scene buttons -->
  <Button size="small" title="Edit scene" @click="open = true">
    <i class="pi pi-pen-to-square" />
  </Button>
  <SceneDialog v-model:visible="open" :on-save="onSave" :original-scene="scene" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { LightsSceneResponse, UpdateSceneParams } from '@gewis/aurora-api-client';
import SceneDialog from '@/components/lights/scenes/SceneDialog.vue';
import { useSceneControllerStore } from '@/stores/scene-controller.store';

const props = defineProps<{
  scene: LightsSceneResponse;
}>();

const open = ref<boolean>(false);

const store = useSceneControllerStore();

const onSave = async (params: UpdateSceneParams) => {
  return store.updateScene(props.scene.id, params);
};
</script>

<style scoped></style>
