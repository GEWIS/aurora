<template>
  <span class="flex min-w-0 items-center gap-2">
    <span class="flex w-10 shrink-0 gap-1">
      <i v-if="keyholder.isBoard" class="pi pi-star-fill text-amber-400" />
      <i v-if="keyholder.isCandidateBoard" class="pi pi-star-half-fill text-amber-400" />
      <i v-if="keyholder.isKeyholder" class="pi pi-key text-sky-400" />
    </span>
    <span class="truncate">{{ keyholder.name }}</span>
    <span class="ml-auto shrink-0 pl-3 text-sm opacity-60">{{ keyholder.memberId ?? '—' }}</span>
  </span>
</template>

<script setup lang="ts">
import type { KeyholderResponse } from '@gewis/aurora-api-client';

/**
 * One keyholder as a single line: their board/keyholder symbols, their name,
 * and their membership number. Used for both the options and the selected value
 * of the responsible-person pickers, so what you search by is also what you see.
 */
defineProps<{ keyholder: KeyholderResponse }>();
</script>
