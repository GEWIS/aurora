import type { CreateTimedEventRequest } from '@gewis/aurora-api-client';

export type TimedEventParamsProps<T> = {
  originalEventSpecParams?: T;
  cronExpression: string;
  cronValid: boolean;
  skipNext?: boolean;
  onSave: (params: CreateTimedEventRequest, skipNext?: boolean) => Promise<void>;
};
