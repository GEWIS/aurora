import { Body, Delete, Post, Request, Res, Route, Security, Tags } from 'tsoa';
import { Controller, TsoaResponse } from '@tsoa/runtime';
import { Request as ExpressRequest } from 'express';
import HandlerManager from './handler-manager';
import {
  LightsGroup,
  LightsGroupMovingHeadRgbs,
  LightsGroupMovingHeadWheels,
  LightsGroupPars,
  LightsSwitch,
} from '../lights/entities';
import { StrobeProps } from '../lights/effects/color/strobe';
import { SecurityNames } from '../../helpers/security';
import logger from '../../logger';
import { securityGroups } from '../../helpers/security-groups';
import dataSource from '../../database';
import LightsSwitchManager from './lights-switch-manager';
import { HttpStatusCode } from 'axios';
import RootLightsOperationsService from './root-lights-operations-service';
import { DEFAULT_MASTER_DIMMER } from '../lights/entities/lights-group-fixture';

interface GroupFixtureOverrideParams {
  /**
   * Slice of DMX channel values that should be send to the fixture.
   * The first value will be put on CH1, the second on CH2, the third on CH3, etc.
   * Use "null" to indicate the channel should not be overriden.
   */
  dmxValues: (number | null)[];
}

interface GroupFixtureDimmingParams {
  /**
   * Relative brightness of the fixture(s). Value in range [0, 1]
   * @minimum 0
   * @maximum 1
   */
  relativeBrightness: number;
}

@Route('lights')
@Tags('Lights')
export class RootLightsOperationsController extends Controller {
  private getGroups(): LightsGroup[] {
    return new RootLightsOperationsService().getGroups();
  }

  private async getLightsSwitch(id: number): Promise<LightsSwitch | null> {
    return dataSource.getRepository(LightsSwitch).findOne({ where: { id } });
  }

  /**
   * Enable the strobe for all fixtures in the given group
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/{id}/strobe/enable')
  public async enableStrobeOnLightsGroup(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: StrobeProps = {},
  ) {
    const lightsGroup = this.getGroups().find((g) => g.id === id);
    if (!lightsGroup) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Enable lights strobe for group "${lightsGroup.name}" (id: ${id}).`);

    lightsGroup.enableStrobe(params?.durationMs);
  }

  /**
   * Disable the strobe for all fixtures in the given group
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/{id}/strobe/disable')
  public async disableStrobeOnLightsGroup(@Request() req: ExpressRequest, id: number) {
    const lightsGroup = this.getGroups().find((g) => g.id === id);
    if (!lightsGroup) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Disable lights strobe for group "${lightsGroup.name}" (id: ${id}).`);

    lightsGroup.disableStrobe();
  }

  /**
   * Store the next state of all fixtures in the given LightsGroup and do not change them anymore
   * (i.e. freeze the fixture in its current state)
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/{id}/freeze')
  public async freezeLightsGroup(@Request() req: ExpressRequest, id: number) {
    const group = this.getGroups().find((g) => g.id === id);
    if (group === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Freeze lights group "${group.name}" (id: ${id}).`);

    group.fixtures.forEach((f) => f.fixture.freezeDmx());
  }

  /**
   * Unfreeze the DMX values
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/{id}/unfreeze')
  public async unfreezeLightsGroup(@Request() req: ExpressRequest, id: number) {
    const group = this.getGroups().find((g) => g.id === id);
    if (group === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Unfreeze lights group "${group.name}" (id: ${id}).`);

    group.fixtures.forEach((f) => f.fixture.unfreezeDmx());
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/{id}/dimmer')
  public async setLightsGroupMasterDimmer(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: GroupFixtureDimmingParams,
    @Res() notFoundResponse: TsoaResponse<HttpStatusCode.NotFound, { message: string }>,
  ) {
    const dbLightsGroup = await dataSource.getRepository(LightsGroup).findOne({
      where: { id },
      relations: { pars: true, movingHeadRgbs: true, movingHeadWheels: true },
    });
    if (!dbLightsGroup) {
      return notFoundResponse(HttpStatusCode.NotFound, { message: 'Lights group not found' });
    }

    const masterRelativeBrightness = params.relativeBrightness;

    logger.audit(
      req.user,
      `Set lights group "${dbLightsGroup.name}" (id: ${id}) relative brightness to ${masterRelativeBrightness}.`,
    );

    await new RootLightsOperationsService().applyLightsGroupRelativeBrightness(
      id,
      masterRelativeBrightness,
    );
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Delete('group/{id}/dimmer')
  public async clearLightsGroupMasterDimmer(
    @Request() req: ExpressRequest,
    id: number,
    @Res() notFoundResponse: TsoaResponse<HttpStatusCode.NotFound, { message: string }>,
  ) {
    const dbLightsGroup = await dataSource.getRepository(LightsGroup).findOne({
      where: { id },
      relations: { pars: true, movingHeadRgbs: true, movingHeadWheels: true },
    });
    if (!dbLightsGroup) {
      return notFoundResponse(HttpStatusCode.NotFound, { message: 'Lights group not found' });
    }

    logger.audit(
      req.user,
      `Reset lights group "${dbLightsGroup.name}" (id: ${id}) relative brightness to default.`,
    );

    await new RootLightsOperationsService().resetLightsGroupRelativeBrightness(id);
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/par/{id}/override')
  public async setGroupParOverride(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: GroupFixtureOverrideParams,
  ) {
    const pars = this.getGroups()
      .map((g) => g.pars)
      .flat();
    const chosenPar = pars.find((p) => p.id === id);
    if (chosenPar === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Override DMX for lights par "${chosenPar.fixture.name}" (id: ${id}).`);

    chosenPar.fixture.setOverrideDmx(params.dmxValues);
  }

  /**
   * Perform the fixture's internal reset operation if possible. Do nothing otherwise
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/par/{id}/reset')
  public async resetGroupPar(@Request() req: ExpressRequest, id: number) {
    const pars = this.getGroups()
      .map((g) => g.pars)
      .flat();
    const chosenPar = pars.find((p) => p.id === id);
    if (chosenPar === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Reset lights par "${chosenPar.fixture.name}" (id: ${id}).`);

    const success = chosenPar.fixture.hardwareReset();
    if (!success) {
      this.setStatus(422);
    }
  }

  /**
   * Store the next state of the fixture and do not change anymore
   * (i.e. freeze the fixture in its current state)
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/par/{id}/freeze')
  public async freezeGroupPar(@Request() req: ExpressRequest, id: number) {
    const pars = this.getGroups()
      .map((g) => g.pars)
      .flat();
    const chosenPar = pars.find((p) => p.id === id);
    if (chosenPar === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Freeze lights par "${chosenPar.fixture.name}" (id: ${id}).`);

    chosenPar.fixture.freezeDmx();
  }

  /**
   * Unfreeze the DMX values
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/par/{id}/unfreeze')
  public async unfreezeGroupPar(@Request() req: ExpressRequest, id: number) {
    const pars = this.getGroups()
      .map((g) => g.pars)
      .flat();
    const chosenPar = pars.find((p) => p.id === id);
    if (chosenPar === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Unfreeze lights par "${chosenPar.fixture.name}" (id: ${id}).`);

    chosenPar.fixture.unfreezeDmx();
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-rgb/{id}/override')
  public async setGroupMovingHeadRgbOverride(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: GroupFixtureOverrideParams,
  ) {
    const movingHeadRgbs = this.getGroups()
      .map((g) => g.movingHeadRgbs)
      .flat();
    const chosenMovingHead = movingHeadRgbs.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Override DMX for moving head RGB "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.setOverrideDmx(params.dmxValues);
  }

  /**
   * Perform the fixture's internal reset operation if possible. Do nothing otherwise
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-rgb/{id}/reset')
  public async resetGroupMovingHeadRgb(@Request() req: ExpressRequest, id: number) {
    const movingHeadRgbs = this.getGroups()
      .map((g) => g.movingHeadRgbs)
      .flat();
    const chosenMovingHead = movingHeadRgbs.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(req.user, `Reset moving head RGB "${chosenMovingHead.fixture.name}" (id: ${id}).`);

    const success = chosenMovingHead.fixture.hardwareReset();
    if (!success) {
      this.setStatus(422);
    }
  }

  /**
   * Store the next state of the fixture and do not change anymore
   * (i.e. freeze the fixture in its current state)
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-rgb/{id}/freeze')
  public async freezeGroupMovingHeadRgb(@Request() req: ExpressRequest, id: number) {
    const movingHead = this.getGroups()
      .map((g) => g.movingHeadRgbs)
      .flat();
    const chosenMovingHead = movingHead.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Freeze moving head RGB "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.freezeDmx();
  }

  /**
   * Unfreeze the DMX values
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-rgb/{id}/unfreeze')
  public async unfreezeMovingHeadRgb(@Request() req: ExpressRequest, id: number) {
    const pars = this.getGroups()
      .map((g) => g.movingHeadRgbs)
      .flat();
    const chosenMovingHead = pars.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Unfreeze moving head RGB "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.unfreezeDmx();
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-wheel/{id}/override')
  public async setGroupMovingHeadWheelOverride(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: GroupFixtureOverrideParams,
  ) {
    const movingHeadWheels = this.getGroups()
      .map((g) => g.movingHeadWheels)
      .flat();
    const chosenMovingHead = movingHeadWheels.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Override DMX for moving head wheel "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.setOverrideDmx(params.dmxValues);
  }

  /**
   * Perform the fixture's internal reset operation if possible. Do nothing otherwise
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-wheel/{id}/reset')
  public async resetGroupMovingHeadWheel(@Request() req: ExpressRequest, id: number) {
    const movingHeadWheels = this.getGroups()
      .map((g) => g.movingHeadWheels)
      .flat();
    const chosenMovingHead = movingHeadWheels.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Reset moving head wheel "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    const success = chosenMovingHead.fixture.hardwareReset();
    if (!success) {
      this.setStatus(422);
    }
  }

  /**
   * Store the next state of the fixture and do not change anymore
   * (i.e. freeze the fixture in its current state)
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-wheel/{id}/freeze')
  public async freezeGroupMovingHeadWheel(@Request() req: ExpressRequest, id: number) {
    const movingHead = this.getGroups()
      .map((g) => g.movingHeadRgbs)
      .flat();
    const chosenMovingHead = movingHead.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Freeze moving head wheel "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.freezeDmx();
  }

  /**
   * Unfreeze the DMX values
   */
  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('group/moving-head-wheel/{id}/unfreeze')
  public async unfreezeMovingHeadWheel(@Request() req: ExpressRequest, id: number) {
    const pars = this.getGroups()
      .map((g) => g.movingHeadWheels)
      .flat();
    const chosenMovingHead = pars.find((p) => p.id === id);
    if (chosenMovingHead === undefined) {
      this.setStatus(404);
      return;
    }

    logger.audit(
      req.user,
      `Unfreeze moving head wheel "${chosenMovingHead.fixture.name}" (id: ${id}).`,
    );

    chosenMovingHead.fixture.unfreezeDmx();
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('switch/{id}/on')
  public async turnOnLightsSwitch(@Request() req: ExpressRequest, id: number): Promise<void> {
    const lightsSwitch = await this.getLightsSwitch(id);
    if (!lightsSwitch) {
      this.setStatus(404);
      return;
    }

    LightsSwitchManager.getInstance().enableSwitch(lightsSwitch);

    logger.audit(req.user, `Turn on lights switch "${lightsSwitch.name}"`);
  }

  @Security(SecurityNames.LOCAL, securityGroups.lightOperation.base)
  @Post('switch/{id}/off')
  public async turnOffLightsSwitch(@Request() req: ExpressRequest, id: number): Promise<void> {
    const lightsSwitch = await this.getLightsSwitch(id);
    if (!lightsSwitch) {
      this.setStatus(404);
      return;
    }

    LightsSwitchManager.getInstance().disableSwitch(lightsSwitch);

    logger.audit(req.user, `Turn off lights switch "${lightsSwitch.name}"`);
  }
}
