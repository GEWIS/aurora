<template>
  <SelectorLightsColor v-if="showColors" v-model="colors" single-color />
  <Select v-model="gobo" :options="gobos" placeholder="Select a gobo" show-clear />
  <Select v-model="goboRotate" :options="goboRotates" placeholder="Select a gobo rotate effect" show-clear />
  <SelectorBoolean id="beat-toggle" v-model="beatToggle" name="Beat Toggle" />
  <SelectorRatioSlider
    id="relative-brightness"
    :max="1"
    :min="0"
    name=""
    :step="0.05"
    :value="relativeBrightness"
    @update="(newVal) => (relativeBrightness = newVal)"
  />
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onMounted, ref, watch } from 'vue';
import SelectorLightsColor from '@/components/lights/effects/props/SelectorLightsColor.vue';
import SelectorBoolean from '@/components/lights/effects/props/SelectorBoolean.vue';
import SelectorRatioSlider from '@/components/lights/effects/props/SelectorRatioSlider.vue';
import { ColorEffectsStaticColor, RgbColor, type StaticColorCreateParams } from '@/api';
import { useSubscriberStore } from '@/stores/subscriber.store';

const subscriberStore = useSubscriberStore();
const gobos: ComputedRef<string[]> = computed(() => {
  return subscriberStore.lightsGroups
    .map((g) => g.movingHeadWheels.map((w) => w.fixture.gobos))
    .flat()
    .flat()
    .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
});
const goboRotates: ComputedRef<string[]> = computed(() => {
  return subscriberStore.lightsGroups
    .map((g) => g.movingHeadWheels.map((w) => w.fixture.goboRotates))
    .flat()
    .flat()
    .filter((n1, index, all) => index === all.findIndex((n2) => n1 === n2));
});

const props = defineProps<{
  showColors: boolean;
  defaultModelValue?: StaticColorCreateParams;
}>();

const emit = defineEmits<{
  'update:modelValue': [params: StaticColorCreateParams];
}>();

const colors = ref<RgbColor[]>(props.defaultModelValue ? [props.defaultModelValue.props.color] : []);
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

watch([colors, gobo, goboRotate, beatToggle, relativeBrightness], handleChange);
onMounted(handleChange);
</script>

<style scoped></style>
