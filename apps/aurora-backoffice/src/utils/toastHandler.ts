import { app } from '@/main';

interface ToastMessage {
  title: string;
  body: string;
  lifeTime?: number;
}

enum ToastSeverity {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

function toast(severity: ToastSeverity, message: ToastMessage) {
  app.config.globalProperties.$toast.add({
    severity: severity,
    summary: message.title,
    detail: message.body,
    life: message.lifeTime ?? 5000,
  });
}

function toastSuccess(message: ToastMessage): void {
  toast(ToastSeverity.SUCCESS, message);
}

function toastInfo(message: ToastMessage): void {
  toast(ToastSeverity.INFO, message);
}

function toastWarn(message: ToastMessage): void {
  toast(ToastSeverity.WARN, message);
}

function toastError(message: ToastMessage): void {
  toast(ToastSeverity.ERROR, message);
}

export { type ToastMessage, toast, toastSuccess, toastInfo, toastWarn, toastError };
