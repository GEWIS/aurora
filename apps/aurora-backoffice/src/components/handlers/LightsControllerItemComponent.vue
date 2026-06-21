<template>
  <AppBox>
    <div class="flex max-w-full w-full">
      <h6 class="mb-4">
        {{ controller.name }}
      </h6>
      <StatusIcon
        class="ml-2"
        :status="statusStore.lightControllerStatus.get(controller.id)"
        :subscriber="controller"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 xxl:grid-cols-3 gap-5">
      <div v-for="group in lightsGroups" :key="group.id">
        <div class="mb-2">
          <h6 class="mb-0">
            {{ group.name }}
          </h6>
        </div>
        <SubscriberHandlerChangeSelect
          :current-handler="handlersStore.lightsHandlers.find((h) => !!h.entities.find((e) => e.id === group.id))"
          :disabled="!authStore.isInSecurityGroup('handler', 'privileged')"
          :loading="handlersStore.gettingLights || handlersStore.settingLights"
          :possible-handlers="handlersStore.lightsHandlers"
          @change="(newHandler: string | null) => handlersStore.setLightsHandler(group.id, newHandler)"
        />
      </div>
    </div>
  </AppBox>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSubscriberStore } from '@/stores/subscriber.store';
import { useHandlersStore } from '@/stores/handlers.store';
import SubscriberHandlerChangeSelect from '@/components/handlers/SubscriberHandlerChangeSelect.vue';
import StatusIcon from '@/components/handlers/StatusIcon.vue';
import type { LightsControllerResponse } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import { useStatusStore } from '@/stores/status.store';
import AppBox from '@/layout/AppBox.vue';

const props = defineProps<{
  controller: LightsControllerResponse;
}>();

const subscriberStore = storeToRefs(useSubscriberStore());
const lightsGroups = subscriberStore.lightsGroups.value.filter((g) => g.controller.id === props.controller.id);
const handlersStore = useHandlersStore();
const authStore = useAuthStore();
const statusStore = useStatusStore();
</script>

<style lang="scss"></style>
