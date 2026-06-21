<template>
  <ToggleButton :disabled="disabled" :model-value="!!enabled" off-label="" on-label="">
    <div class="flex flex-col gap-3">
      <span class="font-bold">{{ lightsGroup.name }} (ID: {{ lightsGroup.id }})</span>
      <div>
        <ul>
          <li>Pars: {{ lightsGroup.pars.length }}</li>
          <li>MH's: {{ lightsGroup.movingHeadRgbs.length + lightsGroup.movingHeadWheels.length }}</li>
        </ul>
      </div>
    </div>
  </ToggleButton>
</template>

<script setup lang="ts">
import type { LightsGroupResponse } from '@/api';

defineProps<{
  lightsGroup: LightsGroupResponse;
  disabled?: boolean;
  enabled?: boolean;
}>();
</script>
