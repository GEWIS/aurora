import dataSource from '../database';
import { TimedEvent } from '../modules/timed-events/entities';
import RootScreenService from '../modules/root/root-screen-service';
import CarouselPosterHandler from '../modules/handlers/screen/poster/carousel-poster-handler';
import RootLightsService from '../modules/root/root-lights-service';
import { LightsGroup } from '../modules/lights/entities';
import RootAudioService from '../modules/root/root-audio-service';
import SimpleAudioHandler from '../modules/handlers/audio/simple-audio-handler';

export default async function seedDatabaseHubble(): Promise<LightsGroup[]> {
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
      name: 'PC-BAR',
      defaultHandler: SimpleAudioHandler.name,
    }),
  ]);

  const rootScreenService = new RootScreenService();
  await rootScreenService.createScreen({
    name: 'HubbleGeneralScreen',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 2,
  });
  await rootScreenService.createScreen({
    name: 'PlazaScreen',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 1,
  });
  await rootScreenService.createScreen({
    name: 'FoyerScreen',
    defaultHandler: CarouselPosterHandler.name,
    scaleFactor: 1,
  });

  const rootLightsService = new RootLightsService();
  const controller = await rootLightsService.createController({ name: 'HUBBLE-BAR' });

  const showtec_compact_par_7_3 = await rootLightsService.createLightsPar({
    name: 'Showtec Compact Par 7-3',
    nrChannels: 3,
    colorRedChannel: 1,
    colorGreenChannel: 2,
    colorBlueChannel: 3,
  });
  const showtec_shark_beam_fx_one = await rootLightsService.createMovingHeadRgb({
    name: 'Showtec Shark Beam FX One',
    nrChannels: 16,
    panChannel: 1,
    finePanChannel: 2,
    tiltChannel: 3,
    fineTiltChannel: 4,
    movingSpeedChannel: 5,
    masterDimChannel: 6,
    shutterChannel: 7,
    shutterOptionValues: {
      open: 0,
      strobe: 220,
    },
    colorRedChannel: 8,
    colorGreenChannel: 9,
    colorBlueChannel: 10,
    colorColdWhiteChannel: 11,
    basePanValue: 0.25,
    panMirrored: true,
  });

  const hubbleRoom = await rootLightsService.createLightGroup(controller.id, {
    name: 'Room',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 12,
    gridSizeY: 0,
    pars: [
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 1, positionX: 0 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 4, positionX: 1 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 7, positionX: 2 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 10, positionX: 3 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 13, positionX: 4 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 16, positionX: 5 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 22, positionX: 6 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 19, positionX: 7 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 25, positionX: 8 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 28, positionX: 9 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 31, positionX: 10 },
      { fixtureId: showtec_compact_par_7_3.id, firstChannel: 34, positionX: 11 },
    ],
    movingHeadRgbs: [],
    movingHeadWheels: [],
  });

  const movingHeadsWall = await rootLightsService.createLightGroup(controller.id, {
    name: 'Moving Heads Wall',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 4,
    gridSizeY: 0,
    pars: [],
    movingHeadRgbs: [
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 37, positionX: 0 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 53, positionX: 1 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 69, positionX: 2 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 85, positionX: 3 },
    ],
    movingHeadWheels: [],
  });

  const movingHeadsDanceFloor = await rootLightsService.createLightGroup(controller.id, {
    name: 'Moving Heads DanceFloor',
    defaultHandler: '',
    groupInMiddle: false,
    gridSizeX: 2,
    gridSizeY: 2,
    pars: [],
    movingHeadRgbs: [
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 101, positionX: 0, positionY: 0 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 149, positionX: 1, positionY: 0 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 117, positionX: 0, positionY: 1 },
      { fixtureId: showtec_shark_beam_fx_one.id, firstChannel: 133, positionX: 1, positionY: 1 },
    ],
    movingHeadWheels: [],
  });

  return [hubbleRoom!, movingHeadsWall!, movingHeadsDanceFloor!];
}
