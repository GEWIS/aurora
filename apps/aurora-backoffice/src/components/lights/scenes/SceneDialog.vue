<template>
  <Dialog
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    closable
    close-on-escape
    dismissable-mask
    :dt="dialogTokens"
    :header="originalScene ? `Edit &quot;${originalScene.name}&quot;` : 'Create new scene'"
    :keep-in-view-port="false"
    modal
    :style="{ width: '50vw' }"
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-row flex-wrap gap-x-4 gap-y-2 items-end">
        <FloatLabel class="grow" variant="on">
          <InputText id="scene-name" v-model="name" autocomplete="off" class="w-full" type="text" />
          <label for="scene-name">Name</label>
        </FloatLabel>
        <!-- Same height as the name input, so the toggle lines up with it -->
        <div class="flex flex-row gap-2 items-center min-h-10">
          <ToggleSwitch v-model="favorite" input-id="scene-favorite" />
          <label for="scene-favorite">Favorite (shown on the dashboard)</label>
        </div>
      </div>
      <div ref="effectsList" class="flex flex-col gap-2">
        <label>Effects</label>
        <SceneEffectEditor
          v-for="(effect, index) in effects"
          :key="effect.key"
          :default-effect="effect.defaultEffect"
          :index="index"
          @input-valid="(v) => (effect.valid = v)"
          @remove="effects.splice(index, 1)"
          @update:model-value="(e) => (effect.value = e)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row justify-between w-full">
        <Button icon="pi pi-plus" label="Add effect" severity="secondary" @click="addNewEffect()" />
        <Button :disabled="!canSave" :loading="loading" severity="success" @click="saveScene">
          Save changes
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type {
  CreateSceneParams,
  LightsSceneEffectParams,
  LightsSceneEffectResponse,
  LightsSceneResponse,
} from '@gewis/aurora-api-client';
import SceneEffectEditor from '@/components/lights/scenes/SceneEffectEditor.vue';

interface EditableEffect {
  key: number;
  defaultEffect?: LightsSceneEffectResponse;
  value?: LightsSceneEffectParams;
  valid: boolean;
}

const props = defineProps<{
  originalScene?: LightsSceneResponse;
  visible: boolean;
  onSave: (params: CreateSceneParams) => Promise<void>;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
}>();

// Put the spacing above the footer in the footer itself, so it remains visible when the
// content scrolls. The content gets a bit of top padding, because the scrolling content box
// would otherwise clip the float label of the first input, which sticks out above it.
const dialogTokens = {
  content: { padding: '0.5rem {overlay.modal.padding} 0' },
  footer: { padding: '{overlay.modal.padding}' },
};

const loading = ref<boolean>(false);
const name = ref<string>('');
const favorite = ref<boolean>(false);
const effects = ref<EditableEffect[]>([]);

let nextKey = 0;
const addEffect = (defaultEffect?: LightsSceneEffectResponse) => {
  effects.value.push({ key: nextKey++, defaultEffect, valid: false });
};

// Add an empty effect and scroll the dialog down to it
const effectsList = ref<HTMLDivElement>();
const addNewEffect = async () => {
  addEffect();
  await nextTick();
  effectsList.value?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

// Reset the form every time the dialog opens
const resetForm = () => {
  name.value = props.originalScene?.name ?? '';
  favorite.value = props.originalScene?.favorite ?? false;
  effects.value = [];
  props.originalScene?.effects.forEach((e) => addEffect(e));
};
watch(
  () => props.visible,
  (visible) => {
    if (visible) resetForm();
  },
  { immediate: true },
);

const canSave = computed(
  () =>
    !loading.value &&
    name.value.trim() !== '' &&
    effects.value.length > 0 &&
    effects.value.every((e) => e.valid && e.value),
);

const saveScene = async () => {
  if (!canSave.value) return;

  loading.value = true;
  try {
    await props.onSave({
      name: name.value.trim(),
      favorite: favorite.value,
      effects: effects.value.map((e) => e.value!),
    });
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
