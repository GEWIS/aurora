<template>
  <Button class="flex-1" icon="pi pi-eye" label="Review" severity="warn" @click="open" />
  <Dialog
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    closable
    close-on-escape
    dismissable-mask
    header="Review poster request"
    :keep-in-viewport="false"
    modal
    :style="{ width: '56rem' }"
    :visible="visible"
    @update:visible="(v) => (visible = v)"
  >
    <form class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit.prevent="onApprove">
      <div class="flex flex-col gap-4 min-w-0">
        <PosterRequestMedia v-if="visible" controls :request="request" />

        <div class="flex flex-col gap-2 text-sm">
          <div>
            <span class="opacity-60">Requested by</span>
            <div class="font-bold">{{ request.requesterName }}</div>
            <a class="break-all" :href="`mailto:${request.requesterEmail}`">
              {{ request.requesterEmail }}
            </a>
          </div>
          <div v-if="request.requesterAssociation">
            <span class="opacity-60">Association</span>
            <div>{{ request.requesterAssociation }}</div>
          </div>
          <div>
            <span class="opacity-60">Requested period</span>
            <div>{{ formatPosterPeriod(request.startDate, request.expirationDate) }}</div>
          </div>
          <div>
            <span class="opacity-60">Received</span>
            <div>
              {{ formatPosterDate(request.createdAt) }}
              <span v-if="request.integrationName" class="opacity-60">
                via {{ request.integrationName }}
              </span>
            </div>
          </div>
          <div v-if="request.message">
            <span class="opacity-60">Message</span>
            <div class="whitespace-pre-line break-words">{{ request.message }}</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 min-w-0">
        <Message severity="secondary" size="small">
          Check and adjust the poster below. Approving puts it in the carousel and removes the
          request, including the requester's details.
        </Message>

        <div class="flex flex-col gap-2">
          <label for="poster-request-name">Name</label>
          <InputText
            id="poster-request-name"
            v-model="name"
            :invalid="submitted && !name.trim()"
            placeholder="My poster"
          />
          <Message v-if="submitted && !name.trim()" severity="error" size="small" variant="simple">
            Name is required
          </Message>
        </div>

        <div v-if="isExternal" class="flex flex-col gap-2">
          <label for="poster-request-uri">URL</label>
          <InputText
            id="poster-request-uri"
            v-model="uri"
            :invalid="submitted && !uriValid"
            placeholder="https://..."
            type="url"
          />
          <Message v-if="submitted && !uriValid" severity="error" size="small" variant="simple">
            Please enter a valid http or https URL
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="poster-request-label">Label (optional)</label>
          <InputText id="poster-request-label" v-model="label" placeholder="Poster Title" />
        </div>

        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <label for="poster-request-timeout">Default timeout (seconds)</label>
            <InputNumber
              id="poster-request-timeout"
              v-model="defaultTimeout"
              fluid
              :min="1"
              show-buttons
            />
          </div>
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <label for="poster-request-footer">Footer size</label>
            <Select
              id="poster-request-footer"
              v-model="footerSize"
              fluid
              option-label="label"
              option-value="value"
              :options="footerSizeOptions"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="poster-request-color">Accent color</label>
          <div class="flex flex-row gap-2 items-center">
            <ColorPicker id="poster-request-color" v-model="accentColorInput" />
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
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <label for="poster-request-start">Starts at</label>
            <DatePicker
              id="poster-request-start"
              v-model="startDate"
              fluid
              show-clear
              show-icon
              show-time
            />
          </div>
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <label for="poster-request-expiration">Expires at</label>
            <DatePicker
              id="poster-request-expiration"
              v-model="expirationDate"
              fluid
              :invalid="submitted && !datesValid"
              show-clear
              show-icon
              show-time
            />
          </div>
        </div>
        <Message v-if="submitted && !datesValid" severity="error" size="small" variant="simple">
          The poster has to expire after it starts
        </Message>

        <div v-if="posterStore.carousel.borrelModePresent" class="flex flex-row items-center gap-3">
          <ToggleSwitch v-model="borrelMode" input-id="poster-request-borrel" />
          <label class="cursor-pointer" for="poster-request-borrel">
            Only show during Borrel mode
          </label>
        </div>

        <div class="flex flex-row flex-wrap justify-end gap-2 mt-auto pt-2">
          <Button
            class="mr-auto"
            :disabled="loading"
            icon="pi pi-times"
            label="Deny"
            severity="danger"
            type="button"
            @click="confirmRef?.confirmDialog"
          />
          <Button label="Cancel" severity="secondary" type="button" @click="visible = false" />
          <Button
            :disabled="loading"
            icon="pi pi-check"
            label="Approve"
            :loading="loading"
            severity="success"
            type="submit"
          />
        </div>
      </div>
    </form>
  </Dialog>
  <ConfirmWrapper
    ref="confirmRef"
    accept-label="Deny"
    :loading="loading"
    message="Deny this poster request? The request and the requester's details are deleted. Let the requester know yourself if needed."
    :on-accept="onDeny"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DatePicker from 'primevue/datepicker';
import {
  type ApprovePosterRequestParams,
  FooterSize,
  type PosterRequestResponse,
  PosterTypeExternal,
} from '@gewis/aurora-api-client';
import { usePosterRequestStore } from '@/stores/poster/poster-request.store';
import { usePosterStore } from '@/stores/poster/poster.store';
import { useServerSettingsStore } from '@/stores/server-settings.store';
import { formatPosterDate, formatPosterPeriod } from '@/utils/posterUtils';
import { toastSuccess } from '@/utils/toastHandler';
import ConfirmWrapper from '@/components/prime/ConfirmWrapper.vue';
import PosterRequestMedia from '@/components/poster/PosterRequestMedia.vue';

const props = defineProps<{
  request: PosterRequestResponse;
}>();

const store = usePosterRequestStore();
const posterStore = usePosterStore();
const settingsStore = useServerSettingsStore();

const visible = ref<boolean>(false);
const loading = ref<boolean>(false);
const submitted = ref<boolean>(false);
const confirmRef = ref();

const name = ref<string>('');
const uri = ref<string>('');
const label = ref<string>('');
const defaultTimeout = ref<number>(15);
const footerSize = ref<FooterSize>(FooterSize.FULL);
const accentColor = ref<string>('');
const startDate = ref<Date | null>(null);
const expirationDate = ref<Date | null>(null);
const borrelMode = ref<boolean>(false);

const defaultAccentColor = computed(() =>
  (settingsStore.serverSettings?.['Poster.DefaultProgressBarColor'] ?? '')
    .replace(/^#/, '')
    .toLowerCase(),
);

const accentColorInput = computed({
  get: () => accentColor.value || defaultAccentColor.value,
  set: (v: string) => {
    accentColor.value = v.replace(/^#/, '').toLowerCase();
  },
});

const footerSizeOptions = [
  { label: 'Full', value: FooterSize.FULL },
  { label: 'Minimal', value: FooterSize.MINIMAL },
  { label: 'Hidden', value: FooterSize.HIDDEN },
];

const isExternal = computed(() => props.request.type === PosterTypeExternal.EXTERN);

const uriValid = computed(() => {
  if (!isExternal.value) return true;
  try {
    return ['http:', 'https:'].includes(new URL(uri.value.trim()).protocol);
  } catch {
    return false;
  }
});

const datesValid = computed(
  () =>
    !startDate.value ||
    !expirationDate.value ||
    expirationDate.value.getTime() > startDate.value.getTime(),
);

const open = () => {
  submitted.value = false;
  name.value = props.request.name;
  uri.value = props.request.uri ?? '';
  label.value = props.request.label ?? '';
  defaultTimeout.value = props.request.defaultTimeout;
  footerSize.value = props.request.footerSize;
  accentColor.value = props.request.accentColor ?? '';
  startDate.value = props.request.startDate ? new Date(props.request.startDate) : null;
  expirationDate.value = props.request.expirationDate
    ? new Date(props.request.expirationDate)
    : null;
  borrelMode.value = props.request.borrelMode;
  visible.value = true;
};

const buildParams = (): ApprovePosterRequestParams => ({
  name: name.value.trim(),
  footerSize: footerSize.value,
  defaultTimeout: defaultTimeout.value,
  borrelMode: borrelMode.value,
  ...(isExternal.value && { uri: uri.value.trim() }),
  ...(label.value.trim() && { label: label.value.trim() }),
  ...(accentColor.value && { accentColor: accentColor.value }),
  ...(startDate.value && { startDate: startDate.value.toISOString() }),
  ...(expirationDate.value && { expirationDate: expirationDate.value.toISOString() }),
});

const onApprove = async () => {
  submitted.value = true;
  if (!name.value.trim() || !uriValid.value || !datesValid.value) return;

  loading.value = true;
  const approved = await store.approve(props.request.id, buildParams());
  loading.value = false;
  if (approved) {
    visible.value = false;
    toastSuccess({ title: 'Poster approved', body: `"${name.value.trim()}" is now a poster.` });
  }
};

const onDeny = async () => {
  loading.value = true;
  const denied = await store.deny(props.request.id);
  loading.value = false;
  if (denied) {
    visible.value = false;
    toastSuccess({ title: 'Request denied', body: 'The poster request has been deleted.' });
  }
};
</script>

<style scoped></style>
