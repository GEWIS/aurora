import { Body, Get, Post, Query, Request, Route, Tags } from 'tsoa';
import { Controller } from '@tsoa/runtime';
import RootLightsService, {
  LightsControllerCreateParams,
  LightsControllerResponse,
  LightsGroupCreateParams,
  LightsGroupResponse,
  LightsMovingHeadRgbCreateParams,
  LightsMovingHeadWheelCreateParams,
  LightsParCreateParams,
  LightsSwitchCreateParams,
  LightsSwitchResponse,
  MovingHeadRgbResponse,
  MovingHeadWheelResponse,
  ParResponse,
} from './root-lights-service';
import { LIGHTS_EFFECTS } from '../lights/effects';
import {
  RgbColor,
  rgbColorDefinitions,
  rgbColors,
  RgbColorSpecification,
} from '../lights/color-definitions';
import { SecurityGroup, SecurityNames } from '../../helpers/security';
import { securityGroups } from '../../helpers/security-groups';
import { Request as ExpressRequest } from 'express';
import { Security } from '../auth';

interface LightsColorResponse {
  color: RgbColor;
  spec: RgbColorSpecification;
}

@Route('lights')
@Tags('Lights')
export class RootLightsController extends Controller {
  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('controller')
  public async getLightsControllers(): Promise<LightsControllerResponse[]> {
    const controllers = await new RootLightsService().getAllControllers();
    return controllers.map((c) => RootLightsService.toLightsControllerResponse(c));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('controller/{id}')
  public async getSingleLightsController(
    id: number,
  ): Promise<LightsControllerResponse | undefined> {
    const controller = await new RootLightsService().getSingleController(id);
    if (!controller) {
      this.setStatus(404);
      return undefined;
    }
    return RootLightsService.toLightsControllerResponse(controller);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('controller')
  public async createLightsController(
    @Body() params: LightsControllerCreateParams,
  ): Promise<LightsControllerResponse> {
    return new RootLightsService().createController(params);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('switch')
  public async getAllLightsSwitches(@Query() enabled?: boolean): Promise<LightsSwitchResponse[]> {
    const switches = await new RootLightsService().getAllLightsSwitches(undefined, enabled);
    return switches.map((s) => RootLightsService.toLightsSwitchResponse(s));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('group')
  public async getLightsGroups(): Promise<LightsGroupResponse[]> {
    const groups = await new RootLightsService().getAllLightsGroups();
    return groups.map((g) => RootLightsService.toLightsGroupResponse(g));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('group/{id}')
  public async getSingleLightsGroup(id: number): Promise<LightsGroupResponse | undefined> {
    const group = await new RootLightsService().getSingleLightsGroup(id);
    if (!group) {
      this.setStatus(404);
      return undefined;
    }
    return RootLightsService.toLightsGroupResponse(group);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.subscriber)
  @Get('controller/{id}/groups')
  public async getControllerLightsGroups(
    @Request() req: ExpressRequest,
    id: number,
  ): Promise<LightsGroupResponse[] | undefined> {
    if (
      !req.user ||
      (!req.user.roles.includes(SecurityGroup.ADMIN) && req.user.lightsControllerId !== id)
    ) {
      this.setStatus(403);
      return undefined;
    }

    const groups = await new RootLightsService().getAllLightsGroups();
    const controllerGroups = groups.filter((g) => g.controller.id === id);

    return controllerGroups.map((g) => RootLightsService.toLightsGroupResponse(g));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('controller/{id}/group')
  public async createLightsGroup(
    id: number,
    @Body() params: LightsGroupCreateParams,
  ): Promise<LightsGroupResponse | undefined> {
    const group = await new RootLightsService().createLightGroup(id, params);
    if (!group) {
      this.setStatus(404);
      return undefined;
    }
    return RootLightsService.toLightsGroupResponse(group);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.subscriber)
  @Get('controller/{id}/switches')
  public async getControllerLightsSwitches(
    @Request() req: ExpressRequest,
    id: number,
  ): Promise<LightsSwitchResponse[] | undefined> {
    if (
      !req.user ||
      (!req.user.roles.includes(SecurityGroup.ADMIN) && req.user.lightsControllerId !== id)
    ) {
      this.setStatus(403);
      return undefined;
    }

    const switches = await new RootLightsService().getAllLightsSwitches(id);
    return switches.map((s) => RootLightsService.toLightsSwitchResponse(s));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('controller/{id}/switches')
  public async createLightsSwitch(
    id: number,
    @Body() params: LightsSwitchCreateParams,
  ): Promise<LightsSwitchResponse | undefined> {
    const lightsSwitch = await new RootLightsService().createLightsSwitch(id, params);
    if (!lightsSwitch) {
      this.setStatus(404);
      return undefined;
    }
    return RootLightsService.toLightsSwitchResponse(lightsSwitch);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Get('fixture/par')
  public async getAllLightsPars(): Promise<ParResponse[]> {
    const pars = await new RootLightsService().getAllLightsPars();
    return pars.map((p) => RootLightsService.toParResponse(p));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('fixture/par')
  public async createLightsPar(@Body() params: LightsParCreateParams): Promise<ParResponse> {
    const par = await new RootLightsService().createLightsPar(params);
    return RootLightsService.toParResponse(par);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Get('fixture/moving-head/rgb')
  public async getAllLightsMovingHeadsRgb(): Promise<MovingHeadRgbResponse[]> {
    const movingHeads = await new RootLightsService().getAllMovingHeadRgbs();
    return movingHeads.map((m) => RootLightsService.toMovingHeadRgbResponse(m));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('fixture/moving-head/rgb')
  public async createLightsMovingHeadRgb(
    @Body() params: LightsMovingHeadRgbCreateParams,
  ): Promise<MovingHeadRgbResponse> {
    const movingHead = await new RootLightsService().createMovingHeadRgb(params);
    return RootLightsService.toMovingHeadRgbResponse(movingHead);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Get('fixture/moving-head/wheel')
  public async getAllLightsMovingHeadsWheel(): Promise<MovingHeadWheelResponse[]> {
    const movingHeads = await new RootLightsService().getAllMovingHeadWheels();
    return movingHeads.map((m) => RootLightsService.toMovingHeadWheelResponse(m));
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.privileged)
  @Post('fixture/moving-head/wheel')
  public async createLightsMovingHeadWheel(
    @Body() params: LightsMovingHeadWheelCreateParams,
  ): Promise<MovingHeadWheelResponse> {
    const movingHead = await new RootLightsService().createMovingHeadWheel(params);
    return RootLightsService.toMovingHeadWheelResponse(movingHead);
  }

  @Security(SecurityNames.LOCAL, securityGroups.light.base)
  @Get('effects')
  public getAllLightsEffects() {
    return LIGHTS_EFFECTS.map((e) => e.name);
  }

  @Security(SecurityNames.LOCAL, securityGroups.color.base)
  @Security(SecurityNames.INTEGRATION, ['getAllLightsColors'])
  @Get('colors')
  public getAllLightsColors(): LightsColorResponse[] {
    return rgbColors.map(
      (color: RgbColor): LightsColorResponse => ({
        color,
        spec: rgbColorDefinitions[color],
      }),
    );
  }
}
