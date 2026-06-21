<template>
  <Button :disabled="!isPrivileged" icon="pi pi-plus" label="Add poster" @click="open" />
  <Dialog
    closable
    close-on-escape
    dismissable-mask
    header="Add poster"
    :keep-in-viewport="false"
    modal
    :visible="visible"
    @update:visible="(v) => (visible = v)"
  >
    <form class="flex flex-col gap-4 w-[32rem] max-w-full" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="poster-type">Type</label>
        <Select
          id="poster-type"
          v-model="type"
          :invalid="submitted && !type"
          option-label="label"
          option-value="value"
          :options="typeOptions"
          placeholder="Choose a type"
        />
        <Message v-if="submitted && !type" severity="error" size="small" variant="simple">
          Please pick a poster type
        </Message>
      </div>

      <div v-if="type" class="flex flex-col gap-2">
        <label for="poster-name">Name</label>
        <InputText id="poster-name" v-model="name" :invalid="submitted && !name.trim()" placeholder="My poster" />
        <Message v-if="submitted && !name.trim()" severity="error" size="small" variant="simple">
          Name is required
        </Message>
      </div>

      <div v-if="type === PosterTypeExternal.EXTERN" class="flex flex-col gap-2">
        <label for="poster-uri">URL</label>
        <InputText
          id="poster-uri"
          v-model="uri"
          :invalid="submitted && !uriValid"
          placeholder="https://..."
          type="url"
        />
        <Message v-if="submitted && !uriValid" severity="error" size="small" variant="simple">
          Please enter a valid URL
        </Message>
      </div>

      <div v-else-if="type === 'file'" class="flex flex-col gap-2">
        <label>Files</label>
        <input ref="fileSelector" accept="image/*,video/*" hidden multiple type="file" @change="handleFileSelect" />
        <div class="flex flex-row gap-2 items-center">
          <Button
            icon="pi pi-upload"
            label="Add files"
            severity="secondary"
            type="button"
            @click="fileSelector?.click()"
          />
          <span v-if="!files.length" class="text-sm opacity-50 italic">No files chosen</span>
        </div>
        <ul v-if="files.length" class="flex flex-col gap-1 m-0 p-0 list-none">
          <li v-for="(f, i) in files" :key="i" class="flex flex-row gap-2 items-center text-sm">
            <span class="truncate flex-1 opacity-75">{{ f.name }}</span>
            <Button icon="pi pi-times" severity="secondary" size="small" text type="button" @click="removeFile(i)" />
          </li>
        </ul>
        <Message v-if="submitted && !files.length" severity="error" size="small" variant="simple">
          Please choose at least one file
        </Message>
        <Message v-else-if="mixedMedia" severity="error" size="small" variant="simple">
          A poster can't mix images and videos. Please select only images or only videos.
        </Message>
      </div>

      <div v-else-if="type === PosterTypePhoto.PHOTO" class="flex flex-col gap-2">
        <label for="poster-albums">Album IDs</label>
        <InputChips
          id="poster-albums"
          v-model="albums"
          :invalid="submitted && albums.length === 0"
          :placeholder="albums.length === 0 ? 'Type an ID and press Enter' : ''"
          separator=","
          @add="onAlbumAdd"
        />
        <Message v-if="submitted && albums.length === 0" severity="error" size="small" variant="simple">
          Please add at least one album ID
        </Message>
        <Message v-else-if="albumError" severity="error" size="small" variant="simple">
          Album IDs must be numeric
        </Message>
      </div>

      <template v-if="type">
        <Divider />

        <div v-if="type !== PosterTypePhoto.PHOTO" class="flex flex-col gap-2">
          <label for="poster-label">Label (optional)</label>
          <InputText id="poster-label" v-model="label" placeholder="Poster Title" />
        </div>

        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-2 flex-1">
            <label for="poster-timeout">Default timeout (seconds)</label>
            <InputNumber id="poster-timeout" v-model="defaultTimeout" :min="1" show-buttons />
          </div>
          <div class="flex flex-col gap-2 flex-1">
            <label for="poster-footer">Footer size</label>
            <Select
              id="poster-footer"
              v-model="footerSize"
              option-label="label"
              option-value="value"
              :options="footerSizeOptions"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="poster-color">Accent color</label>
          <div class="flex flex-row gap-2 items-center">
            <ColorPicker id="poster-color" v-model="accentColorInput" />
            <InputText v-model="accentColorInput" class="w-28" maxlength="7" placeholder="ff0000" />
            <Button
              v-if="accentColor"
              icon="pi pi-times"
              severity="secondary"
              size="small"
              text
              type="button"
              @click="accentColor = ''"
            />
          </div>
        </div>

        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-2 flex-1">
            <label for="poster-start">Starts at</label>
            <DatePicker id="poster-start" v-model="startDate" show-icon show-time />
          </div>
          <div class="flex flex-col gap-2 flex-1">
            <label for="poster-expiration">Expires at</label>
            <DatePicker id="poster-expiration" v-model="expirationDate" show-icon show-time />
          </div>
        </div>

        <div v-if="store.carousel.borrelModePresent" class="flex flex-row items-center gap-3">
          <ToggleSwitch v-model="borrelMode" input-id="poster-borrel" />
          <label class="cursor-pointer" for="poster-borrel">Only show during Borrel mode</label>
        </div>
      </template>

      <div class="flex flex-row justify-end gap-2 mt-2">
        <Button label="Cancel" severity="secondary" type="button" @click="visible = false" />
        <Button :disabled="loading" label="Create" :loading="loading" severity="success" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import InputChips from 'primevue/inputchips';
import {
  type ExternalPosterRequest,
  FooterSize,
  type MediaPosterRequest,
  type PhotoPosterRequest,
  PosterTypeExternal,
  PosterTypeImage,
  PosterTypePhoto,
  PosterTypeVideo,
} from '@gewis/aurora-api-client';
import { usePosterStore } from '@/stores/poster/poster.store';
import { useServerSettingsStore } from '@/stores/server-settings.store';
import { useAuthStore } from '@/stores/auth.store';

type CreatableType = 'file' | PosterTypeExternal.EXTERN | PosterTypePhoto.PHOTO;

const store = usePosterStore();
const settingsStore = useServerSettingsStore();
const authStore = useAuthStore();
const isPrivileged = computed(() => authStore.isInSecurityGroup('poster', 'privileged'));

const visible = ref<boolean>(false);
const loading = ref<boolean>(false);
const submitted = ref<boolean>(false);

const type = ref<CreatableType | null>(null);
const name = ref<string>('');
const label = ref<string>('');
const uri = ref<string>('');
const files = ref<File[]>([]);
const albums = ref<string[]>([]);
const albumError = ref<boolean>(false);
const accentColor = ref<string>('');
const startDate = ref<Date | null>(null);
const expirationDate = ref<Date | null>(null);
const footerSize = ref<FooterSize>(FooterSize.FULL);
const defaultTimeout = ref<number>(15);
const borrelMode = ref<boolean>(false);
const fileSelector = ref<HTMLInputElement | null>(null);

const defaultAccentColor = computed(() =>
  (settingsStore.serverSettings?.['Poster.DefaultProgressBarColor'] ?? '').replace(/^#/, '').toLowerCase(),
);

const accentColorInput = computed({
  get: () => accentColor.value || defaultAccentColor.value,
  set: (v: string) => {
    accentColor.value = v.replace(/^#/, '').toLowerCase();
  },
});

const typeOptions = [
  { label: 'File', value: 'file' as const },
  { label: 'URL', value: PosterTypeExternal.EXTERN },
  { label: 'Photo album', value: PosterTypePhoto.PHOTO },
];

const footerSizeOptions = [
  { label: 'Full', value: FooterSize.FULL },
  { label: 'Minimal', value: FooterSize.MINIMAL },
  { label: 'Hidden', value: FooterSize.HIDDEN },
];

const uriValid = computed(() => {
  try {
    new URL(uri.value);
    return true;
  } catch {
    return false;
  }
});

const mixedMedia = computed(() => {
  const kinds = new Set(files.value.map((f) => (f.type.startsWith('video/') ? 'video' : 'image')));
  return kinds.size > 1;
});

const open = () => {
  reset();
  visible.value = true;
};

const reset = () => {
  submitted.value = false;
  type.value = null;
  name.value = '';
  label.value = '';
  uri.value = '';
  files.value = [];
  albums.value = [];
  albumError.value = false;
  accentColor.value = '';
  startDate.value = null;
  expirationDate.value = null;
  footerSize.value = FooterSize.FULL;
  defaultTimeout.value = 15;
  borrelMode.value = false;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const picked = Array.from(target.files ?? []);
  // Reset the input so picking the same file again still fires a change event.
  target.value = '';
  if (picked.length === 0) return;

  files.value = [...files.value, ...picked];
  if (!name.value) name.value = picked[0].name;

  // Auto-fill the timeout from the video duration only when a single video is selected.
  if (files.value.length === 1 && picked[0].type.startsWith('video/')) {
    const url = URL.createObjectURL(picked[0]);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (isFinite(video.duration)) defaultTimeout.value = Math.round(video.duration);
      URL.revokeObjectURL(url);
    };
    video.src = url;
  }
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

const onAlbumAdd = () => {
  albumError.value = albums.value.some((v) => !/^\d+$/.test(v.trim()));
};

const buildBase = () => ({
  name: name.value.trim(),
  ...(label.value && { label: label.value }),
  ...(accentColor.value && { accentColor: accentColor.value }),
  ...(startDate.value && { startDate: startDate.value.toISOString() }),
  ...(expirationDate.value && { expirationDate: expirationDate.value.toISOString() }),
  footerSize: footerSize.value,
  defaultTimeout: defaultTimeout.value,
  borrelMode: borrelMode.value,
});

const onSubmit = async () => {
  submitted.value = true;
  if (!type.value || !name.value.trim()) return;

  if (type.value === 'file') {
    if (!files.value.length || mixedMedia.value) return;
    loading.value = true;
    const mediaType = files.value[0].type.startsWith('video/') ? PosterTypeVideo.VIDEO : PosterTypeImage.IMG;
    const params: MediaPosterRequest = { ...buildBase(), type: mediaType };
    await store.createPosterMedia(params, files.value);
  } else if (type.value === PosterTypeExternal.EXTERN) {
    if (!uriValid.value) return;
    loading.value = true;
    const params: ExternalPosterRequest = {
      ...buildBase(),
      type: PosterTypeExternal.EXTERN,
      uri: uri.value,
    };
    await store.createPoster(params);
  } else if (type.value === PosterTypePhoto.PHOTO) {
    onAlbumAdd();
    if (albums.value.length === 0 || albumError.value) return;
    loading.value = true;
    const params: PhotoPosterRequest = {
      ...buildBase(),
      type: PosterTypePhoto.PHOTO,
      albums: albums.value.map((v) => Number(v.trim())),
    };
    await store.createPoster(params);
  }

  loading.value = false;
  visible.value = false;
};
</script>

<style scoped></style>
