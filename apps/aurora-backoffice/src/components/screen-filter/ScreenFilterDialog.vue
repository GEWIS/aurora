<template>
  <Dialog
    closable
    close-on-escape
    dismissable-mask
    header="Screen filter"
    :keep-in-view-port="false"
    modal
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4 w-80">
      <div class="flex flex-col gap-2">
        <label for="screen-filter-brightness">Brightness: {{ brightness }}%</label>
        <Slider id="screen-filter-brightness" v-model="brightness" :max="100" :min="10" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="screen-filter-warmth">Blue light filter: {{ warmth }}%</label>
        <Slider id="screen-filter-warmth" v-model="warmth" :max="100" :min="0" />
      </div>
      <Button
        class="self-end"
        icon="pi pi-undo"
        label="Reset"
        severity="secondary"
        @click="handleReset()"
      />
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="$emit('update:visible', false)" />
      <Button :disabled="!canSave" label="Save" :loading="store.loading" @click="handleSave()" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DEFAULT_SCREEN_FILTER, useScreenFilterStore } from '@/stores/screen-filter.store';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

const store = useScreenFilterStore();

const brightness = ref<number>(store.filter.brightness);
const warmth = ref<number>(store.filter.warmth);

// Start from the current filter every time the dialog is opened
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    brightness.value = store.filter.brightness;
    warmth.value = store.filter.warmth;
  },
);

const canSave = computed(
  () =>
    !store.loading &&
    (brightness.value !== store.filter.brightness || warmth.value !== store.filter.warmth),
);

const handleSave = async () => {
  await store.set({ brightness: brightness.value, warmth: warmth.value });
  emit('update:visible', false);
};

const handleReset = () => {
  brightness.value = DEFAULT_SCREEN_FILTER.brightness;
  warmth.value = DEFAULT_SCREEN_FILTER.warmth;
};
</script>
