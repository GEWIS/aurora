import RootAudioService from '../modules/root/root-audio-service';
import RootScreenService from '../modules/root/root-screen-service';
import RootLightsService from '../modules/root/root-lights-service';
import dataSource from '../database';
import { LightsGroup, LightsMovingHeadWheel, LightsSwitch } from '../modules/lights/entities';
import { RgbColor, WheelColor } from '../modules/lights/color-definitions';
import { SparkleCreateParams } from '../modules/lights/effects/color/sparkle';
import { StaticColorCreateParams } from '../modules/lights/effects/color/static-color';
import { LightsTrackEffect } from '../modules/lights/entities/sequences/lights-track-effect';
import { LightsEffectsCreateParams } from '../modules/lights/effects';
import { WaveCreateParams } from '../modules/lights/effects/color/wave';
import { LightsScene, LightsSceneEffect } from '../modules/lights/entities/scenes';
import { SearchLightCreateParams } from '../modules/lights/effects/movement/search-light';
import LightsWheelColorChannelValue from '../modules/lights/entities/lights-wheel-color-channel-value';
import LightsWheelGoboChannelValue from '../modules/lights/entities/lights-wheel-gobo-channel-value';
import CarouselPosterHandler from '../modules/handlers/screen/poster/carousel-poster-handler';
import SimpleAudioHandler from '../modules/handlers/audio/simple-audio-handler';
import LightsWheelRotateChannelValue from '../modules/lights/entities/lights-wheel-rotate-channel-value';
import { FixedPositionCreateParams } from '../modules/lights/effects/movement/fixed-position';
import { ColorEffects } from '../modules/lights/effects/color/color-effects';
import { MovementEffects } from '../modules/lights/effects/movement/movement-effetcs';
import { TimedEvent } from '../modules/timed-events/entities';
import { IntegrationUserService } from '../modules/auth/integration';
import Poster, { FooterSize, PosterType } from '../modules/handlers/screen/poster/local/poster';

export default async function seedDatabase() {
  const timedEventsRepo = dataSource.getRepository(TimedEvent);
  await timedEventsRepo.save([
    {
      cronExpression: '39 5 * * *',
      eventSpec: { type: 'system-reset' },
    },
    {
      cronExpression: '39 4 * * *',
      eventSpec: { type: 'clean-audit-logs' },
    },
  ]);

  const rootAudioService = new RootAudioService();
  await Promise.all([
    rootAudioService.createAudio({
      name: 'PCGEWISHOK',
      defaultHandler: SimpleAudioHandler.name,
    }),
  ]);

  const rootScreenService = new RootScreenService();
  await rootScreenService.createScreen({
    name: 'PCGEWISB-links',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 1,
  });
  await rootScreenService.createScreen({
    name: 'PCGEWISB-rechts',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 1,
  });
  await rootScreenService.createScreen({
    name: 'PCGEWISINFO',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 1,
  });
  await new IntegrationUserService().createIntegrationUser({
    name: 'BPM-script',
    endpoints: [
      'startArtificialBeatGenerator',
      'stopArtificialBeatGenerator',
      'getArtificialBeatGenerator',
    ],
  });

  const rootLightsService = new RootLightsService();
  const controller = await rootLightsService.createController({ name: 'GEWIS-BAR' });

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const eurolite_LED_7C_7 = await rootLightsService.createLightsPar({
    name: 'Eurolite LED 7C-7',
    nrChannels: 12,
    masterDimChannel: 1,
    shutterChannel: 2,
    shutterOptionValues: {
      open: 0,
      strobe: 220,
    },
    colorRedChannel: 3,
    colorGreenChannel: 4,
    colorBlueChannel: 5,
    colorColdWhiteChannel: 6,
    colorWarmWhiteChannel: 7,
    colorAmberChannel: 8,
    colorUvChannel: 9,
  });
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const eurolite_LED_TMH_S30 = await rootLightsService.createMovingHeadWheel({
    name: 'Eurolite LED TMH-S30',
    nrChannels: 12,
    masterDimChannel: 10,
    shutterChannel: 9,
    shutterOptionValues: {
      open: 0,
      strobe: 220,
    },
    colorWheelChannel: 6,
    goboWheelChannel: 7,
    goboRotateChannel: 8,
    panChannel: 1,
    finePanChannel: 2,
    tiltChannel: 3,
    fineTiltChannel: 4,
    movingSpeedChannel: 5,
    colorWheelChannelValues: [],
    goboWheelChannelValues: [],
    goboRotateChannelValues: [],
  });
  eurolite_LED_TMH_S30.resetChannelAndValue = [12, 255];
  await dataSource.getRepository(LightsMovingHeadWheel).save(eurolite_LED_TMH_S30);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ayra_ERO_506 = await rootLightsService.createMovingHeadRgb({
    name: 'Ayra ERO 506',
    nrChannels: 15,
    masterDimChannel: 6,
    shutterChannel: 7,
    shutterOptionValues: {
      open: 255,
      strobe: 110,
    },
    panChannel: 1,
    finePanChannel: 2,
    tiltChannel: 3,
    fineTiltChannel: 4,
    basePanValue: 42,
    colorRedChannel: 8,
    colorGreenChannel: 9,
    colorBlueChannel: 10,
    colorColdWhiteChannel: 11,
    colorAmberChannel: 12,
    colorUvChannel: 13,
  });

  const showtec_Kanjo_Spot10 = await rootLightsService.createMovingHeadWheel({
    name: 'Showtec Kanjo Spot 10',
    nrChannels: 10,
    masterDimChannel: 8,
    shutterChannel: 9,
    shutterOptionValues: {
      open: 0,
      strobe: 120,
    },
    panChannel: 1,
    finePanChannel: 2,
    tiltChannel: 3,
    fineTiltChannel: 4,
    movingSpeedChannel: 5,
    colorWheelChannel: 6,
    goboWheelChannel: 7,
    colorWheelChannelValues: [],
    goboWheelChannelValues: [],
    goboRotateChannelValues: [],
  });

  const gewisRoom = await rootLightsService.createLightGroup(controller.id, {
    name: 'Ruimte',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 12,
    gridSizeY: 0,
    pars: [
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 1, positionX: 0 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 17, positionX: 1 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 33, positionX: 2 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 49, positionX: 3 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 65, positionX: 4 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 81, positionX: 5 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 193, positionX: 6 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 209, positionX: 7 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 225, positionX: 8 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 241, positionX: 9 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 257, positionX: 10 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 273, positionX: 11 },
    ],
    movingHeadRgbs: [],
    movingHeadWheels: [],
  });
  const gewisBar = await rootLightsService.createLightGroup(controller.id, {
    name: 'Bar',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 4,
    gridSizeY: 0,
    pars: [
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 97, positionX: 0 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 113, positionX: 1 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 289, positionX: 2 },
      { fixtureId: eurolite_LED_7C_7.id, firstChannel: 305, positionX: 3 },
    ],
    movingHeadRgbs: [],
    movingHeadWheels: [],
  });
  const gewisLounge = await rootLightsService.createLightGroup(controller.id, {
    name: 'Lounge',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 1,
    gridSizeY: 0,
    pars: [{ fixtureId: eurolite_LED_7C_7.id, firstChannel: 129, positionX: 0 }],
    movingHeadRgbs: [],
    movingHeadWheels: [],
  });
  const gewisMHRoom = await rootLightsService.createLightGroup(controller.id, {
    name: 'Ruimte MH',
    defaultHandler: '',
    groupInMiddle: true,
    gridSizeX: 2,
    gridSizeY: 0,
    pars: [],
    movingHeadRgbs: [],
    movingHeadWheels: [
      { fixtureId: showtec_Kanjo_Spot10.id, firstChannel: 385, positionX: 0 },
      { fixtureId: eurolite_LED_TMH_S30.id, firstChannel: 161, positionX: 1 },
      { fixtureId: showtec_Kanjo_Spot10.id, firstChannel: 401, positionX: 2 },
      { fixtureId: showtec_Kanjo_Spot10.id, firstChannel: 417, positionX: 3 },
      { fixtureId: eurolite_LED_TMH_S30.id, firstChannel: 177, positionX: 4 },
      { fixtureId: showtec_Kanjo_Spot10.id, firstChannel: 433, positionX: 5 },
    ],
  });
  if (!gewisMHRoom) throw new Error('GEWIS MHs not created');
  const royMHs = await rootLightsService.createLightGroup(controller.id, {
    name: 'Roy MH',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 2,
    gridSizeY: 0,
    pars: [],
    movingHeadRgbs: [
      { fixtureId: ayra_ERO_506.id, firstChannel: 353, positionX: 0 },
      { fixtureId: ayra_ERO_506.id, firstChannel: 369, positionX: 1 },
    ],
    movingHeadWheels: [],
  });

  const colorRepo = dataSource.getRepository(LightsWheelColorChannelValue);
  await Promise.all([
    colorRepo.save({ id: 1, name: WheelColor.WHITE, value: 1, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({ id: 2, name: WheelColor.RED, value: 11, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({ id: 3, name: WheelColor.GREEN, value: 21, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({ id: 4, name: WheelColor.BLUE, value: 31, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({ id: 5, name: WheelColor.YELLOW, value: 41, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({
      id: 6,
      name: WheelColor.LIGHTBLUE,
      value: 51,
      movingHead: eurolite_LED_TMH_S30,
    }),
    colorRepo.save({ id: 7, name: WheelColor.ORANGE, value: 61, movingHead: eurolite_LED_TMH_S30 }),
    colorRepo.save({
      id: 8,
      name: WheelColor.ROSERED,
      value: 71,
      movingHead: eurolite_LED_TMH_S30,
    }),
  ]);
  await Promise.all([
    colorRepo.save({ id: 8, name: WheelColor.WHITE, value: 0, movingHead: showtec_Kanjo_Spot10 }),
    colorRepo.save({ id: 9, name: WheelColor.RED, value: 16, movingHead: showtec_Kanjo_Spot10 }),
    colorRepo.save({ id: 10, name: WheelColor.GREEN, value: 32, movingHead: showtec_Kanjo_Spot10 }),
    colorRepo.save({ id: 11, name: WheelColor.BLUE, value: 48, movingHead: showtec_Kanjo_Spot10 }),
    colorRepo.save({
      id: 12,
      name: WheelColor.YELLOW,
      value: 64,
      movingHead: showtec_Kanjo_Spot10,
    }),
    colorRepo.save({
      id: 13,
      name: WheelColor.ROSERED,
      value: 80,
      movingHead: showtec_Kanjo_Spot10,
    }),
    colorRepo.save({
      id: 14,
      name: WheelColor.LIGHTBLUE,
      value: 96,
      movingHead: showtec_Kanjo_Spot10,
    }),
    colorRepo.save({
      id: 15,
      name: WheelColor.ORANGE,
      value: 112,
      movingHead: showtec_Kanjo_Spot10,
    }),
  ]);
  const goboRepo = dataSource.getRepository(LightsWheelGoboChannelValue);
  await Promise.all([
    goboRepo.save({ id: 1, name: 'Open', value: 0, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 2, name: 'Blender', value: 11, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 3, name: 'BAC', value: 21, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({
      id: 4,
      name: 'BAC (light shake)',
      value: 90,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRepo.save({ id: 5, name: 'Swirl', value: 31, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 6, name: 'Bolletjes', value: 41, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 7, name: 'GEWIS', value: 51, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 8, name: 'Swoosh', value: 61, movingHead: eurolite_LED_TMH_S30 }),
    goboRepo.save({ id: 9, name: 'HalvePizza', value: 71, movingHead: eurolite_LED_TMH_S30 }),
  ]);
  await Promise.all([
    goboRepo.save({ id: 10, name: 'Open', value: 0, movingHead: showtec_Kanjo_Spot10 }),
  ]);
  const goboRotateRepo = dataSource.getRepository(LightsWheelRotateChannelValue);
  await Promise.all([
    goboRotateRepo.save({ id: 1, name: 'None', value: 0, movingHead: eurolite_LED_TMH_S30 }),
    goboRotateRepo.save({
      id: 2,
      name: 'Superfast counter-clockwise',
      value: 126,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 3,
      name: 'Fast counter-clockwise',
      value: 85,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 4,
      name: 'Counter-clockwise',
      value: 45,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 5,
      name: 'Slow counter-clockwise',
      value: 5,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 6,
      name: 'Superfast clockwise',
      value: 255,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 7,
      name: 'Fast clockwise',
      value: 193,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 8,
      name: 'Clockwise',
      value: 171,
      movingHead: eurolite_LED_TMH_S30,
    }),
    goboRotateRepo.save({
      id: 9,
      name: 'Slow clockwise',
      value: 130,
      movingHead: eurolite_LED_TMH_S30,
    }),
  ]);

  const switchRepo = dataSource.getRepository(LightsSwitch);
  const discoball = await switchRepo.save({
    name: 'GEWIScobal',
    controller,
    dmxChannel: 145,
    onValue: 255,
  });

  return Promise.all(
    [gewisRoom, gewisBar, gewisLounge, gewisMHRoom, royMHs].map(
      (g) => dataSource.getRepository(LightsGroup).findOne({ where: { id: g!.id } })!,
    ),
  );
}

const borrelRuimte: StaticColorCreateParams = {
  type: ColorEffects.StaticColor,
  props: {
    color: RgbColor.RED,
    relativeBrightness: 0.8,
  },
};
const borrelBar: StaticColorCreateParams = {
  type: ColorEffects.StaticColor,
  props: {
    color: RgbColor.GREEN,
    relativeBrightness: 0.8,
  },
};

export async function seedBorrelLights(
  room: LightsGroup,
  bar: LightsGroup,
  lounge: LightsGroup,
  movingHeadsGEWIS: LightsGroup,
) {
  const sceneRepo = dataSource.getRepository(LightsScene);
  const sceneEffectRepo = dataSource.getRepository(LightsSceneEffect);

  const borrelScene = await sceneRepo.save({
    name: 'BAC Borrel',
    favorite: true,
  });

  const borrelStaticScene = await sceneRepo.save({
    name: 'BAC Borrel (static)',
    favorite: true,
  });

  const movingHeadRotate: SearchLightCreateParams = {
    type: MovementEffects.SearchLight,
    props: {
      radiusFactor: 0.5,
      cycleTime: 15000,
    },
  };
  const movingHeadStatic: FixedPositionCreateParams = {
    type: MovementEffects.FixedPosition,
    props: {
      variant: 'Absolute',
      pan: 59,
      tilt: 18,
    },
  };
  const movingHeadBac: StaticColorCreateParams = {
    type: ColorEffects.StaticColor,
    props: {
      color: RgbColor.BLINDINGWHITE,
      gobo: 'BAC',
    },
  };
  const movingHeadBacTilting: StaticColorCreateParams = {
    type: ColorEffects.StaticColor,
    props: {
      color: RgbColor.BLINDINGWHITE,
      gobo: 'BAC (light shake)',
      goboRotate: 'Slow counter-clockwise',
    },
  };

  // Static pars for the room, lounge and bar
  await sceneEffectRepo.save({
    scene: borrelScene,
    effectName: borrelRuimte.type,
    effectProps: JSON.stringify(borrelRuimte.props),
    group: room,
  });
  await sceneEffectRepo.save({
    scene: borrelScene,
    effectName: borrelRuimte.type,
    effectProps: JSON.stringify(borrelRuimte.props),
    group: lounge,
  });
  await sceneEffectRepo.save({
    scene: borrelScene,
    effectName: borrelBar.type,
    effectProps: JSON.stringify(borrelBar.props),
    group: bar,
  });

  // Moving heads
  await sceneEffectRepo.save({
    scene: borrelScene,
    effectName: movingHeadRotate.type,
    effectProps: JSON.stringify(movingHeadRotate.props),
    group: movingHeadsGEWIS,
  });
  await sceneEffectRepo.save({
    scene: borrelScene,
    effectName: movingHeadBac.type,
    effectProps: JSON.stringify(movingHeadBac.props),
    group: movingHeadsGEWIS,
  });

  // Static pars for the room, lounge and bar
  await sceneEffectRepo.save({
    scene: borrelStaticScene,
    effectName: borrelRuimte.type,
    effectProps: JSON.stringify(borrelRuimte.props),
    group: room,
  });
  await sceneEffectRepo.save({
    scene: borrelStaticScene,
    effectName: borrelRuimte.type,
    effectProps: JSON.stringify(borrelRuimte.props),
    group: lounge,
  });
  await sceneEffectRepo.save({
    scene: borrelStaticScene,
    effectName: borrelBar.type,
    effectProps: JSON.stringify(borrelBar.props),
    group: bar,
  });

  // Moving heads
  await sceneEffectRepo.save({
    scene: borrelStaticScene,
    effectName: movingHeadStatic.type,
    effectProps: JSON.stringify(movingHeadStatic.props),
    group: movingHeadsGEWIS,
  });
  await sceneEffectRepo.save({
    scene: borrelStaticScene,
    effectName: movingHeadBacTilting.type,
    effectProps: JSON.stringify(movingHeadBacTilting.props),
    group: movingHeadsGEWIS,
  });

  return [borrelScene, borrelStaticScene];
}

export async function seedOpeningSequence(
  room: LightsGroup,
  bar: LightsGroup,
  movingHeadsGEWIS: LightsGroup,
  movingHeadsRoy?: LightsGroup,
) {
  const repo = dataSource.getRepository(LightsTrackEffect);
  const trackUri = 'spotify:track:22L7bfCiAkJo5xGSQgmiIO';

  const addStep = async (
    effect: LightsEffectsCreateParams,
    timestamp: number,
    duration: number,
    lightGroups: LightsGroup[],
  ) => {
    await repo.save({
      trackUri,
      timestamp,
      duration,
      effect: effect.type,
      effectProps: JSON.stringify(effect.props),
      lightGroups,
    } as LightsTrackEffect);
  };

  const allOfTheLights: SparkleCreateParams = {
    type: ColorEffects.Sparkle,
    props: {
      colors: [RgbColor.BLUE],
      ratio: 0.2,
      dimDuration: 25,
      cycleTime: 75,
    },
  };

  const movingHeadsWhite: StaticColorCreateParams = {
    type: ColorEffects.StaticColor,
    props: { color: RgbColor.WHITE },
  };

  const spots = [room, bar];
  if (movingHeadsRoy) spots.push(movingHeadsRoy);

  await addStep(borrelRuimte, 0, 14000, [room]);
  await addStep(borrelBar, 0, 14000, [bar]);

  const registerDim = async (
    dimStart: number,
    dimEnd: number,
    stepDuration: number,
    dim = true,
    effectRoom: StaticColorCreateParams = borrelRuimte,
    effectBar: StaticColorCreateParams = borrelBar,
  ) => {
    const steps = Math.round((dimEnd - dimStart) / stepDuration);
    await Promise.all(
      new Array(Math.round(steps) + 1).fill(0).map(async (x, i) => {
        const progression = Math.min(i / steps, 1);
        const relativeBrightness = dim ? 0.8 * (1 - progression) : 0.8 * progression;
        await addStep(
          {
            ...effectRoom,
            props: { ...effectRoom.props, relativeBrightness },
          },
          dimStart + i * stepDuration,
          stepDuration + 25,
          [room],
        );
        await addStep(
          {
            ...effectBar,
            props: { ...effectBar.props, relativeBrightness },
          },
          dimStart + i * stepDuration,
          stepDuration + 25,
          [bar],
        );
      }),
    );
  };

  await registerDim(14000, 27500, 250);

  // Keep SearchLight animation on till the moving-head only blackout.
  await addStep(
    { type: MovementEffects.SearchLight, props: { radiusFactor: 1.5 } },
    28000,
    189000,
    [movingHeadsGEWIS],
  );

  // Refrein 1
  await addStep(movingHeadsWhite, 28000, 32000, [movingHeadsGEWIS]);
  await addStep(allOfTheLights, 27500, 1500, [room, bar]);
  await addStep(
    { type: 'Wave', props: { colors: [RgbColor.ROSERED] } } as WaveCreateParams,
    29000,
    4000,
    spots,
  );
  await addStep(allOfTheLights, 33000, 2000, [room, bar]);
  await addStep(
    { type: 'Wave', props: { colors: [RgbColor.ROSERED] } } as WaveCreateParams,
    35000,
    5000,
    spots,
  );
  await addStep(allOfTheLights, 40000, 1500, [room, bar]);
  await addStep(
    { type: 'Wave', props: { colors: [RgbColor.ROSERED] } } as WaveCreateParams,
    41500,
    13500,
    spots,
  );

  // Couplet
  await addStep(
    {
      type: ColorEffects.BeatFadeOut,
      props: { colors: [RgbColor.PURPLE, RgbColor.GREEN], nrBlacks: 1 },
    },
    55000,
    5500,
    spots,
  );
  // BLACKOUT (at 1 minute exactly for 2,5 seconds)
  await addStep(
    {
      type: ColorEffects.BeatFadeOut,
      props: { colors: [RgbColor.PURPLE, RgbColor.GREEN], nrBlacks: 1 },
    },
    62500,
    19000,
    spots,
  );
  await addStep(movingHeadsWhite, 63000, 155000, [movingHeadsGEWIS]);

  await addStep(allOfTheLights, 81500, 2000, spots);
  await addStep(
    { type: ColorEffects.Wave, props: { colors: [RgbColor.PINK] } },
    83500,
    4500,
    spots,
  );
  await addStep(allOfTheLights, 88000, 2000, spots);
  await addStep(
    { type: ColorEffects.Wave, props: { colors: [RgbColor.PINK] } },
    90000,
    4800,
    spots,
  );
  await addStep(allOfTheLights, 94800, 1600, spots);
  await addStep(
    { type: ColorEffects.Sparkle, props: { colors: [RgbColor.GREEN, RgbColor.BROWN] } },
    96000,
    12400,
    spots,
  );
  await addStep(allOfTheLights, 108400, 1600, spots);
  await addStep(
    {
      type: ColorEffects.BeatFadeOut,
      props: { colors: [RgbColor.ORANGE, RgbColor.LIGHTBLUE], nrBlacks: 1 },
    },
    110000,
    25800,
    spots,
  );

  // Refrein
  await addStep(allOfTheLights, 135800, 1200, spots);
  await addStep(
    { type: ColorEffects.Wave, props: { colors: [RgbColor.YELLOW] } },
    138000,
    4000,
    spots,
  );
  await addStep(allOfTheLights, 142000, 2000, spots);
  await addStep(
    { type: ColorEffects.Wave, props: { colors: [RgbColor.YELLOW] } },
    144000,
    4000,
    spots,
  );
  await addStep(allOfTheLights, 148000, 2000, spots);

  await addStep(
    { type: ColorEffects.Sparkle, props: { colors: [RgbColor.BLUE, RgbColor.LIME] } },
    150000,
    12500,
    spots,
  );
  await addStep(allOfTheLights, 162500, 1000, spots);
  await addStep(
    {
      type: ColorEffects.Sparkle,
      props: {
        colors: [RgbColor.GOLD],
        dimDuration: 2000,
        cycleTime: 125,
        ratio: 0.05,
      },
    },
    163500,
    27000,
    spots,
  );
  await addStep(
    { type: ColorEffects.Wave, props: { colors: [RgbColor.YELLOW], cycleTime: 425 } },
    190500,
    27500,
    spots,
  );

  await addStep(movingHeadsWhite, 218000, 26000, [movingHeadsGEWIS]);
  await addStep({ type: MovementEffects.SearchLight, props: { cycleTime: 10000 } }, 218000, 26000, [
    movingHeadsGEWIS,
  ]);

  // Slowly turn on lights
  await registerDim(
    231000,
    244000,
    250,
    false,
    { type: ColorEffects.StaticColor, props: { color: RgbColor.UV } },
    { type: ColorEffects.StaticColor, props: { color: RgbColor.UV } },
  );

  await addStep(
    { type: ColorEffects.SingleFlood, props: { dimMilliseconds: 5000 } },
    244000,
    7000,
    spots,
  );
  await addStep(
    { type: ColorEffects.SingleFlood, props: { dimMilliseconds: 5000 } },
    251000,
    7000,
    spots,
  );
  await addStep(allOfTheLights, 258000, 1000, spots);
  await addStep({ type: ColorEffects.Strobe, props: { durationMs: 3000 } }, 259000, 3000, spots);

  await addStep(
    { type: ColorEffects.BeatFadeOut, props: { colors: [RgbColor.RED, RgbColor.CYAN] } },
    262000,
    23000,
    spots,
  );
  await addStep(movingHeadsWhite, 262000, 23000, [movingHeadsGEWIS]);
  await addStep(
    { type: MovementEffects.RandomPosition, props: { beatsToMove: 1 } },
    262000,
    23000,
    [movingHeadsGEWIS],
  );

  await addStep(borrelRuimte, 285000, 15000, [room]);
  await addStep(borrelBar, 285000, 15000, [bar]);
}

export async function seedPosters() {
  const repo = dataSource.getRepository(Poster);

  await repo.save([
    {
      name: 'Logo',
      type: PosterType.LOGO,
      enabled: true,
      label: 'GEWIS Logo',
      protected: true,
      borrelMode: false,
      footerSize: FooterSize.FULL,
      defaultTimeout: 15,
      trello: false,
    },
    {
      name: 'Trains',
      type: PosterType.TRAINS,
      enabled: true,
      label: 'Trains',
      protected: true,
      borrelMode: false,
      footerSize: FooterSize.MINIMAL,
      defaultTimeout: 30,
      trello: false,
    },
    {
      name: 'Borrel Logo',
      type: PosterType.BORREL_LOGO,
      enabled: true,
      label: 'Borrel Logo',
      protected: true,
      borrelMode: true,
      footerSize: FooterSize.FULL,
      defaultTimeout: 15,
      trello: false,
    },
    {
      name: 'Borrel Price List',
      type: PosterType.BORREL_PRICE_LIST,
      enabled: true,
      label: 'Borrel Price List',
      protected: true,
      borrelMode: true,
      footerSize: FooterSize.MINIMAL,
      defaultTimeout: 15,
      trello: false,
    },
    {
      name: 'Borrel Wall of Shame',
      type: PosterType.BORREL_WALL_OF_SHAME,
      enabled: true,
      label: 'Borrel Wall of Shame',
      protected: true,
      borrelMode: true,
      footerSize: FooterSize.MINIMAL,
      defaultTimeout: 15,
      trello: false,
    },
    {
      name: 'Olympics',
      type: PosterType.OLYMPICS,
      enabled: false,
      label: 'Olympics',
      protected: true,
      borrelMode: false,
      footerSize: FooterSize.FULL,
      defaultTimeout: 15,
      trello: false,
    },
  ] as Poster[]);
}
