<template>
  <Button icon="pi pi-plus" label="Create new integration" @click="open = true" />
  <IntegrationDialog v-model:visible="open" header="Create new integration" :on-save="onSave" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIntegrationsStore } from '@/stores/integrations.store';
import type { IntegrationUserCreateRequest } from '@/api';
import IntegrationDialog from '@/components/integrations/IntegrationDialog.vue';

const store = useIntegrationsStore();

const open = ref<boolean>(false);

const onSave = async (params: IntegrationUserCreateRequest) => {
  return store.createUser(params);
};
</script>

<style scoped></style>
