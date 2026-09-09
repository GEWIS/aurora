<template>
  <Dialog
    :header="editId != null ? 'Edit room' : 'Add room'"
    modal
    :visible="visible"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4 w-96">
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">Room number</label>
        <InputText v-model="form.number" placeholder="MF 3.141" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm opacity-70">iCal calendar URL</label>
        <InputText v-model="form.icalUrl" placeholder="https://…/room.ics" />
        <ValidateButton kind="ical" :value="form.icalUrl" />
        <small class="opacity-60">Availability + today's bookings come from this calendar.</small>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
      <Button :disabled="!form.number" :loading="saving" @click="save">
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
import { useConferenceRoomStore } from '@/stores/conference-room.store';
import ValidateButton from '@/views/Info/ValidateButton.vue';

const props = defineProps<{ visible: boolean; editId: number | null }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e: 'saved'): void }>();

const store = useConferenceRoomStore();
const form = reactive({ number: '', icalUrl: '' });

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const r = props.editId != null ? store.rooms.find((x) => x.id === props.editId) : undefined;
    form.number = r?.number ?? '';
    form.icalUrl = r?.icalUrl ?? '';
  },
);

const saving = ref(false);
const justSaved = ref(false);

async function save() {
  const params = { number: form.number, icalUrl: form.icalUrl || null };
  saving.value = true;
  if (props.editId != null) await store.updateRoom(props.editId, params);
  else await store.createRoom(params);
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
