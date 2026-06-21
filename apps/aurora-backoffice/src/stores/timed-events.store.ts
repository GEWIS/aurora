import { defineStore } from 'pinia';
import {
  createTimedEvent,
  type CreateTimedEventRequest,
  deleteTimedEvent,
  getAllTimedEvents,
  type TimedEventResponse,
  updateTimedEvent,
  type UpdateTimedEventRequest,
} from '@/api';

interface TimedEventsStore {
  timedEvents: TimedEventResponse[];
  loading: boolean;
}

export const useTimedEventsStore = defineStore('timed-events', {
  state: (): TimedEventsStore => ({
    timedEvents: [],
    loading: true,
  }),
  actions: {
    async init(): Promise<void> {
      this.loading = true;
      const res = await getAllTimedEvents();
      if (res && res.data) this.timedEvents = res.data;
      this.loading = false;
    },
    async createTimedEvent(params: CreateTimedEventRequest): Promise<void> {
      this.loading = true;
      const res = await createTimedEvent({ body: params });
      if (res && res.data) {
        this.timedEvents.push(res.data);
      }
      this.loading = false;
    },
    async updateTimedEvent(id: number, params: UpdateTimedEventRequest): Promise<void> {
      this.loading = true;
      const res = await updateTimedEvent({ path: { id }, body: params });
      if (res && res.data) {
        const index = this.timedEvents.findIndex((f) => f.id === id);
        if (index >= 0) {
          this.timedEvents.splice(index, 1, res.data);
        } else {
          this.timedEvents.push(res.data);
        }
      }
      this.loading = false;
    },
    async deleteTimedEvent(id: number): Promise<void> {
      this.loading = true;
      const res = await deleteTimedEvent({ path: { id } });
      if (res && res.response.ok) {
        const index = this.timedEvents.findIndex((f) => f.id === id);
        if (index >= 0) this.timedEvents.splice(index, 1);
      }
      this.loading = false;
    },
  },
});
