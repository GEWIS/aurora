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
      <Button :disabled="!form.name" :loading="saving" @click="save">
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

const saving = ref(false);
const justSaved = ref(false);

async function save() {
  const params = {
    name: form.name,
    numbers: numbersText.value
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean),
    photoUrl: form.photoUrl || null,
  };
  saving.value = true;
  if (props.editId != null) await store.updateCaller(props.editId, params);
  else await store.createCaller(params);
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
