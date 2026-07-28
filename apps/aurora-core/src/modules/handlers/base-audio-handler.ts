import BaseHandler from './base-handler';
import Audio from '../common/entities/audio';
import type { MusicEmitter } from '../events/music-emitter';

export default abstract class BaseAudioHandler extends BaseHandler<Audio> {
  protected constructor(musicEmitter: MusicEmitter) {
    super();
    musicEmitter.registerAudioHandler(this);
  }

  // Do nothing with incoming beats
  beat() {}
}
