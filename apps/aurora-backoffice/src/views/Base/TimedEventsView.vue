<template>
  <AppContainer icon="pi-calendar-clock" title="Timed Events">
    <template #header>
      <div class="flex flex-row gap-2">
        <TimedEventDialogCreate />
      </div>
    </template>
    <DataTable :loading="store.loading" :value="store.timedEvents">
      <Column field="cronExpression" header="Cron expression">
        <template #body="slotProps">
          <span>{{ slotProps.data.cronExpression }}</span>
          <br />
          <Message class="italic" severity="secondary" size="small" variant="simple">{{
            cronstrue.toString(slotProps.data.cronExpression)
          }}</Message>
        </template>
      </Column>
      <Column field="eventSpec" header="Event specification">
        <template #body="slotProps">
          <TimedEventSpec :event-spec="slotProps.data.eventSpec" />
        </template>
      </Column>
      <Column field="skipNext" header="Skip Next?">
        <template #body="slotProps">
          <div v-if="slotProps.data.skipNext">
            <i class="pi pi-check-circle" title="Skipped next" />
          </div>
          <div v-else>
            <i class="pi pi-times" title="Not skipped" />
          </div>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <div class="flex flex-row gap-2">
            <TimedEventDialogUpdate :timed-event="slotProps.data" />
            <TimedEventDeleteButton :timed-event="slotProps.data" />
          </div>
        </template>
      </Column>
    </DataTable>
  </AppContainer>
</template>

<script setup lang="ts">
import cronstrue from 'cronstrue';
import AppContainer from '@/layout/AppContainer.vue';
import { useTimedEventsStore } from '@/stores/timed-events.store';
import TimedEventSpec from '@/components/timed-events/TimedEventSpec.vue';
import TimedEventDeleteButton from '@/components/timed-events/TimedEventDeleteButton.vue';
import TimedEventDialogCreate from '@/components/timed-events/TimedEventDialogCreate.vue';
import TimedEventDialogUpdate from '@/components/timed-events/TimedEventDialogUpdate.vue';

const store = useTimedEventsStore();
void store.init();
</script>

<style scoped></style>
