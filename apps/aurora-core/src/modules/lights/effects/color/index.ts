import BeatFadeOut, { BeatFadeOutCreateParams } from './beat-fade-out';
import SingleFlood, { SingleFloodCreateParams } from './single-flood';
import Sparkle, { SparkleCreateParams } from './sparkle';
import Strobe, { StrobeCreateParams } from './strobe';
import Wave, { WaveCreateParams } from './wave';
import StaticColor, { StaticColorCreateParams } from './static-color';
import Fire, { FireCreateParams } from './fire';
import BackgroundPulse, { BackgroundPulseCreateParams } from './background-pulse';
import RandomColor, { RandomColorCreateParams } from './random-color';

export { default as BackgroundPulse } from './background-pulse';
export { default as BeatFadeOut } from './beat-fade-out';
export { default as Fire } from './fire';
export { default as RandomColor } from './random-color';
export { default as Strobe } from './strobe';
export { default as SingleFlood } from './single-flood';
export { default as Sparkle } from './sparkle';
export { default as StaticColor } from './static-color';
export { default as Wave } from './wave';

export type LightsEffectsColorCreateParams =
  | BackgroundPulseCreateParams
  | BeatFadeOutCreateParams
  | FireCreateParams
  | RandomColorCreateParams
  | SingleFloodCreateParams
  | SparkleCreateParams
  | StaticColorCreateParams
  | StrobeCreateParams
  | WaveCreateParams;

export const LIGHTS_EFFECTS_COLOR = [
  BackgroundPulse,
  BeatFadeOut,
  Fire,
  RandomColor,
  SingleFlood,
  Sparkle,
  StaticColor,
  Strobe,
  Wave,
];
