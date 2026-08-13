<template>
  <Dialog
    :header="editId != null ? 'Edit caller' : 'Add caller'"
    modal
    :visible="visible"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4 w-96">
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">Name</label>
        <InputText v-model="form.name" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">Numbers / SIP (comma separated)</label>
        <InputText v-model="numbersText" placeholder="+31612345678, gewis@tue.nl" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">Photo URL</label>
        <InputText v-model="form.photoUrl" placeholder="https://…" />
        <ValidateButton kind="image" :value="form.photoUrl" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
      <Button :disabled="!form.name" label="Save" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useCallerStore } from '@/stores/caller.store';
import ValidateButton from '@/views/Info/ValidateButton.vue';

const props = defineProps<{ visible: boolean; editId: number | null }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e: 'saved'): void }>();

const store = useCallerStore();
const form = reactive({ name: '', photoUrl: '' });
const numbersText = ref('');

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const c = props.editId != null ? store.callers.find((x) => x.id === props.editId) : undefined;
    form.name = c?.name ?? '';
    form.photoUrl = c?.photoUrl ?? '';
    numbersText.value = c?.numbers.join(', ') ?? '';
  },
);

async function save() {
  const params = {
    name: form.name,
    numbers: numbersText.value
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean),
    photoUrl: form.photoUrl || null,
  };
  if (props.editId != null) await store.updateCaller(props.editId, params);
  else await store.createCaller(params);
  emit('saved');
  emit('update:visible', false);
}
</script>
