<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">Default</Tab>
      <Tab value="1">Advanced</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <EffectsControllerSimple />
      </TabPanel>
      <TabPanel value="1">
        <EffectsControllerAdvanced />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import EffectsControllerSimple from '@/views/Lights/EffectsControllerSimple.vue';
import EffectsControllerAdvanced from '@/views/Lights/EffectsControllerAdvanced.vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';

const store = useEffectsControllerStore();
void store.init();
</script>

<style scoped></style>
