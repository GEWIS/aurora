import { BeatEvent } from './music-emitter-events';

export interface GeneratorBeatEvent extends BeatEvent {
  id: string;
  name: string;
}
