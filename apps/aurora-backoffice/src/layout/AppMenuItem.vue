<template>
  <li :class="{ 'layout-root-menuitem': root }">
    <p v-if="root" class="layout-menuitem-root-text p-card-title">
      {{ item.label }}
    </p>

    <RouterLink
      v-if="item.to && !item.items"
      :class="{ 'active-route': checkActiveRoute(item) }"
      tabindex="0"
      :to="item.to"
      @click="itemClick"
    >
      <i class="layout-menuitem-icon" :class="item.icon" />
      <span class="layout-menuitem-text">{{ item.label }}</span>
    </RouterLink>

    <Transition v-if="item.items" name="layout-submenu">
      <ul v-show="root" class="layout-submenu">
        <template v-for="(child, i) in item.items" :key="child">
          <AppMenuItem :index="i" :item="child" :root="false" />
        </template>
      </ul>
    </Transition>
  </li>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useLayoutStore } from '@/stores/layout.store';

export interface MenuItem {
  label: string;
  icon?: string;
  to?: string;
  items?: MenuItem[];
}

defineProps({
  item: {
    type: Object as () => MenuItem,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  root: {
    type: Boolean,
    default: true,
  },
  parentItemKey: {
    type: String,
    default: null,
  },
});

const layoutStore = useLayoutStore();
const route = useRoute();

const checkActiveRoute = (item: MenuItem) => {
  return route.path === item.to;
};

const itemClick = () => {
  if (layoutStore.menuMobileActive) {
    layoutStore.switchMenuMobile();
  }
};
</script>

<style lang="scss" scoped></style>
