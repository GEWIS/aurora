import { Entity } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import LightsWheelChannelValue from './lights-wheel-channel-value';

@Entity()
export default class LightsWheelGoboChannelValue extends LightsWheelChannelValue<string> {}
