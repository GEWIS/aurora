<template>
  <Dialog
    :header="editId != null ? 'Edit source' : 'Add source'"
    modal
    :visible="visible"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4 w-96">
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">Name</label>
        <InputText v-model="form.name" placeholder="e.g. BBC" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">RSS feed URL</label>
        <InputText v-model="form.url" placeholder="https://…/rss.xml" />
        <ValidateButton kind="rss" :value="form.url" />
      </div>
      <div class="flex items-center gap-2">
        <ToggleSwitch v-model="form.enabled" input-id="source-enabled" />
        <label for="source-enabled">Enabled</label>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
      <Button :disabled="!form.name || !form.url" label="Save" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useNewsSourceStore } from '@/stores/news-source.store';
import ValidateButton from '@/views/Info/ValidateButton.vue';

const props = defineProps<{ visible: boolean; editId: number | null }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e: 'saved'): void }>();

const store = useNewsSourceStore();
const form = reactive({ name: '', url: '', enabled: true });

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const s = props.editId != null ? store.sources.find((x) => x.id === props.editId) : undefined;
    form.name = s?.name ?? '';
    form.url = s?.url ?? '';
    form.enabled = s?.enabled ?? true;
  },
);

async function save() {
  const params = { name: form.name, url: form.url, enabled: form.enabled };
  if (props.editId != null) await store.updateSource(props.editId, params);
  else await store.createSource(params);
  emit('saved');
  emit('update:visible', false);
}
</script>
