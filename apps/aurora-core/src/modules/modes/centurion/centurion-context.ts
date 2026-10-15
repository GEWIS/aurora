import { Horn, Song } from '../../lights/mix-tape';
import { RgbColor } from '../../lights/color-definitions';
import SetEffectsHandler from '../../handlers/lights/set-effects-handler';
import { CenturionScreenHandler } from '../../handlers/screen';
import DiscoballController from './discoball-controller';
import CenturionBeatController from './centurion-beat-controller';
import RandomEffectPicker from './random-effect-picker';

export interface CenturionPlaybackState {
  lastHornEvent?: Horn & { timestamp: number };
  lastSongEvent?: Song & { timestamp: number };
  screenColors?: RgbColor[];
}

export interface CenturionContext {
  state: CenturionPlaybackState;
  lightsHandler: SetEffectsHandler;
  screenHandler: CenturionScreenHandler;
  discoBall: DiscoballController;
  beatController: CenturionBeatController;
  randomEffects: RandomEffectPicker;
}
