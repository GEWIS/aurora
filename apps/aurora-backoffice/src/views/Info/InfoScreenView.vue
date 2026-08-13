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

    <!-- PC usage -->
    <AppContainer class="pc-container" icon="pi-desktop" title="PC usage">
      <DataTable
        class="p-datatable-sm pc-table"
        :row-class="(data) => (data.override === 'disabled' ? 'opacity-50' : '')"
        scroll-height="flex"
        scrollable
        :value="infoStore.pcs"
      >
        <Column field="pcId" header="PC" />
        <Column field="status" header="Status" />
        <Column field="username" header="User" />
        <Column header="">
          <template #body="{ data }">
            <i v-if="symbolIcon(data.symbol)" class="pi" :class="symbolIcon(data.symbol)" />
          </template>
        </Column>
        <Column header="Override">
          <template #body="{ data }">
            <Tag v-if="data.override === 'maintenance'" severity="warn" value="Maintenance" />
            <Tag v-else-if="data.override === 'disabled'" severity="secondary" value="Disabled" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <div class="flex gap-1 justify-end">
              <Button
                v-tooltip.top="
                  data.override === 'maintenance' ? 'Clear maintenance' : 'Set maintenance'
                "
                :icon="data.override === 'maintenance' ? 'pi pi-check' : 'pi pi-wrench'"
                :severity="data.override === 'maintenance' ? 'warn' : 'secondary'"
                size="small"
                text
                @click="
                  infoStore.setPcOverride(
                    data.pcId,
                    data.override === 'maintenance' ? PcOverride.NONE : PcOverride.MAINTENANCE,
                  )
                "
              />
              <Button
                v-tooltip.top="data.override === 'disabled' ? 'Enable' : 'Disable'"
                :icon="data.override === 'disabled' ? 'pi pi-eye' : 'pi pi-eye-slash'"
                severity="secondary"
                size="small"
                text
                @click="
                  infoStore.setPcOverride(
                    data.pcId,
                    data.override === 'disabled' ? PcOverride.NONE : PcOverride.DISABLED,
                  )
                "
              />
              <Button
                v-tooltip.top="'Delete'"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                @click="infoStore.deletePc(data.pcId)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center italic opacity-70 py-4">No PCs reported</div>
        </template>
      </DataTable>
    </AppContainer>

    <!-- Keyholders -->
    <AppContainer class="lg:col-span-2" icon="pi-key" title="Keyholders">
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="syncResult"
            class="text-sm"
            :class="syncOk ? 'text-green-400' : 'text-red-400'"
          >
            <i class="pi" :class="syncOk ? 'pi-check' : 'pi-times'" /> {{ syncResult }}
          </span>
          <Button
            v-tooltip.bottom="syncTooltip"
            :disabled="!infoStore.keyholderSync?.enabled"
            icon="pi pi-sync"
            label="Sync now"
            :loading="syncing"
            severity="secondary"
            @click="syncKeyholders"
          />
          <Button icon="pi pi-plus" label="Add keyholder" @click="openCreate" />
        </div>
      </template>
      <DataTable class="p-datatable-sm" :value="infoStore.keyholders">
        <Column header="Name">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span>{{ data.name }}</span>
              <Tag
                v-if="data.ldapManaged"
                v-tooltip.top="ldapTooltip(data)"
                icon="pi pi-sitemap"
                severity="info"
                value="LDAP"
              />
            </div>
          </template>
        </Column>
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
        <Column header="Usernames">
          <template #body="{ data }">{{ data.usernames.join(', ') }}</template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <div class="flex gap-2 justify-end">
              <Button
                v-if="data.nameOverridden"
                v-tooltip.top="`Restore the name from LDAP (${data.ldapName})`"
                icon="pi pi-undo"
                severity="secondary"
                text
                @click="revert(data)"
              />
              <Button icon="pi pi-pencil" severity="secondary" text @click="openEdit(data)" />
              <Button
                v-tooltip.top="
                  data.ldapManaged
                    ? 'Managed by LDAP — remove them from the group instead'
                    : undefined
                "
                :disabled="data.ldapManaged"
                icon="pi pi-trash"
                severity="danger"
                text
                @click="remove(data)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center italic opacity-70 py-4">No keyholders yet</div>
        </template>
      </DataTable>
    </AppContainer>

    <!-- Keyholder edit dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editId ? 'Edit keyholder' : 'Add keyholder'"
      modal
    >
      <div class="flex flex-col gap-4 w-96">
        <Message v-if="editLdapManaged" :closable="false" severity="info">
          Synced from LDAP. Only the name and photo can be changed here; the flags and usernames
          follow group membership.
        </Message>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Name</label>
          <InputText v-model="form.name" />
          <small v-if="editLdapName && form.name !== editLdapName" class="opacity-70">
            LDAP: {{ editLdapName }}
          </small>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.isBoard" binary :disabled="editLdapManaged" input-id="kh-board" />
          <label for="kh-board">Board member</label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox
            v-model="form.isCandidateBoard"
            binary
            :disabled="editLdapManaged"
            input-id="kh-candidate"
          />
          <label for="kh-candidate">Candidate board</label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox
            v-model="form.isKeyholder"
            binary
            :disabled="editLdapManaged"
            input-id="kh-key"
          />
          <label for="kh-key">Keyholder</label>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Photo URL</label>
          <InputText v-model="form.photoUrl" placeholder="https://…" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Usernames (comma separated)</label>
          <InputText v-model="usernamesText" :disabled="editLdapManaged" placeholder="JDOE, JANE" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="dialogVisible = false" />
        <Button :disabled="!form.name" label="Save" @click="saveKeyholder" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { PcOverride, type KeyholderResponse } from '@gewis/aurora-api-client';
import AppContainer from '@/layout/AppContainer.vue';
import { useInfoStore } from '@/stores/info.store';

const infoStore = useInfoStore();

// --- LDAP keyholder sync ----------------------------------------------------

const syncing = ref(false);
const syncResult = ref<string | null>(null);
const syncOk = ref(false);

const syncTooltip = computed(() => {
  const sync = infoStore.keyholderSync;
  if (!sync?.enabled) return 'LDAP is not configured on this server';
  return sync.intervalMinutes > 0
    ? `Also runs automatically every ${sync.intervalMinutes} minutes`
    : 'Only runs automatically at server startup';
});

/** Explains the LDAP badge, naming the directory's own value when overridden. */
function ldapTooltip(keyholder: KeyholderResponse): string {
  return keyholder.nameOverridden
    ? `Synced from LDAP, renamed here (LDAP: ${keyholder.ldapName})`
    : 'Synced from LDAP';
}

async function revert(keyholder: KeyholderResponse) {
  await infoStore.revertKeyholder(keyholder.id);
}

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

/** Map the server keyholder symbol (emoji) to a PrimeIcon for the PC table. */
function symbolIcon(symbol: string): string | null {
  switch (symbol) {
    case '★':
      return 'pi-star-fill';
    case '🔑':
    case '🍭':
      return 'pi-key';
    case '🍬':
      return 'pi-star-half-fill';
    default:
      return null;
  }
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

const dialogVisible = ref(false);
const editId = ref<number | null>(null);
const form = reactive({
  name: '',
  isBoard: false,
  isCandidateBoard: false,
  isKeyholder: false,
  photoUrl: '',
});
const usernamesText = ref('');

/** The LDAP state of the row being edited, so the dialog can lock its fields. */
const editLdapManaged = ref(false);
const editLdapName = ref<string | null>(null);

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

function openCreate() {
  editId.value = null;
  form.name = '';
  form.isBoard = false;
  form.isCandidateBoard = false;
  form.isKeyholder = false;
  form.photoUrl = '';
  usernamesText.value = '';
  editLdapManaged.value = false;
  editLdapName.value = null;
  dialogVisible.value = true;
}

function openEdit(keyholder: KeyholderResponse) {
  editId.value = keyholder.id;
  form.name = keyholder.name;
  form.isBoard = keyholder.isBoard;
  form.isCandidateBoard = keyholder.isCandidateBoard;
  form.isKeyholder = keyholder.isKeyholder;
  form.photoUrl = keyholder.photoUrl ?? '';
  usernamesText.value = keyholder.usernames.join(', ');
  editLdapManaged.value = keyholder.ldapManaged;
  editLdapName.value = keyholder.ldapName;
  dialogVisible.value = true;
}

async function saveKeyholder() {
  const params = {
    name: form.name,
    isBoard: form.isBoard,
    isCandidateBoard: form.isCandidateBoard,
    isKeyholder: form.isKeyholder,
    photoUrl: form.photoUrl || null,
    usernames: usernamesText.value
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean),
  };
  if (editId.value) {
    await infoStore.updateKeyholder(editId.value, params);
  } else {
    await infoStore.createKeyholder(params);
  }
  dialogVisible.value = false;
}

async function remove(keyholder: KeyholderResponse) {
  await infoStore.deleteKeyholder(keyholder.id);
}
</script>

<style scoped>
/* Denser PC-usage rows so more PCs fit in the same vertical space. */
:deep(.pc-table td),
:deep(.pc-table th) {
  padding-top: 0.15rem;
  padding-bottom: 0.15rem;
}
:deep(.pc-table .p-button) {
  padding: 0.2rem;
}

/* Let the PC-usage table fill the full height of its card (scroll-height=flex). */
:deep(.pc-container) {
  height: 100%;
}
:deep(.pc-container .p-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.pc-container .p-card-content) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
}
:deep(.pc-container .p-datatable) {
  flex: 1 1 0;
  min-height: 0;
}
</style>
