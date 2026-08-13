<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      :disabled="!value"
      icon="pi pi-bolt"
      label="Test"
      :loading="loading"
      severity="secondary"
      size="small"
      @click="run"
    />
    <span v-if="result" class="text-sm" :class="result.valid ? 'text-green-400' : 'text-red-400'">
      <i class="pi" :class="result.valid ? 'pi-check' : 'pi-times'" /> {{ result.message }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  validateInfoValue,
  type ValidationParams,
  type ValidationResult,
} from '@gewis/aurora-api-client';

const props = defineProps<{ kind: ValidationParams['kind']; value: string }>();

const loading = ref(false);
const result = ref<ValidationResult | null>(null);

// A changed value invalidates the previous result.
watch(
  () => props.value,
  () => {
    result.value = null;
  },
);

async function run() {
  loading.value = true;
  result.value = null;
  const res = await validateInfoValue({ body: { kind: props.kind, value: props.value } });
  result.value =
    res.response.ok && res.data
      ? res.data
      : { valid: false, message: 'Validation request failed.' };
  loading.value = false;
}
</script>
