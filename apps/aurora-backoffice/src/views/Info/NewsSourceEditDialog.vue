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
      <Button :disabled="!form.name || !form.url" :loading="saving" @click="save">
        <Transition mode="out-in" name="check-pop">
          <i v-if="justSaved" key="check" class="pi pi-check" />
          <span v-else key="label">Save</span>
        </Transition>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue';
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

const saving = ref(false);
const justSaved = ref(false);

async function save() {
  const params = { name: form.name, url: form.url, enabled: form.enabled };
  saving.value = true;
  if (props.editId != null) await store.updateSource(props.editId, params);
  else await store.createSource(params);
  saving.value = false;
  await nextTick();
  justSaved.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  justSaved.value = false;
  emit('saved');
  emit('update:visible', false);
}
</script>

<style scoped>
.check-pop-enter-active,
.check-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.check-pop-enter-from,
.check-pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
