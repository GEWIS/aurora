<template>
  <AppContainer icon="pi-book" title="Audit logs">
    <div v-if="store.entries.length > 0">
      <DataTable data-key="id" :value="store.entries">
        <Column field="createdAt" header="Timestamp">
          <template #body="slotProps">
            {{
              new Date(slotProps.data.createdAt).toLocaleString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              })
            }}
          </template>
        </Column>
        <Column field="userName" header="Name" />
        <Column field="action" header="Action" />
      </DataTable>
      <Paginator
        always-show
        :rows="store.take"
        :rows-per-page-options="[5, 10, 20, 50]"
        :total-records="store.count"
        @update:first="(value) => store.setSkip(value)"
        @update:rows="(value) => store.setTake(value)"
      />
    </div>
    <div v-else>Could not load audit logs.</div>
  </AppContainer>
</template>

<script setup lang="ts">
import { useAuditStore } from '@/stores/audit.store';
import AppContainer from '@/layout/AppContainer.vue';

const store = useAuditStore();
void store.setSkipTake(0, 20);
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
