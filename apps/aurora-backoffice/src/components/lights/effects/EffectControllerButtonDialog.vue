<template>
  <Dialog
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    closable
    close-on-escape
    dismissable-mask
    header="Set button"
    modal
    :style="{ width: '50vw' }"
    :visible="visible"
    @update:visible="$emit('close')"
  >
    <template #default>
      <div class="flex flex-col gap-4 py-1 w-full">
        <FloatLabel variant="on">
          <Select
            id="lights-controller-button-type"
            v-model="type"
            class="w-full"
            option-label="name"
            option-value="value"
            :options="typeOptions"
            placeholder="Choose a function..."
          />
          <label for="lights-controller-button-type">Button function</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText id="lights-controller-button-name" v-model="name" autocomplete="off" class="w-full" />
          <label for="lights-controller-button-name">Name (optional)</label>
        </FloatLabel>
        <IconSelector v-model="icon" />
        <Divider />
        <ButtonDialogColors
          v-if="type === ButtonTypes.LightsButtonColors"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonColors ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
        <ButtonDialogEffectColor
          v-if="type === ButtonTypes.LightsButtonEffectColor"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonEffectColor ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
        <ButtonDialogEffectMovement
          v-if="type === ButtonTypes.LightsButtonEffectMovement"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonEffectMovement ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
        <ButtonDialogReset
          v-if="type === ButtonTypes.LightsButtonReset"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonReset ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
        <ButtonDialogStrobe
          v-if="type === ButtonTypes.LightsButtonStrobe"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonStrobe ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
        <ButtonDialogSwitch
          v-if="type === ButtonTypes.LightsButtonSwitch"
          :default-properties="
            button?.properties.type === ButtonTypes.LightsButtonSwitch ? button.properties : undefined
          "
          @input-valid="(v) => (propertiesValid = v)"
          @update:model-value="(p) => (properties = p)"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-2">
        <Button
          :disabled="!button || button.id < 0 || saveLoading"
          icon="pi pi-trash"
          label="Delete"
          severity="danger"
          @click="openDeleteDialog()"
        />
        <Button
          :disabled="!propertiesValid || saveLoading"
          icon="pi pi-save"
          label="Save"
          :loading="saveLoading"
          severity="success"
          @click="handleSave"
        />
        <ConfirmDialog />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import type { LightsPredefinedEffectProperties, LightsPredefinedEffectResponse } from '@/api';
import ButtonDialogColors from '@/components/lights/effects/button/ButtonDialogColors.vue';
import ButtonDialogEffectColor from '@/components/lights/effects/button/ButtonDialogEffectColor.vue';
import ButtonDialogEffectMovement from '@/components/lights/effects/button/ButtonDialogEffectMovement.vue';
import ButtonDialogStrobe from '@/components/lights/effects/button/ButtonDialogStrobe.vue';
import ButtonDialogSwitch from '@/components/lights/effects/button/ButtonDialogSwitch.vue';
import { useEffectsControllerStore } from '@/stores/effects-controller.store';
import IconSelector from '@/components/IconSelector.vue';
import ButtonDialogReset from '@/components/lights/effects/button/ButtonDialogReset.vue';

enum ButtonTypes {
  LightsButtonColors = 'LightsButtonColors',
  LightsButtonEffectColor = 'LightsButtonEffectColor',
  LightsButtonEffectMovement = 'LightsButtonEffectMovement',
  LightsButtonNull = 'LightsButtonNull',
  LightsButtonReset = 'LightsButtonReset',
  LightsButtonStrobe = 'LightsButtonStrobe',
  LightsButtonSwitch = 'LightsButtonSwitch',
}

const props = defineProps<{
  button?: LightsPredefinedEffectResponse;
  visible?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useEffectsControllerStore();

const name = ref<string>('');
const icon = ref<string>('');
const type = ref<ButtonTypes>(ButtonTypes.LightsButtonNull);
const properties = ref<LightsPredefinedEffectProperties | undefined>();
const propertiesValid = ref<boolean>(false);
const saveLoading = ref<boolean>(false);

const typeOptions = [
  { name: 'Colors', value: ButtonTypes.LightsButtonColors },
  { name: 'Color effect', value: ButtonTypes.LightsButtonEffectColor },
  { name: 'Movement effect', value: ButtonTypes.LightsButtonEffectMovement },
  { name: 'Strobe', value: ButtonTypes.LightsButtonStrobe },
  { name: 'Switch', value: ButtonTypes.LightsButtonSwitch },
  { name: 'Reset', value: ButtonTypes.LightsButtonReset },
];

const handleSave = async () => {
  if (!propertiesValid.value || !properties.value) return;

  saveLoading.value = true;
  if (!!props.button && props.button.id < 0) {
    await store.createButtonEffect({ properties: properties.value, buttonId: props.button.buttonId, name: name.value });
  } else if (!!props.button && props.button?.id >= 0) {
    await store.updateButtonEffect(props.button.id, {
      name: name.value,
      icon: icon.value,
      properties: properties.value,
    });
  }

  emit('close');
  saveLoading.value = false;
};

const confirm = useConfirm();
const openDeleteDialog = () => {
  confirm.require({
    message: 'Are you sure you want to delete this predefined effect?',
    header: 'Are you sure?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Yes',
    accept() {
      if (props.button && props.button?.id >= 0) {
        void store.deleteButtonEffect(props.button.id).then(() => emit('close'));
      }
    },
  });
};

watch([props], () => {
  // Reset the form to default values
  propertiesValid.value = false;
  if (props.button) {
    name.value = props.button.name || '';
    icon.value = props.button.icon || '';
    type.value = props.button.properties.type as ButtonTypes;
    properties.value = props.button.properties;
  } else {
    name.value = '';
    icon.value = '';
    type.value = ButtonTypes.LightsButtonNull;
    properties.value = undefined;
  }
});
</script>

<style scoped></style>
