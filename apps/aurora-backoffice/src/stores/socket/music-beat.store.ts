import { defineStore } from 'pinia';
import { useSocketStore } from '@/stores/socket.store';
import { type BeatGeneratorResponse, getAllBeatGenerators } from '@/api';

export interface GeneratorBeatEvent {
  id: string;
  name: string;
}

export interface BeatGeneratorInStore extends BeatGeneratorResponse {
  beat: boolean;
}

interface MusicBeatStore {
  beat: boolean;
  initializedBeat: boolean;
  generators: BeatGeneratorInStore[];
  initializedGenerators: boolean;
}

export const useMusicBeatStore = defineStore('music-beat', {
  state: (): MusicBeatStore => ({
    beat: false,
    initializedBeat: false,
    generators: [],
    initializedGenerators: false,
  }),
  getters: {},
  actions: {
    handlePrecedenceBeat() {
      this.beat = !this.beat;
    },
    handleGeneratorBeat(event: GeneratorBeatEvent) {
      const index = this.generators.findIndex((g) => g.id === event.id);
      if (index >= 0) {
        this.generators[index].beat = !this.generators[index].beat;
      }
    },
    handleGeneratorAdd(event: BeatGeneratorResponse) {
      if (event.hasPrecedence) {
        for (const g of this.generators) {
          g.hasPrecedence = false;
        }
      }
      this.generators.push({
        id: event.id,
        name: event.name,
        hasPrecedence: event.hasPrecedence,
        beat: false,
      });
    },
    handleGeneratorRemove(event: BeatGeneratorResponse) {
      const index = this.generators.findIndex((g) => g.id === event.id);
      if (index >= 0) {
        const hasPrecedence = this.generators[index].hasPrecedence;
        this.generators.splice(index, 1);
        // If this generator had precedence, we need to find which beat generator
        // is now determining the global beats.
        if (hasPrecedence) {
          void this.getAllBeatGenerators();
        }
      }
    },
    initBeat() {
      if (this.initializedBeat) return;

      const store = useSocketStore();
      if (!store.backofficeSocket) return;

      store.backofficeSocket.on('beat', this.handlePrecedenceBeat.bind(this));
      this.initializedBeat = true;
    },
    destroyBeat() {
      const store = useSocketStore();
      if (!store.backofficeSocket) return;

      store.backofficeSocket.removeListener('beat', this.handlePrecedenceBeat.bind(this));
      this.initializedBeat = false;
    },
    async getAllBeatGenerators() {
      const res = await getAllBeatGenerators();

      // If there are already generators present, synchronize the list in memory
      // with the fresh list. We do this to preserve the beat state (and not reset it).
      if (res.response.ok && res.data && this.generators.length > 0) {
        let notSeenGenerators: BeatGeneratorResponse[] = [...this.generators];
        res.data.forEach((generator: BeatGeneratorResponse) => {
          const index = this.generators.findIndex((g) => g.id === generator.id);
          if (index >= 0) {
            this.generators[index].id = generator.id;
            this.generators[index].name = generator.name;
            this.generators[index].hasPrecedence = generator.hasPrecedence;

            // Remove this generator from the list of all not-seen generators
            notSeenGenerators = notSeenGenerators.filter((g) => g.id !== generator.id);
          } else {
            this.handleGeneratorAdd(generator);
          }
        });

        notSeenGenerators.forEach((g) => {
          this.handleGeneratorRemove(g);
        });
      } else if (res.response.ok && res.data) {
        this.generators = res.data.map((g) => ({
          id: g.id,
          name: g.name,
          hasPrecedence: g.hasPrecedence,
          beat: false,
        }));
      }
    },
    async initBeatGenerators() {
      const store = useSocketStore();
      await store.connectBeat();
      await this.getAllBeatGenerators();

      if (!store.backofficeBeatSocket) return;

      store.backofficeBeatSocket.on('beat', this.handleGeneratorBeat.bind(this));
      store.backofficeBeatSocket.on('generator_add', this.handleGeneratorAdd.bind(this));
      store.backofficeBeatSocket.on('generator_remove', this.handleGeneratorRemove.bind(this));
      this.initializedGenerators = true;
    },
    destroyBeatGenerators() {
      const store = useSocketStore();
      if (!store.backofficeBeatSocket) return;

      store.backofficeBeatSocket.removeListener('beat', this.handleGeneratorBeat.bind(this));
      store.backofficeBeatSocket.removeListener('generator_add', this.handleGeneratorAdd.bind(this));
      store.backofficeBeatSocket.removeListener('generator_remove', this.handleGeneratorRemove.bind(this));
      this.initializedGenerators = false;

      store.disconnectBeat();
    },
  },
});
