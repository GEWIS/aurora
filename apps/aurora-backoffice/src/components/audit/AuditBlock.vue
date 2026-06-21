<template>
  <AppContainer icon="pi-book" title="Logs">
    <div v-if="store.dashboardEntries.length > 0">
      <DataTable class="mb-3" data-key="id" :loading="store.loading" :value="store.dashboardEntries">
        <Column field="createdAt" header="Timestamp">
          <template #body="slotProps">
            {{ new Date(slotProps.data.createdAt).toLocaleString() }}
          </template>
        </Column>
        <Column field="userName" header="Name" />
        <Column field="action" header="Action" />
      </DataTable>
      <RouterLink to="/audit"> More recent activity </RouterLink>
    </div>
    <div v-else>Could not load audit logs.</div>
  </AppContainer>
</template>

<script setup lang="ts">
import { useAuditStore } from '@/stores/audit.store';
import AppContainer from '@/layout/AppContainer.vue';
const store = useAuditStore();
void store.setSkipTake(0, 5);
</script>

<style lang="scss">
@use '@/assets/layout/layout.scss';

th {
  padding-top: 0 !important;
  @extend h6;
}

.p-datatable-column-title {
  font-weight: 500 !important;
}
</style>
