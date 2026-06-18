import { Entity } from 'typeorm';
import { WheelColor } from '../color-definitions';
// eslint-disable-next-line import/no-cycle
import LightsWheelChannelValue from './lights-wheel-channel-value';

@Entity()
export default class LightsWheelColorChannelValue extends LightsWheelChannelValue<WheelColor> {}
