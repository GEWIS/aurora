<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';
import { useSubscriberStore } from '@/stores/subscriber.store';
import EffectPropsGrid from '@/components/lights/effects/props/EffectPropsGrid.vue';

const props = defineProps<{
  effectName: string;
  canSave: boolean;
  disabled?: boolean;
  /** Only allow adding this effect when a selected lights group contains moving heads */
  requiresMovingHeads?: boolean;
}>();
defineEmits<{
  save: [];
}>();

const store = useEffectsControllerStore();
const subscriberStore = useSubscriberStore();
const visible = ref<boolean>(false);

const disabledReason = computed((): string | undefined => {
  if (store.selectedLightsGroupIds.length === 0) return 'Select one or more lights groups first';
  if (
    props.requiresMovingHeads &&
    !subscriberStore.movingHeadLightsGroups.some((g) => store.selectedLightsGroupIds.includes(g.id))
  ) {
    return 'None of the selected lights groups contain moving heads';
  }
  return undefined;
});
</script>

<template>
  <!-- Disabled buttons do not show a title, so put it on a wrapper -->
  <span :title="disabledReason">
    <Button
      :disabled="!!disabledReason"
      icon="pi pi-plus"
      :label="effectName"
      severity="success"
      @click="() => (visible = true)"
    />
  </span>

  <Dialog
    v-model:visible="visible"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    dismissable-mask
    :header="effectName"
    modal
    :style="{ width: '50rem' }"
  >
    <!-- Top padding, so the scrolling dialog content does not clip the float label of the
         first setting, which sticks out above its input -->
    <EffectPropsGrid class="pt-2">
      <slot />
    </EffectPropsGrid>
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
