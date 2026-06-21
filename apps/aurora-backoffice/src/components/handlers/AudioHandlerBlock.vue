<template>
  <AppContainer icon="pi-volume-up" title="Audio">
    <div
      v-if="handlersStore.fetchAudioHandlers.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 xxl:grid-cols-3 gap-5"
    >
      <div v-for="audio in subscriberStore.audios.value" :key="audio.id">
        <SubscriberItemContent
          :current-handler="handlersStore.fetchAudioHandlers.find((h) => !!h.entities.find((e) => e.id === audio.id))"
          :disabled="!authStore.isInSecurityGroup('handler', 'privileged')"
          :loading="handlersStore.isGettingAudio || handlersStore.isSettingAudio"
          :possible-handlers="handlersStore.audioHandlers"
          :status="statusStore.audioStatus.get(audio.id)"
          :subscriber="audio"
          @change="(newHandler: string | null) => handlersStore.setAudioHandler(audio.id, newHandler)"
        />
      </div>
    </div>
    <div v-else>Could not load audio handlers.</div>
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

const authStore = useAuthStore();
const subscriberStore = storeToRefs(useSubscriberStore());
const handlersStore = useHandlersStore();
const statusStore = useStatusStore();
</script>

<style scoped lang="scss"></style>
