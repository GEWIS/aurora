<template>
  <Button icon="pi pi-pen-to-square" @click="open = true" />
  <IntegrationDialog
    v-model:visible="open"
    :header="`Update ${integrationUser.name}`"
    :on-save="onSave"
    :original-integration-user="integrationUser"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type IntegrationUser, useIntegrationsStore } from '@/stores/integrations.store';
import type { IntegrationUserUpdateRequest } from '@/api';
import IntegrationDialog from '@/components/integrations/IntegrationDialog.vue';

const store = useIntegrationsStore();

const props = defineProps<{
  integrationUser: IntegrationUser;
}>();

const open = ref<boolean>(false);

const onSave = async (params: IntegrationUserUpdateRequest) => {
  return store.updateUser(props.integrationUser.id, params);
};
</script>

<style scoped></style>
