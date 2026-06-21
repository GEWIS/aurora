<script setup lang="ts">
import { ref } from 'vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';

defineProps<{
  effectName: string;
  canSave: boolean;
  disabled?: boolean;
}>();
defineEmits<{
  save: [];
}>();

const store = useEffectsControllerStore();
const visible = ref<boolean>(false);
</script>

<template>
  <Button
    :disabled="store.selectedLightsGroupIds.length === 0"
    icon="pi pi-plus"
    :label="effectName"
    severity="success"
    @click="() => (visible = true)"
  />

  <Dialog
    v-model:visible="visible"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    dismissable-mask
    :header="effectName"
    modal
    :style="{ width: '50rem' }"
  >
    <div class="flex flex-col w-100 gap-5">
      <slot />
    </div>
    <template #footer>
      <Button
        :disabled="!canSave"
        severity="success"
        @click="
          () => {
            visible = false;
            $emit('save');
          }
        "
      >
        Add
      </Button>
    </template>
  </Dialog>
</template>

<style scoped></style>
