<template>
  <div class="flex align-items-center justify-center min-h-screen min-w-screen overflow-hidden">
    <div class="flex flex-col align-items-center justify-center">
      <Card>
        <template #content>
          <div class="w-full py-8 px-5 sm:px-8 flex flex-col align-items-center rounded-2xl">
            <div v-if="authorizing" class="text-900 font-bold text-3xl lg:text-5xl mb-5">Authorizing</div>
            <div v-else class="text-900 font-bold text-3xl lg:text-5xl mb-5">Connecting</div>
            <span class="font-bold text-3xl">
              <ProgressBar mode="indeterminate" style="height: 6px" />
            </span>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  authorizing: {
    type: Boolean,
    default: false,
  },
});
</script>
