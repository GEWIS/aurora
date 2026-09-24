<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" single-color />
  <FloatLabel v-if="gobos.length > 0" variant="on">
    <Select v-model="gobo" class="w-full" :input-id="`gobo-${uid}`" :options="gobos" show-clear />
    <label :for="`gobo-${uid}`">Gobo</label>
  </FloatLabel>
  <FloatLabel v-if="goboRotates.length > 0" variant="on">
    <Select
      v-model="goboRotate"
      class="w-full"
      :input-id="`gobo-rotate-${uid}`"
      :options="goboRotates"
      show-clear
    />
    <label :for="`gobo-rotate-${uid}`">Gobo rotation</label>
  </FloatLabel>
  <SelectorBoolean id="beat-toggle" v-model="beatToggle" name="Beat toggle" />
  <SelectorRatioSlider
    id="relative-brightness"
    :max="1"
    :min="0"
    name="Brightness (0 = off, 1 = full)"
    :step="0.05"
    :value="relativeBrightness"
    @update="(newVal) => (relativeBrightness = newVal)"
  />
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, ref, useId, watch } from 'vue';
import {
  ColorEffectsStaticColor,
  RgbColor,
  type StaticColorCreateParams,
} from '@gewis/aurora-api-client';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorBoolean from '@/components/lights/effects/props/SelectorBoolean.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { useSubscriberStore } from '@/stores/subscriber.store';

const props = defineProps<{
  showColors: boolean;
  lightsGroupIds: number[];
  defaultModelValue?: StaticColorCreateParams;
}>();

// Only offer the gobos of the moving heads in the lights groups this effect is applied to
const subscriberStore = useSubscriberStore();
const uid = useId();
const selectedLightsGroups = computed(() =>
  subscriberStore.lightsGroups.filter((g) => props.lightsGroupIds.includes(g.id)),
);
const gobos: ComputedRef<string[]> = computed(() => {
  return selectedLightsGroups.value
    .map((g) => g.movingHeadWheels.map((w) => w.fixture.gobos))
    .flat()
    .flat()
    .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
});
const goboRotates: ComputedRef<string[]> = computed(() => {
  return selectedLightsGroups.value
    .map((g) => g.movingHeadWheels.map((w) => w.fixture.goboRotates))
    .flat()
    .flat()
    .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
});

const emit = defineEmits<{
  'update:modelValue': [params: StaticColorCreateParams];
}>();

const colors = ref<RgbColor[]>(
  props.defaultModelValue ? [props.defaultModelValue.props.color] : [],
);
const gobo = ref<string>(props.defaultModelValue?.props.gobo || '');
const goboRotate = ref<string>(props.defaultModelValue?.props.goboRotate || '');
const beatToggle = ref<boolean>(props.defaultModelValue?.props.beatToggle || false);
const relativeBrightness = ref<number>(props.defaultModelValue?.props.relativeBrightness || 1);

const handleChange = () => {
  const payload: StaticColorCreateParams = {
    type: ColorEffectsStaticColor.STATIC_COLOR,
    props: {
      color: colors.value[0],
      gobo: gobo.value ? gobo.value : undefined,
      goboRotate: goboRotate.value ? goboRotate.value : undefined,
      beatToggle: beatToggle.value,
      relativeBrightness: relativeBrightness.value,
    },
  };
  emit('update:modelValue', payload);
};

// Clear a gobo (rotation) that none of the selected lights groups support anymore, so no
// hidden value is saved. Skip this while the lights groups are still loading.
watch([gobos, goboRotates], () => {
  if (subscriberStore.lightsGroups.length === 0) return;
  if (gobo.value && !gobos.value.includes(gobo.value)) gobo.value = '';
  if (goboRotate.value && !goboRotates.value.includes(goboRotate.value)) goboRotate.value = '';
});

watch([colors, gobo, goboRotate, beatToggle, relativeBrightness], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
