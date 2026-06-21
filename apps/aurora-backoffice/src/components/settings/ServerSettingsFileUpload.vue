<template>
  <input ref="fileSelector" hidden type="file" @change="handleFileSelect" />
  <InputGroup>
    <Button :disabled="disabled" label="Upload" @click="fileSelector?.click()" />
    <InputText
      disabled
      :model-value="modelValue === '' ? '' : (modelValue as IFile).originalName"
      placeholder="Upload a file..."
    />
    <InputGroupAddon>
      <Button
        :disabled="disabled"
        icon="pi pi-times"
        severity="secondary"
        title="Clear file"
        @click="store.clearSettingFile(setting)"
      />
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { IFile, ISettings } from '@/api';
import { useServerSettingsStore } from '@/stores/server-settings.store';

const props = defineProps<{
  setting: keyof ISettings;
  disabled: boolean;
  modelValue: IFile | string;
}>();

const store = useServerSettingsStore();

const fileSelector = ref();

const handleFileSelect = async (event: Event) => {
  if (event.target && 'files' in event.target && (event.target.files as FileList)[0]) {
    await store.setSettingFile(props.setting, (event.target.files as FileList)[0]);
  }
};
</script>

<style scoped></style>
