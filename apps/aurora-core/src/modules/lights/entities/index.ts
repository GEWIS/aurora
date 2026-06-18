// eslint-disable-next-line import/no-cycle
import LightsGroup from './lights-group';
import LightsPar from './lights-par';
import LightsMovingHeadRgb from './lights-moving-head-rgb';
import LightsMovingHeadWheel from './lights-moving-head-wheel';
import LightsGroupPars from './lights-group-pars';
import LightsGroupMovingHeadRgbs from './lights-group-moving-head-rgbs';
import LightsGroupMovingHeadWheels from './lights-group-moving-head-wheels';
import LightsWheelColorChannelValue from './lights-wheel-color-channel-value';
import LightsWheelGoboChannelValue from './lights-wheel-gobo-channel-value';
import { LightsPredefinedEffect, LightsScene, LightsSceneEffect } from './scenes';
import { LightsTrackEffect } from './sequences/lights-track-effect';
import LightsParShutterOptions from './lights-par-shutter-options';
import LightsMovingHeadRgbShutterOptions from './lights-moving-head-rgb-shutter-options';
import LightsMovingHeadWheelShutterOptions from './lights-moving-head-wheel-shutter-options';
import LightsWheelRotateChannelValue from './lights-wheel-rotate-channel-value';
import LightsSwitch from './lights-switch';

export { default as LightsGroup } from './lights-group';
export { default as LightsPar } from './lights-par';
export { default as LightsMovingHeadRgb } from './lights-moving-head-rgb';
export { default as LightsMovingHeadWheel } from './lights-moving-head-wheel';
export { default as LightsGroupPars } from './lights-group-pars';
export { default as LightsGroupMovingHeadRgbs } from './lights-group-moving-head-rgbs';
export { default as LightsGroupMovingHeadWheels } from './lights-group-moving-head-wheels';
export { default as LightsSwitch } from './lights-switch';

export const Entities = [
  LightsGroup,
  LightsPar,
  LightsParShutterOptions,
  LightsMovingHeadRgb,
  LightsMovingHeadRgbShutterOptions,
  LightsMovingHeadWheel,
  LightsMovingHeadWheelShutterOptions,
  LightsWheelColorChannelValue,
  LightsWheelGoboChannelValue,
  LightsWheelRotateChannelValue,
  LightsGroupPars,
  LightsGroupMovingHeadRgbs,
  LightsGroupMovingHeadWheels,
  LightsSwitch,
  LightsScene,
  LightsSceneEffect,
  LightsPredefinedEffect,
  LightsTrackEffect,
];
