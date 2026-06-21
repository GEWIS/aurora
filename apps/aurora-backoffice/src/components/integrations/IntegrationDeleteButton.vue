<template>
  <Button
    icon="pi pi-times"
    severity="danger"
    :title="`Delete integration '${integrationUser.name}'`"
    @click="confirmRef?.confirmDialog"
  />
  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Delete"
    :loading="loading"
    message="Are you sure you want to delete this integration?"
    :on-accept="
      () => {
        loading = true;
        store.deleteUser(integrationUser.id).finally(() => {
          loading = false;
        });
      }
    "
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { type IntegrationUser, useIntegrationsStore } from '@/stores/integrations.store';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';

const store = useIntegrationsStore();

defineProps<{
  integrationUser: IntegrationUser;
}>();

const confirmRef = ref();
const loading = ref<boolean>(false);
</script>

<style scoped></style>
