<template>
  <FloatLabel variant="on">
    <MultiSelect
      class="w-full"
      filter
      :input-id="inputId"
      :model-value="modelValue"
      option-label="name"
      option-value="id"
      :options="movingHeadsOnly ? store.movingHeadLightsGroups : store.lightsGroups"
      :title="
        store.lightsGroups
          .filter((a) => modelValue.includes(a.id))
          .map((a) => a.name)
          .join(', ')
      "
      @update:model-value="(value) => $emit('update:modelValue', value)"
    />
    <label :for="inputId">Lights groups</label>
  </FloatLabel>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import { useSubscriberStore } from '@/stores/subscriber.store';

const store = useSubscriberStore();
const inputId = `lights-groups-${useId()}`;

defineProps<{
  modelValue: number[];
  /** Only list lights groups that contain moving heads */
  movingHeadsOnly?: boolean;
}>();

defineEmits<{
  'update:modelValue': [ids: number[]];
}>();
</script>

<style scoped></style>
