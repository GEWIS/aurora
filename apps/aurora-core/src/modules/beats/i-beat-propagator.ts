import { BeatEvent } from '../events/music-emitter-events';
import type { BeatGenerator } from './beat-generator';

export default interface IBeatPropagator {
  sendBeat(event: BeatEvent, generator: BeatGenerator): void;
}
