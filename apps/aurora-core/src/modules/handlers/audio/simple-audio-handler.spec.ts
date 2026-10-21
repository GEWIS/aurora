import { describe, it, expect, vi } from 'vitest';
import { Namespace } from 'socket.io';
import SimpleAudioHandler from './simple-audio-handler';
import { MusicEmitter } from '../../events';

describe('SimpleAudioHandler', () => {
  describe('removeSyncAudioTimingHandler', () => {
    it('should keep the other sync handlers', () => {
      let onConnection: (socket: { on: (event: string, cb: unknown) => void }) => void = () => {};
      const socket = {
        on: (_: string, cb: typeof onConnection) => (onConnection = cb),
      } as unknown as Namespace;
      const handler = new SimpleAudioHandler(socket, new MusicEmitter());

      let sync: (params: { startTime: number; timestamp: number }) => void = () => {};
      onConnection({ on: (_, cb) => (sync = cb as typeof sync) });

      const removed = vi.fn();
      const kept = vi.fn();
      handler.addSyncAudioTimingHandler(removed);
      handler.addSyncAudioTimingHandler(kept);
      handler.removeSyncAudioTimingHandler(removed);
      sync({ startTime: 1, timestamp: 2 });

      expect(removed).not.toHaveBeenCalled();
      expect(kept).toHaveBeenCalledWith({ startTime: 1, timestamp: 2 });
    });
  });
});
