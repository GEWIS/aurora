import { ColorChannel, IColorsRgb } from './entities/colors-rgb';

export enum WheelColor {
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  LIGHTBLUE = 'lightblue',
  ORANGE = 'orange',
  ROSERED = 'rosered',
}

export enum RgbColor {
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  LIGHTBLUE = 'lightblue',
  ORANGE = 'orange',
  ROSERED = 'rosered',
  PURPLE = 'purple',
  CYAN = 'cyan',
  PINK = 'pink',
  GOLD = 'gold',
  BROWN = 'brown',
  LIGHTPINK = 'lightpink',
  LIME = 'lime',
  MINT = 'mint',
  UV = 'uv',
  BLINDINGWHITE = 'blindingwhite',
}

export const wheelColors = Object.values(WheelColor);

export const rgbColors = Object.values(RgbColor);

export type HexColor = string;

export type RgbColorSpecification = {
  definition: Required<IColorsRgb>;
  alternative: WheelColor;
  complementary: RgbColor[];
  hex: HexColor;
  definitionLimited: Pick<IColorsRgb, 'redChannel' | 'greenChannel' | 'blueChannel'>;
};

export type RgbColorSet = {
  [color in RgbColor]: RgbColorSpecification;
};

export type RgbColorAlternatives = {
  [color in RgbColor]: WheelColor;
};

export function hexToRgb(hex: HexColor): { r: number; g: number; b: number } {
  const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return parts
    ? {
        r: parseInt(parts[1], 16),
        g: parseInt(parts[2], 16),
        b: parseInt(parts[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export const rgbColorDefinitions: RgbColorSet = {
  [RgbColor.WHITE]: {
    definition: {
      redChannel: 0,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 255,
      coldWhiteChannel: 255,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.WHITE,
    complementary: [],
    hex: '#ffffff',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 255,
      blueChannel: 255,
    },
  },
  [RgbColor.RED]: {
    definition: {
      redChannel: 255,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.RED,
    complementary: [
      RgbColor.BLUE,
      RgbColor.GREEN,
      RgbColor.YELLOW,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.GOLD,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ff1919',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 0,
      blueChannel: 0,
    },
  },
  [RgbColor.GREEN]: {
    definition: {
      redChannel: 0,
      blueChannel: 0,
      greenChannel: 255,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.GREEN,
    complementary: [
      RgbColor.RED,
      RgbColor.BLUE,
      RgbColor.YELLOW,
      RgbColor.LIGHTBLUE,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIGHTPINK,
    ],
    hex: '#00e60c',
    definitionLimited: {
      redChannel: 0,
      greenChannel: 255,
      blueChannel: 0,
    },
  },
  [RgbColor.BLUE]: {
    definition: {
      redChannel: 0,
      blueChannel: 255,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 64,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.BLUE,
    complementary: [
      RgbColor.RED,
      RgbColor.GREEN,
      RgbColor.YELLOW,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
    ],
    hex: '#0000ff',
    definitionLimited: {
      redChannel: 0,
      greenChannel: 0,
      blueChannel: 255,
    },
  },
  [RgbColor.YELLOW]: {
    definition: {
      redChannel: 255,
      blueChannel: 0,
      greenChannel: 128,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 255,
      uvChannel: 0,
    },
    alternative: WheelColor.YELLOW,
    complementary: [
      RgbColor.RED,
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.LIME,
    ],
    hex: '#fba900',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 124,
      blueChannel: 0,
    },
  },
  [RgbColor.LIGHTBLUE]: {
    definition: {
      redChannel: 0,
      blueChannel: 255,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 128,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.BLUE,
    complementary: [
      RgbColor.RED,
      RgbColor.GREEN,
      RgbColor.YELLOW,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PURPLE,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#6a6aff',
    definitionLimited: {
      redChannel: 98,
      greenChannel: 98,
      blueChannel: 255,
    },
  },
  [RgbColor.ORANGE]: {
    definition: {
      redChannel: 255,
      blueChannel: 0,
      greenChannel: 100,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 100,
      uvChannel: 0,
    },
    alternative: WheelColor.ORANGE,
    complementary: [
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.PINK,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ff8000',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 90,
      blueChannel: 0,
    },
  },
  [RgbColor.ROSERED]: {
    definition: {
      redChannel: 255,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 64,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.RED,
    complementary: [
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.BROWN,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ff3a7c',
    definitionLimited: {
      redChannel: 217,
      greenChannel: 32,
      blueChannel: 32,
    },
  },
  [RgbColor.PURPLE]: {
    definition: {
      redChannel: 255,
      blueChannel: 255,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.BLUE,
    complementary: [
      RgbColor.RED,
      RgbColor.GREEN,
      RgbColor.YELLOW,
      RgbColor.LIGHTBLUE,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.CYAN,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ff00f9',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 0,
      blueChannel: 255,
    },
  },
  [RgbColor.CYAN]: {
    definition: {
      redChannel: 0,
      blueChannel: 255,
      greenChannel: 255,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.BLUE,
    complementary: [
      RgbColor.RED,
      RgbColor.BLUE,
      RgbColor.YELLOW,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
    ],
    hex: '#00d7fc',
    definitionLimited: {
      redChannel: 0,
      blueChannel: 255,
      greenChannel: 255,
    },
  },
  [RgbColor.PINK]: {
    definition: {
      redChannel: 255,
      blueChannel: 128,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.RED,
    complementary: [
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.ORANGE,
      RgbColor.CYAN,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#f948c4',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 0,
      blueChannel: 128,
    },
  },
  [RgbColor.GOLD]: {
    definition: {
      redChannel: 128,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 32,
      coldWhiteChannel: 0,
      amberChannel: 255,
      uvChannel: 0,
    },
    alternative: WheelColor.YELLOW,
    complementary: [
      RgbColor.RED,
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.PINK,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ffbf00',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 92,
      blueChannel: 0,
    },
  },
  [RgbColor.BROWN]: {
    definition: {
      redChannel: 192,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 192,
      uvChannel: 0,
    },
    alternative: WheelColor.YELLOW,
    complementary: [
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.LIGHTBLUE,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.PINK,
      RgbColor.LIGHTPINK,
      RgbColor.LIME,
      RgbColor.MINT,
    ],
    hex: '#ff4d00',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 58,
      blueChannel: 0,
    },
  },
  [RgbColor.LIGHTPINK]: {
    definition: {
      redChannel: 192,
      blueChannel: 128,
      greenChannel: 0,
      warmWhiteChannel: 64,
      coldWhiteChannel: 64,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.RED,
    complementary: [
      RgbColor.GREEN,
      RgbColor.BLUE,
      RgbColor.ORANGE,
      RgbColor.CYAN,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIME,
    ],
    hex: '#fc8ddb',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 50,
      blueChannel: 189,
    },
  },
  [RgbColor.LIME]: {
    definition: {
      redChannel: 255,
      blueChannel: 0,
      greenChannel: 255,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.GREEN,
    complementary: [
      RgbColor.RED,
      RgbColor.BLUE,
      RgbColor.YELLOW,
      RgbColor.LIGHTBLUE,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PURPLE,
      RgbColor.CYAN,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
      RgbColor.LIGHTPINK,
    ],
    hex: '#80ff00',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 255,
      blueChannel: 0,
    },
  },
  [RgbColor.MINT]: {
    definition: {
      redChannel: 0,
      greenChannel: 255,
      blueChannel: 64,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 0,
    },
    alternative: WheelColor.GREEN,
    complementary: [
      RgbColor.RED,
      RgbColor.YELLOW,
      RgbColor.LIGHTBLUE,
      RgbColor.ORANGE,
      RgbColor.ROSERED,
      RgbColor.PURPLE,
      RgbColor.PINK,
      RgbColor.GOLD,
      RgbColor.BROWN,
    ],
    hex: '#3EB489',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 255,
      blueChannel: 0,
    },
  },
  [RgbColor.BLINDINGWHITE]: {
    definition: {
      redChannel: 255,
      blueChannel: 255,
      greenChannel: 255,
      warmWhiteChannel: 255,
      coldWhiteChannel: 255,
      amberChannel: 255,
      uvChannel: 0,
    },
    alternative: WheelColor.WHITE,
    complementary: [],
    hex: '#ffffff',
    definitionLimited: {
      redChannel: 255,
      greenChannel: 255,
      blueChannel: 255,
    },
  },
  [RgbColor.UV]: {
    definition: {
      redChannel: 0,
      blueChannel: 0,
      greenChannel: 0,
      warmWhiteChannel: 0,
      coldWhiteChannel: 0,
      amberChannel: 0,
      uvChannel: 255,
    },
    alternative: WheelColor.WHITE,
    complementary: [],
    hex: '#330066',
    definitionLimited: {
      redChannel: 0,
      greenChannel: 0,
      blueChannel: 0,
    },
  },
};

export function getTwoComplementaryRgbColors(): {
  colorNames: RgbColor[];
  colorSpecs: RgbColorSpecification[];
} {
  // Account for the colors without any complements
  const possibleColors = (Object.keys(rgbColorDefinitions) as RgbColor[]).filter(
    (c) => rgbColorDefinitions[c].complementary.length > 0,
  );

  const index = Math.floor(Math.random() * possibleColors.length);
  const baseColorName = possibleColors[index];
  const baseColor = rgbColorDefinitions[baseColorName];
  if (baseColor.complementary.length === 0)
    throw new Error(`Selected color ${baseColorName}, which has no complements`);
  const complementaryName =
    baseColor.complementary[Math.floor(Math.random() * baseColor.complementary.length)];
  const complementaryColor = rgbColorDefinitions[complementaryName];

  return {
    colorNames: [baseColorName, complementaryName],
    colorSpecs: [baseColor, complementaryColor],
  };
}
