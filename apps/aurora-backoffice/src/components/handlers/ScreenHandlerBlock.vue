<template>
  <AppContainer icon="pi-desktop" title="Screens">
    <div
      v-if="handlersStore.fetchScreenHandlers.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 xxl:grid-cols-3 gap-5"
    >
      <div v-for="screen in subscriberStore.screens.value" :key="screen.id">
        <SubscriberItemContent
          :current-handler="handlersStore.screenHandlers.find((h) => !!h.entities.find((e) => e.id === screen.id))"
          :disabled="!authStore.isInSecurityGroup('handler', 'privileged')"
          :loading="handlersStore.gettingScreens || handlersStore.settingScreens"
          :possible-handlers="handlersStore.screenHandlers"
          :status="statusStore.screenStatus.get(screen.id)"
          :subscriber="screen"
          @change="(newHandler: string | null) => handlersStore.setScreenHandler(screen.id, newHandler)"
        />
      </div>
    </div>
    <div v-else>Could not load screen handlers.</div>
  </AppContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSubscriberStore } from '@/stores/subscriber.store';
import { useHandlersStore } from '@/stores/handlers.store';
import SubscriberItemContent from '@/components/handlers/SubscriberItemContent.vue';
import AppContainer from '@/layout/AppContainer.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useStatusStore } from '@/stores/status.store';

const subscriberStore = storeToRefs(useSubscriberStore());
const handlersStore = useHandlersStore();
const authStore = useAuthStore();
const statusStore = useStatusStore();
</script>

<style scoped lang="scss"></style>
