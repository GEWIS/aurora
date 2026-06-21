<template>
  <Dialog
    closable
    close-on-escape
    dismissable-mask
    :header="header"
    :keep-in-viewport="false"
    modal
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
  >
    <form class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="name">Name</label>
        <InputText id="name" v-model="name" :invalid="name.length === 0" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="endpoints">Endpoints</label>
        <MultiSelect v-model="endpoints" display="chip" filter :options="possibleEndpoints" show-clear>
          <template #option="slotProps">
            <div
              v-if="!store.integrationEndpoints.includes(slotProps.option)"
              class="flex items-center gap-1 text-orange-500"
              title="Endpoint does no longer exist!"
            >
              <i class="pi pi-exclamation-triangle color-orange" />
              <div>{{ slotProps.option }}</div>
            </div>
            <div v-else class="">{{ slotProps.option }}</div>
          </template>
        </MultiSelect>
      </div>
      <Button
        :disabled="loading || !endpointsValid || name.length === 0"
        label="Save"
        :loading="loading"
        severity="success"
        type="submit"
        @click="
          (e) => {
            e.preventDefault();
            onSaveWrapper();
          }
        "
      />
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, ref } from 'vue';
import { type IntegrationUser, useIntegrationsStore } from '@/stores/integrations.store';
import type { IntegrationUserCreateRequest } from '@/api';

const store = useIntegrationsStore();

const props = defineProps<{
  originalIntegrationUser?: IntegrationUser;
  visible: boolean;
  onSave: (params: IntegrationUserCreateRequest) => Promise<void>;
  header: string;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

const loading = ref<boolean>(false);

const name = ref<string>(props.originalIntegrationUser?.name ?? '');
const endpoints = ref<string[]>(props.originalIntegrationUser?.endpoints ?? []);

const endpointsValid: ComputedRef<boolean> = computed(() => {
  const invalids = endpoints.value.filter((e) => {
    return !store.integrationEndpoints.includes(e);
  });
  return invalids.length === 0;
});

// Integration User might have an endpoint that no longer exists, so we should have it included
// in the list of options.
const possibleEndpoints = computed((): string[] => {
  const allEndpoints = [...store.integrationEndpoints];
  if (props.originalIntegrationUser) {
    allEndpoints.push(...props.originalIntegrationUser.endpoints);
  }
  // Filter duplicates
  return allEndpoints.filter((e, i, all) => i === all.indexOf(e));
});

const onSaveWrapper = async () => {
  await props.onSave({ name: name.value, endpoints: endpoints.value });
  emit('update:visible', false);
};
</script>

<style scoped></style>
