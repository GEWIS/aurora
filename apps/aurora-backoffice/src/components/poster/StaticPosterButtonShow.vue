<template>
  <Button
    class="flex-1"
    :disabled="disabled"
    icon="pi pi-eye"
    :loading="loading"
    severity="success"
    @click="confirmShow"
  />

  <ConfirmPopup />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import type { PosterResponse } from '@gewis/aurora-api-client';
import { usePosterStore } from '@/stores/poster/poster.store';

const store = usePosterStore();
const confirm = useConfirm();

const loading = ref<boolean>(false);
const props = withDefaults(
  defineProps<{
    poster: PosterResponse;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const handleShow = () => {
  loading.value = true;
  void store.setStaticActivePoster(props.poster.id).finally(() => {
    loading.value = false;
  });
};

const confirmShow = () => {
  confirm.require({
    message: `Set ALL static poster screens to this poster?`,
    header: 'Confirm',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      handleShow();
    },
  });
};
</script>

<style scoped></style>
