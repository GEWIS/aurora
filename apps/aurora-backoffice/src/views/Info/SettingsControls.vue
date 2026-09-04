<template>
  <div v-if="visibleSchema.length === 0" class="italic opacity-60">No settings.</div>
  <div v-for="s in visibleSchema" :key="s.key" class="flex flex-col gap-1">
    <label class="text-sm opacity-70">{{ s.label }}</label>
    <ToggleSwitch
      v-if="s.type === 'boolean'"
      :model-value="!!values[s.key]"
      @update:model-value="(v: boolean) => emit('update', s.key, v)"
    />
    <Select
      v-else-if="s.type === 'select'"
      filter
      fluid
      :model-value="values[s.key]"
      option-label="label"
      option-value="value"
      :options="s.options"
      @update:model-value="(v: string) => emit('update', s.key, v)"
    />
    <InputNumber
      v-else-if="s.type === 'number'"
      :max="s.max"
      :max-fraction-digits="s.step || 0"
      :min="s.min"
      :min-fraction-digits="0"
      :model-value="Number(values[s.key])"
      @update:model-value="(v: number) => emit('update', s.key, v)"
    />
    <template v-else-if="s.type === 'text'">
      <InputText
        :model-value="String(values[s.key] ?? '')"
        @update:model-value="(v: string | undefined) => emit('update', s.key, v ?? '')"
      />
      <ValidateButton v-if="s.validate" :kind="s.validate" :value="String(values[s.key] ?? '')" />
    </template>
    <BackgroundPicker
      v-else-if="s.type === 'background'"
      :model-value="String(values[s.key] ?? '')"
      :options="s.options ?? []"
      @update:model-value="(v: string) => emit('update', s.key, v)"
    />
    <EntityControl
      v-else-if="s.type === 'entity' && s.entity"
      :entity="s.entity"
      :model-value="asList(values[s.key])"
      :selectable="!!s.selectable"
      @update:model-value="(v: string[]) => emit('update', s.key, v)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WidgetSetting, WidgetSettingValue } from '@gewis/aurora-api-client';
import BackgroundPicker from '@/views/Info/BackgroundPicker.vue';
import EntityControl from '@/views/Info/EntityControl.vue';
import ValidateButton from '@/views/Info/ValidateButton.vue';

const props = defineProps<{
  schema: WidgetSetting[];
  values: Record<string, WidgetSettingValue>;
}>();

const emit = defineEmits<{ (e: 'update', key: string, value: WidgetSettingValue): void }>();

/** Coerce a setting value to a string list for the entity multiselect. */
function asList(value: WidgetSettingValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

// Only show settings whose `visibleWhen` condition matches the current values.
const visibleSchema = computed(() =>
  props.schema.filter(
    (s) => !s.visibleWhen || props.values[s.visibleWhen.key] === s.visibleWhen.value,
  ),
);
</script>
