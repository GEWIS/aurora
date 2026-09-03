<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Room status -->
    <AppContainer icon="pi-home" title="Room status">
      <template #header>
        <RouterLink to="/info-screen/layout">
          <Button icon="pi pi-th-large" label="Manage layout" />
        </RouterLink>
      </template>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <ToggleSwitch v-model="room.open" />
          <span>{{ room.open ? 'Room is open' : 'Room is closed' }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Responsible person 1</label>
          <Select
            v-model="room.responsible1"
            filter
            fluid
            option-label="name"
            option-value="name"
            :options="infoStore.keyholders"
            placeholder="Select a keyholder"
            show-clear
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Responsible person 2</label>
          <Select
            v-model="room.responsible2"
            filter
            fluid
            option-label="name"
            option-value="name"
            :options="infoStore.keyholders"
            placeholder="Select a keyholder (optional)"
            show-clear
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Beer time</label>
          <Select
            v-model="room.beerTime"
            fluid
            option-label="label"
            option-value="value"
            :options="beerTimeOptions"
            placeholder="Not today"
          />
          <small class="opacity-60">Resets to "Not today" each morning.</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Last call</label>
          <InputText v-model="room.lastCall" placeholder="22:00" />
          <small class="opacity-60">Shown by the beer widget at beer time (if enabled).</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Coffee/tea status</label>
          <Select
            v-model="room.coffeeStatus"
            fluid
            option-label="label"
            option-value="value"
            :options="coffeeOptions"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Closed message</label>
          <InputText v-model="room.closedMessage" placeholder="GEWIS is closed" />
        </div>
        <Button class="self-end" label="Save room status" @click="saveRoom" />
      </div>
    </AppContainer>

    <!-- Keyholders -->
    <AppContainer class="keyholder-container" icon="pi-key" title="Keyholders">
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="syncResult"
            class="text-sm"
            :class="syncOk ? 'text-green-400' : 'text-red-400'"
          >
            <i class="pi" :class="syncOk ? 'pi-check' : 'pi-times'" /> {{ syncResult }}
          </span>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="keyholderSearch" class="pl-8" placeholder="Search" />
          </IconField>
          <Button
            v-tooltip.bottom="syncTooltip"
            :disabled="!infoStore.keyholderSync?.enabled"
            icon="pi pi-sync"
            label="Sync now"
            :loading="syncing"
            severity="secondary"
            @click="syncKeyholders"
          />
        </div>
      </template>
      <DataTable
        class="p-datatable-sm keyholder-table"
        scroll-height="flex"
        scrollable
        :value="visibleKeyholders"
      >
        <Column field="name" header="Name" />
        <Column header="Board">
          <template #body="{ data }">
            <i v-if="data.isBoard" class="pi pi-star-fill text-amber-400" />
          </template>
        </Column>
        <Column header="Candidate">
          <template #body="{ data }">
            <i v-if="data.isCandidateBoard" class="pi pi-star-half-fill text-amber-400" />
          </template>
        </Column>
        <Column header="Keyholder">
          <template #body="{ data }">
            <i v-if="data.isKeyholder" class="pi pi-key text-sky-400" />
          </template>
        </Column>
        <Column header="Member ID">
          <template #body="{ data }">{{ data.memberId ?? '—' }}</template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <div class="flex justify-end">
              <Button
                v-tooltip.top="'Set the photo and the candidate-board flag'"
                icon="pi pi-pencil"
                severity="secondary"
                text
                @click="openEdit(data)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center italic opacity-70 py-4">
            {{
              keyholderSearch
                ? 'No keyholders match that search.'
                : 'No keyholders. The list is filled by the GEWIS sync.'
            }}
          </div>
        </template>
      </DataTable>
    </AppContainer>

    <!-- Keyholder edit dialog -->
    <Dialog v-model:visible="dialogVisible" :header="`Edit ${editName}`" modal>
      <div class="flex flex-col gap-4 w-96">
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.isCandidateBoard" binary input-id="kh-candidate" />
          <label for="kh-candidate">Candidate board</label>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Photo URL</label>
          <InputText v-model="form.photoUrl" placeholder="https://…" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Save" @click="saveKeyholder" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { type KeyholderResponse } from '@gewis/aurora-api-client';
import AppContainer from '@/layout/AppContainer.vue';
import { useInfoStore } from '@/stores/info.store';

const infoStore = useInfoStore();

// --- GEWIS keyholder sync ---------------------------------------------------

const syncing = ref(false);
const syncResult = ref<string | null>(null);
const syncOk = ref(false);

const syncTooltip = computed(() => {
  const sync = infoStore.keyholderSync;
  if (!sync?.enabled) return 'The GEWIS API is not configured on this server';
  return sync.intervalMinutes > 0
    ? `Also runs automatically every ${sync.intervalMinutes} minutes`
    : 'Only runs automatically at server startup';
});

async function syncKeyholders() {
  syncing.value = true;
  syncResult.value = null;
  const result = await infoStore.syncKeyholders();
  syncOk.value = result !== null;
  syncResult.value = result
    ? `${result.created} added, ${result.updated} updated, ${result.removed} removed`
    : 'Sync failed — check the server logs';
  syncing.value = false;
}

const room = reactive<{
  open: boolean;
  responsible1: string | null;
  responsible2: string | null;
  beerTime: string | null;
  lastCall: string;
  closedMessage: string;
  coffeeStatus: number;
}>({
  open: false,
  responsible1: null,
  responsible2: null,
  beerTime: null,
  lastCall: '',
  closedMessage: '',
  coffeeStatus: 0,
});

// Coffee/tea status codes, matching the legacy screen.
const coffeeOptions: { label: string; value: number }[] = [
  { label: 'It works ☕/🍵', value: 0 },
  { label: 'Coffee, no tea ☕', value: 1 },
  { label: 'Tea, no coffee 🍵', value: 2 },
  { label: 'It partially works', value: 3 },
  { label: 'It does not work 😔', value: 4 },
  { label: 'Cleaning 🧼', value: 5 },
  { label: 'Daily clean needed 🕣', value: 6 },
  { label: 'Technician has been called 🚚', value: 7 },
  { label: 'Technician is fixing the machine 👷', value: 8 },
  { label: '🪵', value: 9 },
  { label: 'Unknown', value: 10 },
];

// Preset beer times (as on the legacy screen). "Not today" clears the time.
const beerTimeOptions: { label: string; value: string | null }[] = [
  { label: 'Not today', value: null },
  { label: '14:00 (exam week / lecture-free)', value: '14:00' },
  { label: '16:00', value: '16:00' },
  { label: '16:30 (regular)', value: '16:30' },
  { label: '17:00', value: '17:00' },
];

/** Free-text filter over the keyholder list; matches the name or the number. */
const keyholderSearch = ref('');

const visibleKeyholders = computed(() => {
  const needle = keyholderSearch.value.trim().toLowerCase();
  if (!needle) return infoStore.keyholders;
  return infoStore.keyholders.filter(
    (k) => k.name.toLowerCase().includes(needle) || String(k.memberId ?? '').includes(needle),
  );
});

const dialogVisible = ref(false);
const editId = ref<number | null>(null);
const editName = ref('');
const form = reactive({
  isCandidateBoard: false,
  photoUrl: '',
});

onMounted(async () => {
  await infoStore.init();
});

watch(
  () => infoStore.roomStatus,
  (status) => {
    if (!status) return;
    room.open = status.open;
    room.responsible1 = status.responsible[0]?.name ?? null;
    room.responsible2 = status.responsible[1]?.name ?? null;
    room.beerTime = status.beerTime ?? null;
    room.lastCall = status.lastCall ?? '';
    room.closedMessage = status.closedMessage ?? '';
    room.coffeeStatus = status.coffeeStatus ?? 0;
  },
  { immediate: true },
);

async function saveRoom() {
  await infoStore.saveRoomStatus({
    open: room.open,
    responsible1: room.responsible1 || null,
    responsible2: room.responsible2 || null,
    beerTime: room.beerTime,
    lastCall: room.lastCall || null,
    closedMessage: room.closedMessage || null,
    coffeeStatus: room.coffeeStatus,
  });
}

function openEdit(keyholder: KeyholderResponse) {
  editId.value = keyholder.id;
  editName.value = keyholder.name;
  form.isCandidateBoard = keyholder.isCandidateBoard;
  form.photoUrl = keyholder.photoUrl ?? '';
  dialogVisible.value = true;
}

async function saveKeyholder() {
  if (editId.value === null) return;
  await infoStore.updateKeyholder(editId.value, {
    isCandidateBoard: form.isCandidateBoard,
    photoUrl: form.photoUrl || null,
  });
  dialogVisible.value = false;
}
</script>

<style scoped>
/* Denser rows so more keyholders fit in the same vertical space. */
:deep(.keyholder-table td),
:deep(.keyholder-table th) {
  padding-top: 0.15rem;
  padding-bottom: 0.15rem;
}
:deep(.keyholder-table .p-button) {
  padding: 0.2rem;
}

/* Let the list fill the full height of its card and scroll inside it
   (scroll-height=flex), instead of growing the page. */
:deep(.keyholder-container) {
  height: 100%;
}
:deep(.keyholder-container .p-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.keyholder-container .p-card-content) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
}
:deep(.keyholder-container .p-datatable) {
  flex: 1 1 0;
  min-height: 0;
}
</style>
