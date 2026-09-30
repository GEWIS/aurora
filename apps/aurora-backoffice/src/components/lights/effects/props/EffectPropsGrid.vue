<template>
  <!-- Lays out the settings of an effect in two columns when there is enough room -->
  <div class="@container">
    <div class="grid grid-cols-1 @[32rem]:grid-cols-2 gap-x-4 gap-y-3 items-start">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
