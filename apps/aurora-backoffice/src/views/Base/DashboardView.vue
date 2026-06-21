<template>
  <div class="flex flex-row gap-10 justify-between">
    <h1>Hello, {{ authStore.name }}</h1>
    <DevGuard>
      <DevSettings />
    </DevGuard>
  </div>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
    <AuthGuard group="handler" section="base">
      <div class="flex flex-col gap-10">
        <ScreenHandlerBlock />
        <AudioHandlerBlock />
        <LightHandlerBlock />
      </div>
    </AuthGuard>
    <div class="flex flex-col gap-10">
      <ShortcutBlock />
      <AuthGuard group="audit" section="base">
        <AuditBlock />
      </AuthGuard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import ShortcutBlock from '@/components/shortcuts/ShortcutBlock.vue';
import AuditBlock from '@/components/audit/AuditBlock.vue';
import ScreenHandlerBlock from '@/components/handlers/ScreenHandlerBlock.vue';
import AudioHandlerBlock from '@/components/handlers/AudioHandlerBlock.vue';
import LightHandlerBlock from '@/components/handlers/LightHandlerBlock.vue';
import DevSettings from '@/components/auth/DevSettings.vue';
import DevGuard from '@/components/auth/DevGuard.vue';
import AuthGuard from '@/components/auth/AuthGuard.vue';

const authStore = useAuthStore();
</script>
