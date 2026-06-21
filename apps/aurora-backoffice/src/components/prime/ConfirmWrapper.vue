<template>
  <span class="hidden" />
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps<{
  message: string;
  acceptLabel: string;
  loading?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}>();

const confirm = useConfirm();
const confirmDialog = () => {
  confirm.require({
    message: props.message,
    header: 'Confirm',
    rejectClass: 'p-button-secondary',
    rejectLabel: 'Cancel',
    acceptLabel: props.acceptLabel,
    reject() {
      if (props.onReject) {
        props.onReject();
      }
    },
    accept() {
      if (props.onAccept) {
        props.onAccept();
      }
    },
  });
};

defineExpose({
  confirmDialog,
});
</script>
