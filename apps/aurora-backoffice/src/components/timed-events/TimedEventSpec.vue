<template>
  <TimedEventTag
    v-if="props.eventSpec.type === 'system-reset'"
    description="Reset system to initial state."
    label="System reset"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'clean-audit-logs'"
    description="Remove all expired audit logs from the database."
    label="Clean audit logs"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-audio' && props.eventSpec.params.handler !== ''"
    description=""
    :label="`Switch handler for audio '${getAudioName(props.eventSpec.params.id)}' to ${props.eventSpec.params.handler}`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-audio'"
    description=""
    :label="`Remove handler for audio '${getAudioName(props.eventSpec.params.id)}'`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-lights' && props.eventSpec.params.handler !== ''"
    description=""
    :label="`Switch handler for lights group '${getLightsGroupName(props.eventSpec.params.id)}' to ${props.eventSpec.params.handler}`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-lights'"
    description=""
    :label="`Remove handler for lights group '${getLightsGroupName(props.eventSpec.params.id)}'`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-screen' && props.eventSpec.params.handler !== ''"
    description=""
    :label="`Switch handler for screen '${getScreenName(props.eventSpec.params.id)}' to ${props.eventSpec.params.handler}`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'switch-handler-screen'"
    description=""
    :label="`Remove handler for screen '${getScreenName(props.eventSpec.params.id)}'`"
  />
  <TimedEventTag
    v-else-if="props.eventSpec.type === 'timed-event-set-static-poster'"
    description="Change the poster on screen for all screens using the StaticPosterHandler"
    label="Set static poster"
  />
</template>

<script setup lang="ts">
import type { EventSpec } from '@/api';
import TimedEventTag from '@/components/timed-events/TimedEventTag.vue';
import { useSubscriberStore } from '@/stores/subscriber.store';

const subscriberStore = useSubscriberStore();

const getAudioName = (id: number) => {
  const match = subscriberStore.audios.find((audio) => audio.id === id);
  if (match) return match.name;
  return id.toString();
};
const getLightsGroupName = (id: number) => {
  const match = subscriberStore.lightsGroups.find((lightsGroup) => lightsGroup.id === id);
  if (match) return match.name;
  return id.toString();
};
const getScreenName = (id: number) => {
  const match = subscriberStore.screens.find((screen) => screen.id === id);
  if (match) return match.name;
  return id.toString();
};

const props = defineProps<{
  eventSpec: EventSpec;
}>();
</script>

<style scoped></style>
