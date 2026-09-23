import { BeatGenerator } from '../../beats/beat-generator';

export default abstract class BeatSource {
  abstract add(generator: BeatGenerator, priority: number): void;
  abstract remove(id: string): void;
}
