<template>
  <Dialog class="w-96" :closable="false" header="Processing login..." modal :visible="open">
    <template #default>
      <div class="flex flex-col items-center justify-center my-2">
        <ProgressSpinner v-if="loading" />
      </div>
      <Message v-if="!loading && errorMessage" severity="error"> Login failed: {{ errorMessage }} </Message>
      <Message v-else-if="!loading" severity="success">
        Successfully logged in user {{ store.currentSpotifyProfile?.display_name }}
      </Message>
    </template>
    <template #footer>
      <Button :disabled="loading" label="Close" @click="handleClose()" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSpotifyStore } from '@/stores/spotify.store';

const store = useSpotifyStore();
const route = useRoute();
const router = useRouter();

const open = ref<boolean>(false);
const loading = ref<boolean>(true);
const errorMessage = ref<string | undefined>();

const handleClose = () => {
  if (loading.value) return;

  open.value = false;
};

onMounted(async () => {
  if (route.path === '/music/spotify/callback') {
    open.value = true;
    const state = Array.isArray(route.query.state) ? route.query.state.join(',') : route.query.state;
    const code = Array.isArray(route.query.code) ? route.query.code.join(',') : route.query.code;
    const error = Array.isArray(route.query.error) ? route.query.error.join(',') : route.query.error;
    const res = await store.loginCallback(state ?? '', code ?? undefined, error ?? undefined);
    if (res.success) {
      void store.init();
    } else {
      errorMessage.value = res.error;
    }
    loading.value = false;
    await router.replace('/music');
  }
});
</script>

<style scoped></style>
