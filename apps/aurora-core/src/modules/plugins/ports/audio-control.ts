export type AudioTiming = { startTime: number; timestamp: number };

export default abstract class AudioControl {
  abstract play(url: string, startTime?: number): void;
  abstract stop(): void;
  abstract setPlayback(seconds: number): void;
  abstract addSyncTimingHandler(handler: (timing: AudioTiming) => void): void;
  abstract removeSyncTimingHandler(handler: (timing: AudioTiming) => void): void;
}
