<template>
  <div class="flex flex-col gap-3">
    <!-- preset swatches -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="p in options"
        :key="p.value"
        v-tooltip.top="p.label"
        class="h-7 w-7 rounded border border-white/40 ring-1 ring-inset ring-black/40 ring-offset-1 ring-offset-surface-800 hover:ring-2 hover:ring-primary-400"
        :class="p.value === modelValue ? 'ring-2 ring-primary-400' : ''"
        :style="bgStyle(p.value)"
        type="button"
        @click="emit('update:modelValue', p.value)"
      />
    </div>

    <!-- custom controls -->
    <div class="flex items-center gap-3">
      <ColorPicker format="hex" :model-value="parsed.hex" @update:model-value="onColor" />
      <div class="flex flex-1 flex-col gap-1">
        <label class="text-xs opacity-60">Opacity — {{ parsed.opacity }}%</label>
        <Slider :max="100" :min="0" :model-value="parsed.opacity" @update:model-value="onOpacity" />
      </div>
      <div
        class="h-9 w-16 shrink-0 rounded border border-white/40 ring-1 ring-inset ring-black/40"
        :style="bgStyle(modelValue)"
      />
    </div>

    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <ToggleSwitch :model-value="parsed.border" @update:model-value="onBorder" />
        <label class="text-sm">Border</label>
      </div>
      <div class="flex items-center gap-2">
        <ToggleSwitch :model-value="parsed.blur" @update:model-value="onBlur" />
        <label class="text-sm">Blur (glass)</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WidgetSettingOption } from '@gewis/aurora-api-client';
import { bgStyle, encodeBg, parseBg } from '@/views/Info/background';

const props = defineProps<{
  modelValue: string;
  options: WidgetSettingOption[];
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const parsed = computed(() => parseBg(props.modelValue));

function onColor(hex: string | number) {
  emit('update:modelValue', encodeBg({ ...parsed.value, hex: String(hex) }));
}
function onOpacity(v: number | number[]) {
  emit('update:modelValue', encodeBg({ ...parsed.value, opacity: Array.isArray(v) ? v[0] : v }));
}
function onBorder(v: boolean) {
  emit('update:modelValue', encodeBg({ ...parsed.value, border: v }));
}
function onBlur(v: boolean) {
  emit('update:modelValue', encodeBg({ ...parsed.value, blur: v }));
}
</script>
