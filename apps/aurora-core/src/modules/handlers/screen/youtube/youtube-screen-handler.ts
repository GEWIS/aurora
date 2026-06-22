import BaseScreenHandler from '../../base-screen-handler';
import { TrackChangeEvent } from '../../../events';

export type YoutubePhase =
  | 'idle'
  | 'downloading'
  | 'transcoding'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'error';

export interface YoutubeVideo {
  videId: string;
  title: string | null;
  duration: number;
  videoLocation: string;
  audioLocation: string;
}

export interface YoutubeScreenHandlerState {
  phase: YoutubePhase;
  video: YoutubeVideo | null;
  sync: {
    startEpoch: number | null;
    pausedAt: number | null;
  };
  ingest: {
    progress: number | null;
    error: string | null;
  };
  options: {
    loop: boolean;
    audio: boolean;
  };
}

function initState(): YoutubeScreenHandlerState {
  return {
    phase: 'idle',
    video: null,
    sync: { startEpoch: null, pausedAt: null },
    ingest: { progress: null, error: null },
    options: { loop: false, audio: false },
  };
}

export default class YoutubeScreenHandler extends BaseScreenHandler {
  private state: YoutubeScreenHandlerState = initState();

  getState(): YoutubeScreenHandlerState {
    return structuredClone(this.state);
  }

  beat(): void {}

  changeTrack(event: TrackChangeEvent[]): void {}

  reset(): void {
    super.reset();
    this.state = initState();
  }
}
