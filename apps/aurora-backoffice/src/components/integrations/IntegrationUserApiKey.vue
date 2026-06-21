<template>
  <InputGroup>
    <InputText
      :type="integrationUser.apiKey == undefined ? 'password' : 'text'"
      :value="integrationUser.apiKey ?? 'haha nice try but there is nothing here'"
    />
    <InputGroupAddon>
      <Button
        v-if="integrationUser.apiKey == undefined"
        :disabled="loading"
        icon="pi pi-eye"
        :loading="loading"
        severity="secondary"
        title="Show API key"
        @click="show"
      />
      <Button
        v-if="integrationUser.apiKey != undefined"
        :disabled="loading"
        icon="pi pi-eye-slash"
        :loading="loading"
        severity="secondary"
        title="Hide API key"
        @click="hide"
      />
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type IntegrationUser, useIntegrationsStore } from '@/stores/integrations.store';

const store = useIntegrationsStore();
const loading = ref<boolean>(false);

const props = defineProps<{
  integrationUser: IntegrationUser;
}>();

const show = async () => {
  loading.value = true;
  await store.showApiKey(props.integrationUser.id);
  loading.value = false;
};

const hide = () => {
  store.hideApiKey(props.integrationUser.id);
};
</script>

<style scoped></style>
