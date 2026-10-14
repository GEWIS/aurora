<template>
  <div class="flex flex-row gap-3">
    <Button
      label="Refresh"
      :loading="refreshLoading"
      @click="
        async () => {
          refreshLoading = true;
          await store.reloadPosters();
          refreshLoading = false;
        }
      "
    >
      <template #icon>
        <i class="pi pi-refresh mr-2" />
      </template>
    </Button>
    <PosterCreationDialog />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePosterStore } from '@/stores/poster/poster.store';
import PosterCreationDialog from '@/components/poster/PosterCreationDialog.vue';

const store = usePosterStore();

const refreshLoading = ref(false);
</script>

<style scoped></style>
