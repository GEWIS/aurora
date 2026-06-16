import { Controller, Patch, TsoaResponse } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Request, Res, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import SetEffectsHandler from './set-effects-handler';
import HandlerManager from '../../root/handler-manager';
import { LightsGroup } from '../../lights/entities';
import { SecurityNames } from '../../../helpers/security';
import { LightsEffectsColorCreateParams } from '../../lights/effects/color';
import { LightsEffectsMovementCreateParams } from '../../lights/effects/movement';
import logger from '../../../logger';
import { securityGroups } from '../../../helpers/security-groups';
import SetEffectsService, {
  LightsPredefinedEffectCreateParams,
  LightsPredefinedEffectResponse,
  LightsPredefinedEffectUpdateParams,
} from './set-effects-service';
import { RgbColor } from '../../lights/color-definitions';
import { HttpStatusCode } from 'axios';

interface ColorsRequest {
  colors: RgbColor[];
}

@Route('handler/lights/set-effects')
@Tags('Handlers')
export class SetEffectsController extends Controller {
  /**
   * Given a list of color effects to create, add the given effects to the lightsgroup with the
   * given ID. Remove all color effects if an empty array is given
   * @param id
   * @param req
   * @param effects
   */
  @Security(SecurityNames.LOCAL, securityGroups.effects.base)
  @Post('{id}/color')
  public async applyLightsEffectColor(
    id: number,
    @Request() req: ExpressRequest,
    @Body() effects: LightsEffectsColorCreateParams[],
  ) {
    const handler: SetEffectsHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === SetEffectsHandler.name) as SetEffectsHandler | undefined;
    if (!handler) throw new Error('SetEffectsHandler not found');

    const lightsGroup = handler.entities.find((e) => e.id === id);

    const effectNames = effects.map((e) => `"${e.type}"`);
    logger.audit(
      req.user,
      `Apply color effects ${effectNames} to lights group "${lightsGroup?.name}" (id: ${id}).`,
    );

    if (lightsGroup === undefined) {
      this.setStatus(404);
      return { message: 'LightsGroup not found in SetEffectsHandler' };
    }

    handler.parseAndSetColorEffects(id, effects);

    return { message: 'success' };
  }

  /**
   * Change the colors of the given lights group's color effects
   * @param id
   * @param req
   * @param colors
   * @param notFoundResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.effects.base)
  @Post('{id}/color/colors')
  public async updateLightsEffectColorColors(
    id: number,
    @Request() req: ExpressRequest,
    @Body() colors: ColorsRequest,
    @Res() notFoundResponse: TsoaResponse<HttpStatusCode.NotFound, { message: string }>,
  ) {
    const handler: SetEffectsHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === SetEffectsHandler.name) as SetEffectsHandler | undefined;
    if (!handler) throw new Error('SetEffectsHandler not found');

    const lightsGroup = handler.entities.find((e) => e.id === id);
    if (lightsGroup === undefined) {
      return notFoundResponse(HttpStatusCode.NotFound, {
        message: 'LightsGroup not found in SetEffectsHandler',
      });
    }

    logger.audit(
      req.user,
      `Change colors of lights group "${lightsGroup?.name}"'s effects (id: ${id}).`,
    );

    handler.updateColors(lightsGroup, colors.colors);
  }

  /**
   * Given a list of movement effects to create, add the given effects to the lightsgroup with the
   * given ID. Remove all movement effects if an empty array is given
   * @param id
   * @param req
   * @param effects
   */
  @Security(SecurityNames.LOCAL, securityGroups.effects.base)
  @Post('{id}/movement')
  public async applyLightsEffectMovement(
    id: number,
    @Request() req: ExpressRequest,
    @Body() effects: LightsEffectsMovementCreateParams[],
  ) {
    const handler: SetEffectsHandler | undefined = HandlerManager.getInstance()
      .getHandlers(LightsGroup)
      .find((h) => h.constructor.name === SetEffectsHandler.name) as SetEffectsHandler | undefined;
    if (!handler) throw new Error('SetEffectsHandler not found');

    const lightsGroup = handler.entities.find((e) => e.id === id);

    const effectNames = effects.map((e) => `"${e.type}"`);
    logger.audit(
      req.user,
      `Apply movement effects ${effectNames} to lights group "${lightsGroup?.name}" (id: ${id}).`,
    );

    if (lightsGroup === undefined) {
      this.setStatus(404);
      return { message: 'LightsGroup not found in SetEffectsHandler' };
    }

    handler.parseAndSetMovementEffects(id, effects);

    return { message: 'success' };
  }

  /**
   * Get all existing predefined effects
   */
  @Security(SecurityNames.LOCAL, securityGroups.effects.base)
  @Get('predefined')
  public async getAllPredefinedLightsEffects(): Promise<LightsPredefinedEffectResponse[]> {
    const effects = await new SetEffectsService().getAllPredefinedEffects();
    return effects.map(SetEffectsService.toLightsEffectPredefinedEffectResponse);
  }

  /**
   * Create a new predefined effect
   */
  @Security(SecurityNames.LOCAL, securityGroups.effects.privileged)
  @Post('predefined')
  public async createPredefinedLightsEffect(
    @Request() req: ExpressRequest,
    @Body() predefinedEffect: LightsPredefinedEffectCreateParams,
  ): Promise<LightsPredefinedEffectResponse> {
    const effect = await new SetEffectsService().createPredefinedEffect(predefinedEffect);

    logger.audit(req.user, `Create new predefined effect on button "${predefinedEffect.buttonId}"`);

    return SetEffectsService.toLightsEffectPredefinedEffectResponse(effect);
  }

  @Security(SecurityNames.LOCAL, securityGroups.effects.privileged)
  @Patch('predefined/{id}')
  public async updatePredefinedLightsEffect(
    id: number,
    @Request() req: ExpressRequest,
    @Body() predefinedEffect: LightsPredefinedEffectUpdateParams,
  ): Promise<LightsPredefinedEffectResponse> {
    const effect = await new SetEffectsService().updatePredefinedEffect(id, predefinedEffect);

    logger.audit(req.user, `Update new predefined effect with id "${id}"`);

    return SetEffectsService.toLightsEffectPredefinedEffectResponse(effect);
  }

  @Security(SecurityNames.LOCAL, securityGroups.effects.privileged)
  @Delete('predefined/{id}')
  public async deletePredefinedLightsEffect(
    id: number,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    await new SetEffectsService().deletePredefinedEffect(id);

    logger.audit(req.user, `Delete predefined effect with id "${id}"`);
  }
}
