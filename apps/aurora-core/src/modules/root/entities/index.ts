// eslint-disable-next-line import/no-cycle -- TODO fix cyclic dependency
import LightsController from './lights-controller';
import Audio from './audio';
import Screen from './screen';

export { default as Audio } from './audio';
export { default as LightsController } from './lights-controller';
export { default as Screen } from './screen';

export const Entities = [Audio, LightsController, Screen];
