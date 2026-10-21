import { CenturionContext, Lane } from '../centurion-context';
import { CenturionCommand } from './centurion-command';
import { Song, SongData } from '../../../lights/mix-tape';
import { TrackChangeEvent } from '../../../events';

export default class SongCommand extends CenturionCommand {
  readonly lanes: Lane[] = [
    'song',
    'bpm',
    'screenColors',
    'parColor',
    'rgbColor',
    'rgbMovement',
    'wheelColor',
    'wheelMovement',
  ];

  constructor(private readonly event: Song & { timestamp: number }) {
    super(event.timestamp);
  }

  execute(ctx: CenturionContext): void {
    this.restore(ctx, new Set(this.lanes));
  }

  restore(ctx: CenturionContext, lanes: ReadonlySet<Lane>) {
    if (lanes.has('bpm')) {
      ctx.beatController.setSong(this.songs.find((s) => s.bpm !== undefined)?.bpm);
    }

    if (lanes.has('screenColors')) {
      // The song event never rolls lights alone
      ctx.randomEffects.roll(ctx, lanes);
    }

    if (lanes.has('song')) {
      ctx.state.lastSongEvent = this.event;
      ctx.musicEmitter.emitAudio(
        'change_track',
        this.songs.map((s): TrackChangeEvent => ({
          title: s.title,
          artists: s.artist.split(', '),
          cover: ctx.coverUrl,
        })),
      );
    }
  }

  private get songs(): SongData[] {
    return Array.isArray(this.event.data) ? this.event.data : [this.event.data];
  }
}
