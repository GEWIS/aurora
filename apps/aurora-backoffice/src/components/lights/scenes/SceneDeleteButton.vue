<template>
  <ConfirmDialog />
  <Button severity="danger" size="small" title="Delete scene" @click="openDialog()">
    <i class="pi pi-trash" />
  </Button>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { useSceneControllerStore } from '@/stores/scene-controller.store';

const props = defineProps<{
  id: number;
}>();

const store = useSceneControllerStore();

const confirm = useConfirm();
const openDialog = () => {
  confirm.require({
    message: 'Are you sure you want to delete this scene?',
    header: 'Are you sure?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Yes',
    accept() {
      void store.deleteScene(props.id);
    },
  });
};
</script>

<style scoped></style>
