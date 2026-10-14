<template>
  <StepItem v-if="wrap" :value="value">
    <Step>{{ header }}</Step>
    <slot />
  </StepItem>
  <slot v-else />
</template>

<script setup lang="ts">
import StepItem from 'openvue/stepitem';
import Step from 'openvue/step';

defineProps<{
  wrap: boolean;
  value: string;
  header: string;
}>();
</script>
