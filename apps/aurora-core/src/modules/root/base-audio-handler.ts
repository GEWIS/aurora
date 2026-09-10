import BaseHandler from './base-handler';
import Audio from './entities/audio';
import { MusicEmitter } from '../events';

export default abstract class BaseAudioHandler extends BaseHandler<Audio> {
  protected constructor(musicEmitter: MusicEmitter) {
    super();
    musicEmitter.registerAudioHandler(this);
  }

  // Do nothing with incoming beats
  beat() {}
}
