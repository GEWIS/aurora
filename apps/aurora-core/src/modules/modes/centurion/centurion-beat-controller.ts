import { BeatManager, BeatPriorities, SimpleBeatGenerator } from '../../beats';

export default class CenturionBeatController {
  private beatGeneratorSong: SimpleBeatGenerator | undefined;
  private beatGeneratorBackground: SimpleBeatGenerator;

  constructor(private readonly beatManager: BeatManager) {}

  public startBackground(): void {
    this.beatGeneratorBackground = new SimpleBeatGenerator(
      'background',
      'Centurion (Background)',
      130,
    );
    this.beatManager.add(this.beatGeneratorBackground, BeatPriorities.BACKGROUND_BEAT_GENERATOR);
  }

  public stopBackground(): void {
    this.beatManager.remove(this.beatGeneratorBackground.getId());
  }

  public get songBpm(): number | undefined {
    return this.beatGeneratorSong?.bpm;
  }

  public setSong(bpm?: number): void {
    if (this.beatGeneratorSong) {
      this.beatManager.remove(this.beatGeneratorSong.getId());
      this.beatGeneratorSong = undefined;
    }

    if (bpm) {
      this.beatGeneratorSong = new SimpleBeatGenerator('centurion', 'Centurion', bpm);
      this.beatManager.add(this.beatGeneratorSong, BeatPriorities.CENTURION_BEAT_GENERATOR);
    }
  }

  public restart(): void {
    this.beatGeneratorBackground.restart();
    if (this.beatGeneratorSong) this.beatGeneratorSong.restart();
  }
}
