<template>
  <div class="flex flex-col gap-1 rounded border border-gray-600 bg-black/20 p-2">
    <div v-if="items.length === 0" class="italic opacity-60">Nothing configured yet.</div>

    <div v-for="item in items" :key="item.id" class="flex items-center gap-2">
      <Checkbox
        v-if="selectable"
        binary
        :model-value="isSelected(item.id)"
        @update:model-value="() => toggle(item.id)"
      />
      <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
      <i
        v-tooltip.top="'Edit'"
        class="pi pi-pencil cursor-pointer text-sm opacity-70 hover:opacity-100"
        @click="openEdit(item.id)"
      />
      <i
        v-tooltip.top="'Delete everywhere'"
        class="pi pi-trash cursor-pointer text-sm text-red-400 opacity-80 hover:opacity-100"
        @click="confirmDelete(item)"
      />
    </div>

    <small v-if="selectable" class="opacity-60">None selected = all shown.</small>

    <Button
      class="mt-1 self-start"
      icon="pi pi-plus"
      label="Add new"
      severity="secondary"
      size="small"
      text
      @click="openEdit(null)"
    />

    <!-- Callers: global test-call trigger -->
    <div
      v-if="entity === 'callers'"
      class="mt-2 flex items-end gap-2 border-t border-gray-600 pt-2"
    >
      <InputText v-model="testNumber" class="flex-1" placeholder="+31612345678" />
      <Button
        :disabled="!testNumber"
        icon="pi pi-phone"
        label="Test call"
        severity="secondary"
        size="small"
        @click="triggerTest"
      />
    </div>

    <CallerEditDialog v-if="entity === 'callers'" v-model:visible="editVisible" :edit-id="editId" />
    <RoomEditDialog
      v-else-if="entity === 'conference-rooms'"
      v-model:visible="editVisible"
      :edit-id="editId"
    />
    <NewsSourceEditDialog v-else v-model:visible="editVisible" :edit-id="editId" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useCallerStore } from '@/stores/caller.store';
import { useConferenceRoomStore } from '@/stores/conference-room.store';
import { useNewsSourceStore } from '@/stores/news-source.store';
import CallerEditDialog from '@/views/Info/CallerEditDialog.vue';
import RoomEditDialog from '@/views/Info/RoomEditDialog.vue';
import NewsSourceEditDialog from '@/views/Info/NewsSourceEditDialog.vue';

const props = defineProps<{
  entity: 'callers' | 'conference-rooms' | 'news-sources';
  selectable: boolean;
  modelValue: string[];
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>();

const confirm = useConfirm();
const callerStore = useCallerStore();
const roomStore = useConferenceRoomStore();
const newsStore = useNewsSourceStore();

const editVisible = ref(false);
const editId = ref<number | null>(null);
const testNumber = ref('');

onMounted(() => {
  if (props.entity === 'callers') void callerStore.init();
  else if (props.entity === 'conference-rooms') void roomStore.init();
  else void newsStore.init();
});

interface Item {
  id: number;
  label: string;
}

const items = computed<Item[]>(() => {
  if (props.entity === 'callers') {
    return callerStore.callers.map((c) => ({ id: c.id, label: c.name || '(unnamed)' }));
  }
  if (props.entity === 'conference-rooms') {
    return roomStore.rooms.map((r) => ({ id: r.id, label: r.number }));
  }
  return newsStore.sources.map((s) => ({
    id: s.id,
    label: s.enabled ? s.name : `${s.name} (disabled)`,
  }));
});

function isSelected(id: number): boolean {
  return (props.modelValue ?? []).includes(String(id));
}

function toggle(id: number) {
  const key = String(id);
  const current = props.modelValue ?? [];
  emit(
    'update:modelValue',
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
  );
}

function openEdit(id: number | null) {
  editId.value = id;
  editVisible.value = true;
}

async function remove(item: Item) {
  if (props.entity === 'callers') await callerStore.deleteCaller(item.id);
  else if (props.entity === 'conference-rooms') await roomStore.deleteRoom(item.id);
  else await newsStore.deleteSource(item.id);
  emit(
    'update:modelValue',
    (props.modelValue ?? []).filter((k) => k !== String(item.id)),
  );
}

function confirmDelete(item: Item) {
  confirm.require({
    header: 'Delete',
    message: `Delete "${item.label}"? This removes it from every screen.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancel', severity: 'secondary', text: true },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: () => {
      void remove(item);
    },
  });
}

async function triggerTest() {
  await callerStore.testCall(testNumber.value);
}
</script>
