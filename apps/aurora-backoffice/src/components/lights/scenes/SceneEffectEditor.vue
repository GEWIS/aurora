<template>
  <Panel :header="`Effect ${index + 1}`">
    <template #icons>
      <div class="flex flex-row gap-2">
        <SelectButton
          v-if="kind === 'movement' || subscriberStore.movingHeadLightsGroups.length > 0"
          v-model="kind"
          :allow-empty="false"
          option-label="label"
          option-value="value"
          :options="kindOptions"
          size="small"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
          title="Remove effect"
          @click="$emit('remove')"
        />
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <ButtonDialogEffectColor
        v-if="kind === 'color'"
        :default-properties="defaultColorProperties"
        show-colors
        @input-valid="(v) => (childValid = v)"
        @update:model-value="(p) => (properties = p)"
      />
      <ButtonDialogEffectMovement
        v-else
        :default-properties="defaultMovementProperties"
        @input-valid="(v) => (childValid = v)"
        @update:model-value="(p) => (properties = p)"
      />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  type LightsButtonEffectColor,
  type LightsButtonEffectMovement,
  type LightsEffectsColorCreateParams,
  type LightsEffectsMovementCreateParams,
  type LightsSceneEffectParams,
  type LightsSceneEffectResponse,
  MovementEffectsClassicRotate,
  MovementEffectsRandomPosition,
  MovementEffectsSearchLight,
  MovementEffectsTableRotate,
  MovementEffectsZigZag,
} from '@gewis/aurora-api-client';
import ButtonDialogEffectColor from '@/components/lights/effects/button/ButtonDialogEffectColor.vue';
import ButtonDialogEffectMovement from '@/components/lights/effects/button/ButtonDialogEffectMovement.vue';
import { useSubscriberStore } from '@/stores/subscriber.store';

type EffectKind = 'color' | 'movement';

const movementEffectTypes: string[] = [
  MovementEffectsClassicRotate.CLASSIC_ROTATE,
  MovementEffectsRandomPosition.RANDOM_POSITION,
  MovementEffectsSearchLight.SEARCH_LIGHT,
  MovementEffectsTableRotate.TABLE_ROTATE,
  MovementEffectsZigZag.ZIG_ZAG,
];

const props = defineProps<{
  index: number;
  defaultEffect?: LightsSceneEffectResponse;
}>();

const emit = defineEmits<{
  'update:modelValue': [effect: LightsSceneEffectParams | undefined];
  inputValid: [valid: boolean];
  remove: [];
}>();

// Movement effects only apply to moving heads, so only offer them when there are any
const subscriberStore = useSubscriberStore();

const kindOptions: { label: string; value: EffectKind }[] = [
  { label: 'Color', value: 'color' },
  { label: 'Movement', value: 'movement' },
];

const initialKind: EffectKind =
  props.defaultEffect && movementEffectTypes.includes(props.defaultEffect.type)
    ? 'movement'
    : 'color';
const kind = ref<EffectKind>(initialKind);

// Convert the scene effect to the shape the (predefined effect) button editors expect
const defaultLightsGroupIds = props.defaultEffect?.lightsGroups.map((g) => g.id) ?? [];
const defaultColorProperties: LightsButtonEffectColor | undefined =
  props.defaultEffect && initialKind === 'color'
    ? {
        type: 'LightsButtonEffectColor',
        lightsGroupIds: defaultLightsGroupIds,
        effectProps: {
          type: props.defaultEffect.type,
          props: props.defaultEffect.props,
        } as LightsEffectsColorCreateParams,
      }
    : undefined;
const defaultMovementProperties: LightsButtonEffectMovement | undefined =
  props.defaultEffect && initialKind === 'movement'
    ? {
        type: 'LightsButtonEffectMovement',
        lightsGroupIds: defaultLightsGroupIds,
        effectProps: {
          type: props.defaultEffect.type,
          props: props.defaultEffect.props,
        } as LightsEffectsMovementCreateParams,
      }
    : undefined;

const properties = ref<LightsButtonEffectColor | LightsButtonEffectMovement | undefined>();
const childValid = ref<boolean>(false);

/**
 * Predefined effect buttons take their colors from the global palette, so the button
 * editors do not validate them. Scenes store their own colors, so check them here.
 */
const hasColors = (effect: LightsSceneEffectParams): boolean => {
  if ('colors' in effect.props) return effect.props.colors.length > 0;
  if ('color' in effect.props) return !!effect.props.color;
  return true;
};

const handleChange = () => {
  const effect: LightsSceneEffectParams | undefined = properties.value
    ? { lightsGroups: properties.value.lightsGroupIds, ...properties.value.effectProps }
    : undefined;
  emit('inputValid', childValid.value && !!effect && hasColors(effect));
  emit('update:modelValue', effect);
};

watch(kind, () => {
  properties.value = undefined;
  childValid.value = false;
});
watch([properties, childValid], handleChange);
</script>

<style scoped></style>
