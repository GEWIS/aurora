import type { CreateTimedEventRequest } from '@/api';

export type TimedEventParamsProps<T> = {
  originalEventSpecParams?: T;
  cronExpression: string;
  cronValid: boolean;
  skipNext?: boolean;
  onSave: (params: CreateTimedEventRequest, skipNext?: boolean) => Promise<void>;
};
