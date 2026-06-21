<template>
  <LoadingView :authorizing="authorizing" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { getOidcParameters } from '@/api';
import LoadingView from '@/views/Base/LoadingView.vue';

const authorizing = ref<boolean>(true);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  if (route.path === '/auth/callback') {
    authorizing.value = true;
    if (!route.hash) {
      await router.push({ name: 'error' });
    }

    const queryParameters = new URLSearchParams(route.hash.substring(1));
    if (!queryParameters.get('code') || !queryParameters.get('state') || !queryParameters.get('session_state')) {
      await router.push({ name: 'error' });
    }

    // Get and clear sessionStorage
    const state = sessionStorage.getItem('state');
    const url = sessionStorage.getItem('url');

    // Check if the state is still the same, if not require to re-authenticate
    if (state !== queryParameters.get('state')) {
      await router.push({ name: 'error' });
    }

    const authenticated = await authStore.OIDCLogin({
      code: queryParameters.get('code')!,
      state: queryParameters.get('state')!,
      session_state: queryParameters.get('session_state')!,
    });

    if (authenticated) {
      await router.push(url === null || url === '' ? { name: 'dashboard' } : url);
    } else {
      await router.push({ name: 'error' });
    }
  } else {
    authorizing.value = false;
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('url', route.query.path as string);

    const oidcParameters = await getOidcParameters();
    // If the oidc parameters are not available, retry auth
    if (!oidcParameters.data) await router.push({ name: 'auth' });

    const queryParameters = new URLSearchParams({
      client_id: oidcParameters.data!.clientId,
      redirect_uri: oidcParameters.data!.redirectUri,
      state: state,
      response_mode: 'fragment',
      response_type: 'code',
      scope: 'openid',
    });

    window.location.href = oidcParameters.data!.authUrl + '?' + queryParameters.toString();
  }
});
</script>
