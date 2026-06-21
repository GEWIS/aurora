<template>
  <div class="flex flex-col gap-2">
    <div class="sm:text-lg text-center">Provide player details</div>
    <div class="flex flex-col gap-2 w-full sm:max-w-80 mx-auto">
      <InputText v-model="playerName" class="w-full" placeholder="Player name" />
      <div class="flex gap-10">
        <div>
          <Checkbox v-model="isAlcoholFree" binary input-id="isAlcoholFree" name="isAlcoholFree" />
          <label class="ml-2" for="isAlcoholFree">0.0%</label>
        </div>
        <div>
          <Checkbox v-model="isBac" binary input-id="isBac" name="isBac" />
          <label class="ml-2" for="isBac">BAC</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTimeTrailRaceStore } from '@/stores/modes/time-trail-race.store';

const store = useTimeTrailRaceStore();

const playerName = ref<string>('');
const isAlcoholFree = ref<boolean>(false);
const isBac = ref<boolean>(false);

const registerPlayer = () => {
  void store.registerPlayer({
    name: playerName.value,
    alcoholFree: isAlcoholFree.value,
    bac: isBac.value,
  });
  playerName.value = '';
};

const emit = defineEmits(['can-register']);
watch(playerName, (newPlayerName) => {
  emit('can-register', newPlayerName.trim().length > 0);
});

defineExpose({
  registerPlayer,
});
</script>

<style scoped></style>
