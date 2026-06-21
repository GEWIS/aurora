<template>
  <AppContainer icon="pi-sparkles" title="Effects controller (Advanced)">
    <template #header>
      <BeatVisualizer />
    </template>

    <!-- Light groups -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      <Card class="w-full">
        <template #title> (1) Lights groups </template>
        <template #content>
          <div class="flex flex-col gap-5 w-100">
            <div class="flex flex-row gap-5 w-100">
              <Button
                class="w-1/2 text-center"
                severity="secondary"
                @click="effectsControllerStore.resetLightsGroupSelection()"
              >
                Reset
              </Button>
              <Button
                class="w-1/2 text-center"
                severity="secondary"
                @click="effectsControllerStore.selectAllLightsGroups(activeLightGroups)"
              >
                Select all
              </Button>
            </div>
            <div class="flex flex-col gap-5">
              <div v-for="group in activeLightGroups" :key="group.id">
                <LightsGroupToggleButton
                  class="w-full"
                  :enabled="effectsControllerStore.selectedLightsGroupIds.includes(group.id)"
                  :lights-group="group"
                  @click="() => effectsControllerStore.toggleLightsGroup(group.id)"
                />
              </div>
              <div v-for="group in inactiveLightGroups" :key="group.id">
                <LightsGroupToggleButton class="w-full" disabled :lights-group="group" />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Create effects -->
      <Card>
        <template #title> (2) Create effects </template>
        <template #content>
          <h4 class="mt-0 mb-1">Colors</h4>
          <div class="flex flex-col gap-5 mb-5">
            <EffectBackgroundPulseDialog @save="effectsControllerStore.setColorEffect" />
            <EffectBeatFadeOutDialog @save="effectsControllerStore.setColorEffect" />
            <EffectRandomColorDialog @save="effectsControllerStore.setColorEffect" />
            <EffectSparkleDialog @save="effectsControllerStore.setColorEffect" />
            <EffectStaticColorDialog @save="effectsControllerStore.setColorEffect" />
            <EffectWaveDialog @save="effectsControllerStore.setColorEffect" />
          </div>
          <h4 class="mt-2 mb-1">Movement</h4>
          <div class="flex flex-col gap-5">
            <EffectSearchLightDialog @save="effectsControllerStore.setMovementEffect" />
            <EffectTableRotateDialog @save="effectsControllerStore.setMovementEffect" />
            <EffectClassicRotateDialog @save="effectsControllerStore.setMovementEffect" />
            <EffectRandomPositionDialog @save="effectsControllerStore.setMovementEffect" />
            <EffectZigZagDialog @save="effectsControllerStore.setMovementEffect" />
          </div>
        </template>
      </Card>

      <!-- Other effects & settings -->
      <Card>
        <template #title> Other effects & settings </template>
        <template #content>
          <div class="flex flex-col gap-5">
            <StrobeButton />
            <Button
              :disabled="effectsControllerStore.selectedLightsGroupIds.length === 0"
              severity="secondary"
              @click="() => effectsControllerStore.disableLightsColors()"
            >
              Disable colors
            </Button>
            <Button
              :disabled="effectsControllerStore.selectedLightsGroupIds.length === 0"
              severity="secondary"
              @click="() => effectsControllerStore.disableLightsMovement()"
            >
              Disable movement
            </Button>
            <Divider />
            <ArtificialBeatDialog />
          </div>
        </template>
      </Card>
    </div>

    <div class="w-full">
      <Card>
        <template #title> Past effects </template>
        <template #content>
          <div class="overflow-y-scroll w-full">
            <div class="flex flex-row gap-5">
              <div v-for="effect in effectsControllerStore.pastPushedEffects" :key="effect.timestamp.getTime()">
                <EffectHistoryCard :effect="effect" />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import LightsGroupToggleButton from '@/components/lights/effects/LightsGroupToggleButton.vue';
import { useHandlersStore } from '@/stores/handlers.store';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';
import StrobeButton from '@/components/lights/effects/other/StrobeButton.vue';
import EffectHistoryCard from '@/components/lights/effects/EffectHistoryCard.vue';
import BeatVisualizer from '@/components/audio/BeatVisualizer.vue';
import ArtificialBeatDialog from '@/components/audio/ArtificialBeatDialog.vue';
import { useSubscriberStore } from '@/stores/subscriber.store';
import AppContainer from '@/layout/AppContainer.vue';
import EffectBeatFadeOutDialog from '@/components/lights/effects/color/EffectBeatFadeOutDialog.vue';
import EffectWaveDialog from '@/components/lights/effects/color/EffectWaveDialog.vue';
import EffectStaticColorDialog from '@/components/lights/effects/color/EffectStaticColorDialog.vue';
import EffectSparkleDialog from '@/components/lights/effects/color/EffectSparkleDialog.vue';
import EffectSearchLightDialog from '@/components/lights/effects/movement/EffectSearchLightDialog.vue';
import EffectTableRotateDialog from '@/components/lights/effects/movement/EffectTableRotateDialog.vue';
import EffectClassicRotateDialog from '@/components/lights/effects/movement/EffectClassicRotateDialog.vue';
import EffectRandomPositionDialog from '@/components/lights/effects/movement/EffectRandomPositionDialog.vue';
import EffectBackgroundPulseDialog from '@/components/lights/effects/color/EffectBackgroundPulseDialog.vue';
import EffectRandomColorDialog from '@/components/lights/effects/color/EffectRandomColorDialog.vue';
import EffectZigZagDialog from '@/components/lights/effects/movement/EffectZigZagDialog.vue';

const handlersStore = useHandlersStore();
const effectsControllerStore = useEffectsControllerStore();
const subscriberStore = useSubscriberStore();

const activeLightGroups = handlersStore.getRegisteredLights('SetEffectsHandler');
const inactiveLightGroups = subscriberStore.lightsGroups.filter(
  (l1) => !activeLightGroups.find((l2) => l1.id === l2.id),
);
</script>

<style scoped lang="scss">
.grid > div {
  padding: 0.5rem;
}
</style>
