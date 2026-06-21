<template>
  <Panel :header="lightGroups.map((g) => g?.name).join(', ')" @click="setEffect()">
    <div class="flex flex-col gap-2 justify-start">
      <div class="font-italic">
        <timeago :auto-update="5" :datetime="effect.timestamp" />
      </div>
      <div>
        <SavedEffect v-if="effect.colorEffect !== undefined" :effect="effect.colorEffect" />
        <SavedEffect v-if="effect.movementEffect !== undefined" :effect="effect.movementEffect" />
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { type PushedEffect, useEffectsControllerStore } from '@/stores/effects-controller.store';
import { useHandlersStore } from '@/stores/handlers.store';
import SavedEffect from '@/components/lights/effects/SavedEffect.vue';

const props = defineProps<{
  effect: PushedEffect;
}>();

const store = useHandlersStore();
const lightGroups = props.effect.lightGroupIds.map((id: number) =>
  store.getRegisteredLights().find((g) => g.id === id),
);
const effectsControllerStore = useEffectsControllerStore();

const setEffect = async () => {
  if (props.effect.colorEffect !== undefined) {
    await effectsControllerStore.setColorEffect(props.effect.colorEffect, props.effect.lightGroupIds);
  }
  if (props.effect.movementEffect !== undefined) {
    await effectsControllerStore.setMovementEffect(props.effect.movementEffect, props.effect.lightGroupIds);
  }
};
</script>

<style scoped>
.p-card-body {
  padding: 0.5rem !important;
}
</style>
