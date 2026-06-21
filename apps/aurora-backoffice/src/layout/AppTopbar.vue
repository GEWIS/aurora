<template>
  <div class="layout-topbar">
    <router-link class="layout-topbar-logo" to="/">
      <img alt="logo" :src="logoUrl" />
      <span>Aurora</span>
    </router-link>

    <button class="p-link layout-topbar-button left" @click="switchMenu">
      <i class="pi pi-bars" />
    </button>

    <div class="p-link layout-topbar-button right" @click="onThemeChangeButton">
      <i
        :class="[
          'pi',
          {
            'pi-moon': !darkMode,
            'pi-sun': darkMode,
          },
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useLayoutStore } from '@/stores/layout.store';

const layoutStore = useLayoutStore();
const { darkMode } = storeToRefs(layoutStore);

const logoUrl = computed(() => {
  return `/layout/images/${darkMode.value ? 'helmet-white' : 'helmet-black'}.svg`;
});

const switchMenu = () => {
  if (window.innerWidth > 991) {
    layoutStore.switchMenuDesktop();
  } else {
    layoutStore.switchMenuMobile();
  }
};

const onThemeChangeButton = () => {
  layoutStore.switchTheme();
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles.scss';
</style>
