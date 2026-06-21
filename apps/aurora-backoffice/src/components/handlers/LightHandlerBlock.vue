<template>
  <AppContainer icon="pi-lightbulb" title="Lights">
    <div v-if="handlersStore.fetchLightsHandlers.length > 0">
      <div v-for="controller in controllers" :key="controller.id">
        <LightsControllerItemComponent :controller="controller" />
      </div>
    </div>
    <div v-else>Could not load lights handlers.</div>
  </AppContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useSubscriberStore } from '@/stores/subscriber.store';
import LightsControllerItemComponent from '@/components/handlers/LightsControllerItemComponent.vue';
import AppContainer from '@/layout/AppContainer.vue';
import { useHandlersStore } from '@/stores/handlers.store';

const handlersStore = useHandlersStore();
const subscriberStore = storeToRefs(useSubscriberStore());
const controllers = computed(() =>
  subscriberStore.lightsGroups.value
    .map((g) => g.controller)
    .filter((c1, index, all) => index === all.findIndex((c2) => c1.id === c2.id)),
);
</script>
