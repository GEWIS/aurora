import { FindOptionsWhere, Repository } from 'typeorm';
import { LightsController } from '../lights/entities';
import {
  LightsGroup,
  LightsMovingHeadRgb,
  LightsMovingHeadWheel,
  LightsPar,
  LightsSwitch,
} from '../lights/entities';
import dataSource from '../../database';
import LightsFixture from '../lights/entities/lights-fixture';
import ColorsRgb, { IColorsRgb } from '../lights/entities/colors-rgb';
import LightsMovingHead from '../lights/entities/lights-moving-head';
import LightsGroupPars from '../lights/entities/lights-group-pars';
import LightsGroupMovingHeadRgbs from '../lights/entities/lights-group-moving-head-rgbs';
import LightsGroupMovingHeadWheels from '../lights/entities/lights-group-moving-head-wheels';
import Movement, { IMovement } from '../lights/entities/movement';
import AuthService from '../auth/auth-service';
import LightsParShutterOptions from '../lights/entities/lights-par-shutter-options';
import LightsMovingHeadRgbShutterOptions from '../lights/entities/lights-moving-head-rgb-shutter-options';
import LightsMovingHeadWheelShutterOptions from '../lights/entities/lights-moving-head-wheel-shutter-options';
import LightsFixtureShutterOptions, {
  ShutterOption,
} from '../lights/entities/lights-fixture-shutter-options';
import LightsWheelColorChannelValue from '../lights/entities/lights-wheel-color-channel-value';
import LightsWheelGoboChannelValue from '../lights/entities/lights-wheel-gobo-channel-value';
import LightsWheelRotateChannelValue from '../lights/entities/lights-wheel-rotate-channel-value';

import LightsSwitchManager from './lights-switch-manager';
import { WheelColor } from '../lights/color-definitions';

export interface LightsControllerResponse extends Pick<
  LightsController,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'socketIds'
> {}

export interface ShutterChannelValuesResponse {
  open?: number;
  strobe?: number;
}

export interface LightsFixtureResponse extends Pick<
  LightsFixture,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'nrChannels'
> {
  canReset: boolean;
  resetChannel?: number;
  resetChannelValue?: number;
  shutterChannelValues: ShutterChannelValuesResponse;
}

// do not remove; tsoa cannot deal with multiple utility types.
// https://github.com/lukeautry/tsoa/issues/1238
// prettier-ignore
export interface ColorResponse
  extends Pick<
    ColorsRgb,
    'masterDimChannel' | 'shutterChannel' | 'redChannel' | 'blueChannel' | 'greenChannel' | 'coldWhiteChannel' | 'warmWhiteChannel' | 'amberChannel' | 'uvChannel'
  > {}

export interface ParResponse extends LightsFixtureResponse, ColorResponse {}

export interface MovingHeadResponse extends LightsFixtureResponse, IMovement {}

export interface MovingHeadRgbResponse extends MovingHeadResponse, ColorResponse {}

export interface MovingHeadWheelColorChannelValueResponse {
  color: WheelColor;
  channelValue: number;
}

export interface MovingHeadWheelResponse extends MovingHeadResponse {
  masterDimChannel: number;
  shutterChannel?: number;
  wheelColorChannel: number;
  wheelColorChannelValues: MovingHeadWheelColorChannelValueResponse[];
  wheelGoboChannel: number;
  gobos: string[];
  wheelGoboRotateChannel: number | null;
  goboRotates: string[];
}

export interface FixtureInGroupResponse<
  T extends ParResponse | MovingHeadWheelResponse | MovingHeadRgbResponse,
> {
  fixture: T;
  id: number;
  firstChannel: number;
  positionX: number;
  positionY: number;
  masterDimmer: number;
}

export interface BaseLightsGroupResponse extends Pick<
  LightsGroup,
  'id' | 'createdAt' | 'updatedAt' | 'name'
> {}

export interface LightsGroupResponse extends BaseLightsGroupResponse {
  controller: LightsControllerResponse;
  gridSizeX: number;
  gridSizeY: number;
  pars: FixtureInGroupResponse<ParResponse>[];
  movingHeadRgbs: FixtureInGroupResponse<MovingHeadRgbResponse>[];
  movingHeadWheels: FixtureInGroupResponse<MovingHeadWheelResponse>[];
}

export interface LightsSwitchResponse extends Pick<
  LightsSwitch,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'dmxChannel' | 'onValue'
> {}

export interface ColorParams {
  masterDimChannel?: number;
  shutterChannel?: number;
  colorRedChannel: number;
  colorGreenChannel: number;
  colorBlueChannel: number;
  colorColdWhiteChannel?: number;
  colorWarmWhiteChannel?: number;
  colorAmberChannel?: number;
  colorUvChannel?: number;
}

export interface ShutterOptionValues {
  open: number;
  strobe: number;
}

export interface LightsFixtureParams extends Pick<LightsFixture, 'name' | 'nrChannels'> {
  shutterOptionValues?: ShutterOptionValues;
}

export interface LightsParCreateParams extends LightsFixtureParams, ColorParams {}

export interface LightsMovingHeadParams extends LightsFixtureParams {
  panChannel: number;
  finePanChannel?: number;
  tiltChannel: number;
  fineTiltChannel?: number;
  movingSpeedChannel?: number;
  basePanValue?: number;
  panMirrored?: boolean;
  tiltMirrored?: boolean;
}

export interface LightsMovingHeadRgbCreateParams extends LightsMovingHeadParams, ColorParams {}

export interface LightsMovingHeadWheelCreateParams extends LightsMovingHeadParams {
  masterDimChannel: number;
  shutterChannel?: number;
  colorWheelChannel: number;
  colorWheelChannelValues: {
    name: string;
    value: number;
  }[];
  goboWheelChannel: number;
  goboWheelChannelValues: {
    name: string;
    value: number;
  }[];
  goboRotateChannel?: number;
  goboRotateChannelValues: {
    name: string;
    value: number;
  }[];
}

export interface LightsInGroup {
  fixtureId: number;
  /**
   * @isInt
   * @minimum 0
   */
  firstChannel: number;
  /**
   * Position of the fixture within the group's grid/line
   * @isFloat
   * @minimum 0
   */
  positionX: number;
  /**
   * Position of the fixture within the group's grid.
   * Should be undefined if the group is a line of fixtures
   * (and not a grid).
   * @isFloat
   * @minimum 0
   */
  positionY?: number;
}

export interface LightsGroupCreateParams extends Pick<
  LightsGroup,
  'name' | 'defaultHandler' | 'groupInMiddle'
> {
  /**
   * Size (width) of the X axis where all the fixtures are positioned.
   * All fixtures should have their positionX be in range [0, gridSizeX).
   * @isFloat
   * @minimum 0
   */
  gridSizeX: number;

  /**
   * Size (width) of the Y axis where all the fixtures are positioned.
   * 0 if the lights are positioned in a line (and not in a grid)
   * @isFloat
   * @minimum 0
   */
  gridSizeY?: number;
  pars: LightsInGroup[];
  movingHeadRgbs: LightsInGroup[];
  movingHeadWheels: LightsInGroup[];
}

export interface LightsSwitchCreateParams extends Pick<
  LightsSwitch,
  'name' | 'dmxChannel' | 'onValue'
> {}

export interface LightsControllerCreateParams extends Pick<LightsController, 'name'> {}

export default class RootLightsService {
  private controllerRepository: Repository<LightsController>;

  private groupRepository: Repository<LightsGroup>;

  constructor() {
    this.controllerRepository = dataSource.getRepository(LightsController);
    this.groupRepository = dataSource.getRepository(LightsGroup);
  }

  private static toColorResponse(c: ColorsRgb, firstChannel: number): ColorResponse {
    return {
      masterDimChannel: c.masterDimChannel ? c.masterDimChannel + firstChannel - 1 : undefined,
      shutterChannel: c.shutterChannel ? c.shutterChannel + firstChannel - 1 : undefined,
      redChannel: c.redChannel + firstChannel - 1,
      blueChannel: c.blueChannel + firstChannel - 1,
      greenChannel: c.greenChannel + firstChannel - 1,
      coldWhiteChannel: c.coldWhiteChannel ? c.coldWhiteChannel + firstChannel - 1 : null,
      warmWhiteChannel: c.warmWhiteChannel ? c.warmWhiteChannel + firstChannel - 1 : null,
      amberChannel: c.amberChannel ? c.amberChannel + firstChannel - 1 : null,
      uvChannel: c.uvChannel ? c.uvChannel + firstChannel - 1 : null,
    };
  }

  private static toMovementResponse(m: Movement, firstChannel: number): IMovement {
    return {
      tiltChannel: m.tiltChannel + firstChannel - 1,
      fineTiltChannel: m.fineTiltChannel ? m.fineTiltChannel + firstChannel - 1 : null,
      panChannel: m.panChannel + firstChannel - 1,
      finePanChannel: m.finePanChannel ? m.finePanChannel + firstChannel - 1 : null,
      movingSpeedChannel: m.movingSpeedChannel ? m.movingSpeedChannel + firstChannel - 1 : null,
    };
  }

  private static toFixtureResponse(f: LightsFixture, firstChannel: number): LightsFixtureResponse {
    const canReset = f.resetChannelAndValue != null && f.resetChannelAndValue.length === 2;

    return {
      id: f.id,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      name: f.name,
      nrChannels: f.nrChannels,
      shutterChannelValues: {},
      canReset,
      resetChannel: canReset ? f.resetChannelAndValue![0] + firstChannel - 1 : undefined,
      resetChannelValue: canReset ? f.resetChannelAndValue![1] : undefined,
    };
  }

  private static toMovingHeadResponse(
    m: LightsMovingHead,
    firstChannel: number,
  ): MovingHeadResponse {
    return {
      ...this.toFixtureResponse(m, firstChannel),
      ...this.toMovementResponse(m.movement, firstChannel),
    };
  }

  private static getShutterChannelsResponse(
    shutterOptions: LightsFixtureShutterOptions[],
  ): ShutterChannelValuesResponse {
    const shutterOpen = shutterOptions.find((o) => o.shutterOption === ShutterOption.OPEN);
    const shutterStrobe = shutterOptions.find((o) => o.shutterOption === ShutterOption.STROBE);

    return {
      open: shutterOpen?.channelValue,
      strobe: shutterStrobe?.channelValue,
    };
  }

  public static toParResponse(p: LightsPar, firstChannel = 1): ParResponse {
    return {
      ...this.toFixtureResponse(p, firstChannel),
      ...this.toColorResponse(p.color, firstChannel),
      shutterChannelValues: this.getShutterChannelsResponse(p.shutterOptions),
    };
  }

  public static toMovingHeadRgbResponse(
    m: LightsMovingHeadRgb,
    firstChannel = 1,
  ): MovingHeadRgbResponse {
    return {
      ...this.toMovingHeadResponse(m, firstChannel),
      ...this.toColorResponse(m.color, firstChannel),
      shutterChannelValues: this.getShutterChannelsResponse(m.shutterOptions),
    };
  }

  public static toMovingHeadWheelResponse(
    m: LightsMovingHeadWheel,
    firstChannel = 1,
  ): MovingHeadWheelResponse {
    return {
      ...this.toMovingHeadResponse(m, firstChannel),
      masterDimChannel: m.wheel.masterDimChannel,
      shutterChannel: m.wheel.shutterChannel,
      wheelColorChannel: m.wheel.colorChannel + firstChannel - 1,
      wheelColorChannelValues: m.wheel.colorChannelValues.map((x) => ({
        color: x.name,
        channelValue: x.value,
      })),
      wheelGoboChannel: m.wheel.goboChannel + firstChannel - 1,
      wheelGoboRotateChannel: m.wheel.goboRotateChannel
        ? m.wheel.goboRotateChannel + firstChannel - 1
        : null,
      gobos: m.wheel.goboChannelValues.map((v) => v.name),
      goboRotates: m.wheel.goboRotateChannelValues.map((v) => v.name),
      shutterChannelValues: this.getShutterChannelsResponse(m.shutterOptions),
    };
  }

  public static toLightsGroupResponse(g: LightsGroup): LightsGroupResponse {
    return {
      id: g.id,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      name: g.name,
      gridSizeX: g.gridSizeX,
      gridSizeY: g.gridSizeY,
      controller: this.toLightsControllerResponse(g.controller),
      pars: g.pars.map((p) => ({
        fixture: this.toParResponse(p.fixture, p.firstChannel),
        id: p.id,
        firstChannel: p.firstChannel,
        positionX: p.positionX,
        positionY: p.positionY,
        masterDimmer: p.masterRelativeBrightness,
      })),
      movingHeadRgbs: g.movingHeadRgbs.map((m) => ({
        fixture: this.toMovingHeadRgbResponse(m.fixture, m.firstChannel),
        id: m.id,
        firstChannel: m.firstChannel,
        positionX: m.positionX,
        positionY: m.positionY,
        masterDimmer: m.masterRelativeBrightness,
      })),
      movingHeadWheels: g.movingHeadWheels.map((m) => ({
        fixture: this.toMovingHeadWheelResponse(m.fixture, m.firstChannel),
        id: m.id,
        firstChannel: m.firstChannel,
        positionX: m.positionX,
        positionY: m.positionY,
        masterDimmer: m.masterRelativeBrightness,
      })),
    };
  }

  public static toLightsControllerResponse(c: LightsController): LightsControllerResponse {
    return {
      id: c.id,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      name: c.name,
      socketIds: c.socketIds,
    };
  }

  public static toLightsSwitchResponse(s: LightsSwitch): LightsSwitchResponse {
    return {
      id: s.id,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      name: s.name,
      dmxChannel: s.dmxChannel,
      onValue: s.onValue,
    };
  }

  public async getAllControllers(): Promise<LightsController[]> {
    return this.controllerRepository.find();
  }

  public async getSingleController(id: number): Promise<LightsController | null> {
    return this.controllerRepository.findOne({ where: { id } });
  }

  public async createController(params: LightsControllerCreateParams): Promise<LightsController> {
    const lightsController = await this.controllerRepository.save({
      name: params.name,
    });
    await new AuthService().createApiKey({ lightsController });
    return lightsController;
  }

  public async getAllLightsGroups(): Promise<LightsGroup[]> {
    return this.groupRepository.find();
  }

  public async getSingleLightsGroup(id: number): Promise<LightsGroup | null> {
    return this.groupRepository.findOne({ where: { id } });
  }

  public async createLightGroup(
    controllerId: number,
    params: LightsGroupCreateParams,
  ): Promise<LightsGroup | null> {
    const controller = await this.controllerRepository.findOne({ where: { id: controllerId } });
    if (controller == null) return null;

    return dataSource.transaction(async (manager) => {
      const group = (await manager.save(LightsGroup, {
        name: params.name,
        defaultHandler: params.defaultHandler,
        groupInMiddle: params.groupInMiddle,
        controller,
        gridSizeX: params.gridSizeX,
        gridSizeY: params.gridSizeY,
      })) as LightsGroup;

      await Promise.all(
        params.pars.map(async (p) => {
          const par = await manager.findOne(LightsPar, { where: { id: p.fixtureId } });
          if (par == null) throw new Error(`LightsPar with ID ${p.fixtureId} not found!`);
          await manager.save(LightsGroupPars, {
            group,
            fixture: par,
            firstChannel: p.firstChannel,
            positionX: p.positionX,
            positionY: p.positionY,
          });
        }),
      );

      await Promise.all(
        params.movingHeadRgbs.map(async (p) => {
          const movingHead = await manager.findOne(LightsMovingHeadRgb, {
            where: { id: p.fixtureId },
          });
          if (movingHead == null)
            throw new Error(`LightsMovingHeadRgb with ID ${p.fixtureId} not found!`);
          await manager.save(LightsGroupMovingHeadRgbs, {
            group,
            fixture: movingHead,
            firstChannel: p.firstChannel,
            positionX: p.positionX,
            positionY: p.positionY,
          });
        }),
      );

      await Promise.all(
        params.movingHeadWheels.map(async (p) => {
          const movingHead = await manager.findOne(LightsMovingHeadWheel, {
            where: { id: p.fixtureId },
          });
          if (movingHead == null)
            throw new Error(`LightsMovingHeadWheel with ID ${p.fixtureId} not found!`);
          await manager.save(LightsGroupMovingHeadWheels, {
            group,
            fixture: movingHead,
            firstChannel: p.firstChannel,
            positionX: p.positionX,
            positionY: p.positionY,
          });
        }),
      );

      return group;
    });
  }

  public async getLightsGroupPar(id: number): Promise<LightsGroupPars | null> {
    const repository = dataSource.getRepository(LightsGroupPars);
    return repository.findOne({ where: { id } });
  }

  public async getLightsGroupMovingHeadRgb(id: number): Promise<LightsGroupMovingHeadRgbs | null> {
    const repository = dataSource.getRepository(LightsGroupMovingHeadRgbs);
    return repository.findOne({ where: { id } });
  }

  public async getLightsGroupMovingHeadWheel(
    id: number,
  ): Promise<LightsGroupMovingHeadWheels | null> {
    const repository = dataSource.getRepository(LightsGroupMovingHeadWheels);
    return repository.findOne({ where: { id } });
  }

  private toFixture(params: LightsFixtureParams): LightsFixture {
    return {
      name: params.name,
      nrChannels: params.nrChannels,
    } as LightsFixture;
  }

  private toColorRgb(params: ColorParams): IColorsRgb {
    return {
      redChannel: params.colorRedChannel,
      blueChannel: params.colorBlueChannel,
      greenChannel: params.colorGreenChannel,
      coldWhiteChannel: params.colorColdWhiteChannel,
      warmWhiteChannel: params.colorWarmWhiteChannel,
      amberChannel: params.colorAmberChannel,
      uvChannel: params.colorUvChannel,
    };
  }

  private toMovement(params: LightsMovingHeadParams): Movement {
    return {
      panChannel: params.panChannel,
      finePanChannel: params.finePanChannel,
      tiltChannel: params.tiltChannel,
      fineTiltChannel: params.fineTiltChannel,
      movingSpeedChannel: params.movingSpeedChannel,
      basePanValue: params.basePanValue ?? 0,
      mirrorPan: params.panMirrored,
      mirrorTilt: params.tiltMirrored,
    } as Movement;
  }

  private toWheel(params: LightsMovingHeadWheelCreateParams) {
    return {
      masterDimChannel: params.masterDimChannel,
      shutterChannel: params.shutterOptionValues ? params.shutterChannel : undefined,
      colorChannel: params.colorWheelChannel,
      goboChannel: params.goboWheelChannel,
      goboRotateChannel: params.goboRotateChannel ?? null,
    };
  }

  public async getAllLightsPars(): Promise<LightsPar[]> {
    return dataSource.getRepository(LightsPar).find();
  }

  public async getAllMovingHeadRgbs(): Promise<LightsMovingHeadRgb[]> {
    return dataSource.getRepository(LightsMovingHeadRgb).find();
  }

  public async getAllMovingHeadWheels(): Promise<LightsMovingHeadWheel[]> {
    return dataSource.getRepository(LightsMovingHeadWheel).find();
  }

  public async createFixtureShutterOptions(
    repo: Repository<
      | LightsParShutterOptions
      | LightsMovingHeadRgbShutterOptions
      | LightsMovingHeadWheelShutterOptions
    >,
    fixture: LightsFixture,
    params: ShutterOptionValues | undefined,
  ): Promise<LightsFixtureShutterOptions[]> {
    if (!params) return [];
    return Promise.all([
      repo.save({
        fixtureId: fixture.id,
        shutterOption: ShutterOption.OPEN,
        channelValue: params.open,
      }),
      repo.save({
        fixtureId: fixture.id,
        shutterOption: ShutterOption.STROBE,
        channelValue: params.strobe,
      }),
    ]);
  }

  private persistWheelChannelValues(
    repo: Repository<any>,
    movingHead: LightsMovingHeadWheel,
    params: Array<{ name: string; value: number }> | undefined,
  ) {
    if (!params?.length) return Promise.resolve([]);
    return repo.save(params.map((v) => ({ ...v, movingHead })));
  }

  public async createLightsPar(params: LightsParCreateParams): Promise<LightsPar> {
    const repository = dataSource.getRepository(LightsPar);
    const par = await repository.save({
      ...this.toFixture(params),
      color: {
        ...this.toColorRgb(params),
        masterDimChannel: params.masterDimChannel,
        shutterChannel: params.shutterOptionValues ? params.shutterChannel : undefined,
      },
    });
    par.shutterOptions = (await this.createFixtureShutterOptions(
      dataSource.getRepository(LightsParShutterOptions),
      par,
      params.shutterOptionValues,
    )) as LightsParShutterOptions[];
    return par;
  }

  public async createMovingHeadRgb(
    params: LightsMovingHeadRgbCreateParams,
  ): Promise<LightsMovingHeadRgb> {
    const repository = dataSource.getRepository(LightsMovingHeadRgb);
    const movingHead = await repository.save({
      ...this.toFixture(params),
      movement: this.toMovement(params),
      color: {
        ...this.toColorRgb(params),
        masterDimChannel: params.masterDimChannel,
        shutterChannel: params.shutterOptionValues ? params.shutterChannel : undefined,
      },
    });
    movingHead.shutterOptions = (await this.createFixtureShutterOptions(
      dataSource.getRepository(LightsMovingHeadRgbShutterOptions),
      movingHead,
      params.shutterOptionValues,
    )) as LightsMovingHeadRgbShutterOptions[];
    return movingHead;
  }

  public async createMovingHeadWheel(
    params: LightsMovingHeadWheelCreateParams,
  ): Promise<LightsMovingHeadWheel> {
    const movingHead = await dataSource.getRepository(LightsMovingHeadWheel).save({
      ...this.toFixture(params),
      movement: this.toMovement(params),
      wheel: this.toWheel(params),
    });
    return this.populateMovingHeadWheelChildren(movingHead, params);
  }

  private async populateMovingHeadWheelChildren(
    movingHead: LightsMovingHeadWheel,
    params: LightsMovingHeadWheelCreateParams,
  ): Promise<LightsMovingHeadWheel> {
    // save() does not populate the wheel's eager child relations, and the
    // response mapper reads them straight off the in-memory entity. Persist
    // each child collection in parallel and attach the saved rows.
    const [shutterOptions, colorValues, goboValues, goboRotateValues] = await Promise.all([
      this.createFixtureShutterOptions(
        dataSource.getRepository(LightsMovingHeadWheelShutterOptions),
        movingHead,
        params.shutterOptionValues,
      ),
      this.persistWheelChannelValues(
        dataSource.getRepository(LightsWheelColorChannelValue),
        movingHead,
        params.colorWheelChannelValues,
      ),
      this.persistWheelChannelValues(
        dataSource.getRepository(LightsWheelGoboChannelValue),
        movingHead,
        params.goboWheelChannelValues,
      ),
      this.persistWheelChannelValues(
        dataSource.getRepository(LightsWheelRotateChannelValue),
        movingHead,
        params.goboRotateChannelValues,
      ),
    ]);
    movingHead.shutterOptions = shutterOptions as LightsMovingHeadWheelShutterOptions[];
    movingHead.wheel.colorChannelValues = colorValues;
    movingHead.wheel.goboChannelValues = goboValues;
    movingHead.wheel.goboRotateChannelValues = goboRotateValues;
    return movingHead;
  }

  public async getAllLightsSwitches(
    controllerId?: number,
    enabled?: boolean,
  ): Promise<LightsSwitch[]> {
    let whereClause: FindOptionsWhere<LightsSwitch> = {};
    if (controllerId) {
      whereClause = { controller: { id: controllerId } };
    }

    let switches = await dataSource.getRepository(LightsSwitch).find({ where: whereClause });
    if (enabled != null) {
      const manager = LightsSwitchManager.getInstance();
      switches = switches.filter((s) => {
        const isEnabled = manager.switchEnabled(s);
        if (enabled && isEnabled) return true;
        if (!enabled && !isEnabled) return true;
        return false;
      });
    }

    return switches;
  }

  public async createLightsSwitch(
    controllerId: number,
    params: LightsSwitchCreateParams,
  ): Promise<LightsSwitch | null> {
    const controller = await this.controllerRepository.findOne({ where: { id: controllerId } });
    if (controller == null) return null;

    const repository = dataSource.getRepository(LightsSwitch);
    return repository.save({
      controller,
      ...params,
    });
  }
}
