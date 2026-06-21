<template>
  <div class="max-w-lg">
    <InputGroup>
      <Button icon="pi pi-check" :loading="loading" @click="updateLogin" />
      <InputText v-model="userName" placeholder="Name" />
      <InputText v-model="userId" placeholder="ID" />
      <MultiSelect v-model="selectedRoles" :options="availableRoles" />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import InputGroup from 'primevue/inputgroup';
import { ref } from 'vue';
import { SecurityGroup } from '@/api';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

const selectedRoles = ref(authStore.getRoles);
const userName = ref('dev');
const userId = ref('dev');
const loading = ref(false);

const availableRoles = ref(Object.values(SecurityGroup));

async function updateLogin() {
  loading.value = true;
  await authStore
    .MockLogin({
      id: userId.value,
      name: userName.value,
      roles: selectedRoles.value,
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>
