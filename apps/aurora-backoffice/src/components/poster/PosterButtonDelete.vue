<template>
  <Button
    class="flex-1"
    :disabled="!deletable"
    icon="pi pi-trash"
    severity="danger"
    @click="confirmRef?.confirmDialog"
  />
  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Delete"
    :loading="loading"
    message="Are you sure you want to delete this poster?"
    :on-accept="
      async () => {
        loading = true;
        await store.deletePoster(props.poster.id);
        loading = false;
      }
    "
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type PosterResponse, PosterType } from '@gewis/aurora-api-client';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';
import { usePosterStore } from '@/stores/poster/poster.store';

const store = usePosterStore();

const props = defineProps<{
  poster: PosterResponse;
  disabled?: boolean;
}>();

const confirmRef = ref();
const loading = ref<boolean>(false);

const deletable = computed(
  () =>
    !props.disabled &&
    [PosterType.PHOTO, PosterType.IMG, PosterType.VIDEO, PosterType.EXTERN].includes(
      props.poster.type,
    ),
);
</script>

<style scoped></style>
