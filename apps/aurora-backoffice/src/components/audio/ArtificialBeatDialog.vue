<template>
  <Button @click="visible = true"> Artificial Beat Generator </Button>

  <Dialog
    v-model:visible="visible"
    class="w-xs sm:w-sm"
    dismissable-mask
    header="Artifical Beat Generator"
    modal
    @after-hide="taps = []"
    @show="onDialogShow"
  >
    <div class="flex flex-col gap-3 justify-center">
      <Message
        v-if="infoMessageVisible"
        class="text-wrap"
        closable
        icon="pi pi-info-circle"
        severity="info"
        @close="onHelpDialogClose"
      >
        With the Artificial Beat Generator, you can set a custom BPM that Aurora will use. This BPM will override all
        other beat inputs, like manual definitions or the real time beat detector.
      </Message>
      <div v-if="!currentBpmLoading && currentBpm != null">Current BPM: {{ currentBpm }}</div>
      <div v-else-if="!currentBpmLoading">Artificial Beat Generator is inactive.</div>
      <div v-else>
        <Spinner />
      </div>
      <div class="flex flex-col gap-1 items-center justify-center">
        <div
          class="m-2 p-2 min-h-[8rem] w-full border-1 flex flex-col justify-center items-center select-none"
          @click="onTap"
        >
          <span v-if="getBpm() != null">{{ getBpm() }} BPM</span>
          <span v-else>Tap to set BPM</span>
          <span class="inline-block text-wrap text-center">
            {{ renderTaps() }}
          </span>
        </div>
        <div class="flex flex-row gap-1 justify-center">
          <Button label="Tap" @click="onTap" />
          <Button label="Reset" severity="secondary" @click="taps = []" />
        </div>
      </div>
      <Button
        :disabled="taps.length < 4"
        label="Set BPM"
        :loading="savingBpmLoading"
        severity="success"
        @click="setArtificialBeats"
      />
      <Button
        label="Disable artificial beats"
        :loading="stopBpmLoading"
        severity="danger"
        @click="stopArtificialBeats"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { splitArrayIntoChunks } from '@/utils/arrayUtils';
import { getArtificialBeatGenerator, startArtificialBeatGenerator, stopArtificialBeatGenerator } from '@/api';

const ARTIFICIAL_BEAT_DIALOG_HELP_CLOSED_SETTING = 'artificial-beat-dialog-help-closed';

const visible = ref<boolean>(false);
const infoMessageVisible = computed<boolean>(() => {
  return localStorage.getItem(ARTIFICIAL_BEAT_DIALOG_HELP_CLOSED_SETTING) != 'true';
});
const taps = ref<Date[]>([]);
const currentBpm = ref<number | null>(null);
const currentBpmLoading = ref<boolean>(false);

const savingBpmLoading = ref<boolean>(false);
const stopBpmLoading = ref<boolean>(false);

const renderTaps = () => {
  const formattedTaps = taps.value.map(() => '*');
  const chunks = splitArrayIntoChunks(formattedTaps, 4);
  return chunks.map((c) => c.join('')).join(' ');
};

const fetchCurrentBpm = async () => {
  await getArtificialBeatGenerator()
    .then((beats) => {
      currentBpm.value = beats.data!.bpm;
    })
    .finally(() => (currentBpmLoading.value = false));
};

const getBpm = () => {
  if (taps.value.length < 4) return null;
  const first = taps.value[0];
  const last = taps.value[taps.value.length - 1];
  const msDiff = last.getTime() - first.getTime();
  const bpm = (60000 * (taps.value.length - 1)) / msDiff;
  return Math.round(bpm);
};

const onDialogShow = async () => {
  currentBpmLoading.value = true;
  await fetchCurrentBpm();
};

const setArtificialBeats = async () => {
  const bpm = getBpm();
  if (bpm == null) return;
  savingBpmLoading.value = true;
  await startArtificialBeatGenerator({ body: { bpm: bpm } })
    .then(() => (visible.value = false))
    .finally(() => (savingBpmLoading.value = false));
};

const stopArtificialBeats = async () => {
  stopBpmLoading.value = true;
  await stopArtificialBeatGenerator()
    .then(() => (visible.value = false))
    .finally(() => (stopBpmLoading.value = false));
};

const onTap = () => {
  taps.value.push(new Date());
};

const onHelpDialogClose = () => {
  localStorage.setItem(ARTIFICIAL_BEAT_DIALOG_HELP_CLOSED_SETTING, 'true');
};
</script>

<style scoped></style>
