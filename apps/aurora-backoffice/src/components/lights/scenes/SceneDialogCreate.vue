<template>
  <Button
    icon="pi pi-plus"
    label="Create scene"
    severity="success"
    size="small"
    @click="open = true"
  />
  <SceneDialog v-model:visible="open" :on-save="onSave" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CreateSceneParams } from '@gewis/aurora-api-client';
import SceneDialog from '@/components/lights/scenes/SceneDialog.vue';
import { useSceneControllerStore } from '@/stores/scene-controller.store';

const open = ref<boolean>(false);

const store = useSceneControllerStore();

const onSave = async (params: CreateSceneParams) => {
  return store.createScene(params);
};
</script>

<style scoped></style>
