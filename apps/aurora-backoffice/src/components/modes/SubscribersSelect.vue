<template>
  <div class="flex flex-col gap-2 w-full max-w-full">
    <MultiSelect
      class="w-full sm:max-w-80 mx-auto"
      filter
      :max-selected-labels="2"
      :model-value="selectedAudios"
      option-label="name"
      option-value="id"
      :options="store.audios"
      placeholder="Select audio"
      :title="
        store.audios
          .filter((a) => selectedAudios.includes(a.id))
          .map((a) => a.name)
          .join(', ')
      "
      @update:model-value="(value: number[]) => $emit('update:audios', value)"
    />
    <MultiSelect
      class="w-full sm:max-w-80 mx-auto"
      filter
      :max-selected-labels="2"
      :model-value="selectedScreens"
      option-label="name"
      option-value="id"
      :options="store.screens"
      placeholder="Select screens"
      :title="
        store.screens
          .filter((a) => selectedScreens.includes(a.id))
          .map((a) => a.name)
          .join(', ')
      "
      @update:model-value="(value: number[]) => $emit('update:screens', value)"
    />
    <MultiSelect
      class="w-full sm:max-w-80 mx-auto"
      filter
      :max-selected-labels="2"
      :model-value="selectedLightGroups"
      option-label="name"
      option-value="id"
      :options="store.lightsGroups"
      placeholder="Select lights..."
      :title="
        store.lightsGroups
          .filter((a) => selectedLightGroups.includes(a.id))
          .map((a) => a.name)
          .join(', ')
      "
      @update:model-value="(value: number[]) => $emit('update:light-groups', value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useSubscriberStore } from '@/stores/subscriber.store';

defineProps<{
  selectedAudios: number[];
  selectedScreens: number[];
  selectedLightGroups: number[];
}>();

defineEmits<{
  'update:audios': [ids: number[]];
  'update:screens': [ids: number[]];
  'update:light-groups': [ids: number[]];
}>();

const store = useSubscriberStore();
</script>

<style scoped></style>
