import SearchLight, { SearchLightCreateParams } from './search-light';
import RandomPosition, { RandomPositionCreateParams } from './random-position';
import TableRotate, { TableRotateCreateParams } from './table-rotate';
import FixedPosition, { FixedPositionCreateParams } from './fixed-position';
import ClassicRotate, { ClassicRotateCreateParams } from './classic-rotate';
import ZigZag, { ZigZagCreateParams } from './zig-zag';

export { default as SearchLight } from './search-light';
export { default as TableRotate } from './table-rotate';
export { default as ClassicRotate } from './classic-rotate';
export { default as RandomPosition } from './random-position';
export { default as FixedPosition } from './fixed-position';
export { default as ZigZag } from './zig-zag';

export type LightsEffectsMovementCreateParams =
  | SearchLightCreateParams
  | TableRotateCreateParams
  | ClassicRotateCreateParams
  | RandomPositionCreateParams
  | FixedPositionCreateParams
  | ZigZagCreateParams;

export const LIGHTS_EFFECTS_MOVEMENT = [
  SearchLight,
  TableRotate,
  ClassicRotate,
  RandomPosition,
  FixedPosition,
  ZigZag,
];
