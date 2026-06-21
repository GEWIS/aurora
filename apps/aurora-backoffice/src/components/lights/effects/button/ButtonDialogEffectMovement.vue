<template>
  <Select
    id="controller-button-movement-effect"
    v-model="chosenEffect"
    option-label="label"
    option-value="value"
    :options="effectOptions"
    placeholder="Select an effect..."
  />
  <LightsGroupsSelect v-model="lightsGroupIds" />
  <Divider />
  <EffectClassicRotate
    v-if="chosenEffect === MovementEffectsClassicRotate.CLASSIC_ROTATE"
    :default-model-value="
      defaultProperties?.effectProps.type === MovementEffectsClassicRotate.CLASSIC_ROTATE
        ? defaultProperties.effectProps
        : undefined
    "
    @update:model-value="(e) => (effect = e)"
  />
  <EffectRandomPosition
    v-if="chosenEffect === MovementEffectsRandomPosition.RANDOM_POSITION"
    :default-model-value="
      defaultProperties?.effectProps.type === MovementEffectsRandomPosition.RANDOM_POSITION
        ? defaultProperties.effectProps
        : undefined
    "
    @update:model-value="(e) => (effect = e)"
  />
  <EffectSearchLight
    v-if="chosenEffect === MovementEffectsSearchLight.SEARCH_LIGHT"
    :default-model-value="
      defaultProperties?.effectProps.type === MovementEffectsSearchLight.SEARCH_LIGHT
        ? defaultProperties.effectProps
        : undefined
    "
    @update:model-value="(e) => (effect = e)"
  />
  <EffectTableRotate
    v-if="chosenEffect === MovementEffectsTableRotate.TABLE_ROTATE"
    :default-model-value="
      defaultProperties?.effectProps.type === MovementEffectsTableRotate.TABLE_ROTATE
        ? defaultProperties.effectProps
        : undefined
    "
    @update:model-value="(e) => (effect = e)"
  />
  <EffectZigZag
    v-if="chosenEffect === MovementEffectsZigZag.ZIG_ZAG"
    :default-model-value="
      defaultProperties?.effectProps.type === MovementEffectsZigZag.ZIG_ZAG ? defaultProperties.effectProps : undefined
    "
    @update:model-value="(e) => (effect = e)"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  type LightsButtonEffectMovement,
  type LightsEffectsMovementCreateParams,
  MovementEffectsClassicRotate,
  MovementEffectsRandomPosition,
  MovementEffectsSearchLight,
  MovementEffectsTableRotate,
  MovementEffectsZigZag,
} from '@/api';
import LightsGroupsSelect from '@/components/lights/effects/button/LightsGroupsSelect.vue';
import EffectClassicRotate from '@/components/lights/effects/movement/EffectClassicRotate.vue';
import EffectRandomPosition from '@/components/lights/effects/movement/EffectRandomPosition.vue';
import EffectSearchLight from '@/components/lights/effects/movement/EffectSearchLight.vue';
import EffectTableRotate from '@/components/lights/effects/movement/EffectTableRotate.vue';
import EffectZigZag from '@/components/lights/effects/movement/EffectZigZag.vue';

const props = defineProps<{
  defaultProperties?: LightsButtonEffectMovement;
}>();

const emit = defineEmits<{
  'update:modelValue': [properties: LightsButtonEffectMovement];
  inputValid: [valid: boolean];
}>();

const chosenEffect = ref<LightsEffectsMovementCreateParams['type'] | undefined>(
  props.defaultProperties?.effectProps.type,
);
const lightsGroupIds = ref<number[]>(props.defaultProperties?.lightsGroupIds || []);
const effect = ref<LightsEffectsMovementCreateParams | undefined>(props.defaultProperties?.effectProps || undefined);

const effectOptions = computed(() => {
  return [
    { label: 'ClassicRotate', value: MovementEffectsClassicRotate.CLASSIC_ROTATE },
    { label: 'RandomPosition', value: MovementEffectsRandomPosition.RANDOM_POSITION },
    { label: 'SearchLight', value: MovementEffectsSearchLight.SEARCH_LIGHT },
    { label: 'TableRotate', value: MovementEffectsTableRotate.TABLE_ROTATE },
    { label: 'ZigZag', value: MovementEffectsZigZag.ZIG_ZAG },
  ];
});

const handleChange = () => {
  const inputIsValid: boolean = chosenEffect.value !== undefined && lightsGroupIds.value.length > 0;
  emit('inputValid', inputIsValid);

  if (effect.value === undefined) return;
  const properties: LightsButtonEffectMovement = {
    type: 'LightsButtonEffectMovement',
    lightsGroupIds: lightsGroupIds.value,
    effectProps: effect.value,
  };
  emit('update:modelValue', properties);
};

watch([chosenEffect, lightsGroupIds, effect], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
