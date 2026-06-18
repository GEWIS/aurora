export enum LightsEffectPattern {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT = 'diagonal_bottom_left_to_top_right',
  DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT = 'diagonal_top_left_to_bottom_right',
  CENTERED_CIRCULAR = 'centered_circular',
  CENTERED_SQUARED = 'centered_squared',
  ROTATIONAL = 'rotational',
}

export enum LightsEffectDirection {
  FORWARDS = 'forwards',
  BACKWARDS = 'backwards',
}

/**
 * Get a random lights effect pattern from all possible options.
 */
export function getRandomLightsEffectPattern(): LightsEffectPattern {
  const enumValues = Object.values(LightsEffectPattern);
  return enumValues[Math.floor(Math.random() * enumValues.length)];
}

/**
 * Get a random lights effect direction.
 */
export function getRandomLightsEffectDirection(): LightsEffectDirection {
  const enumValues = Object.values(LightsEffectDirection);
  return enumValues[Math.floor(Math.random() * enumValues.length)];
}
