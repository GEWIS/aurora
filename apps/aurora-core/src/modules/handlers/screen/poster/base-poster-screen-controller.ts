import { Controller } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { Get, Request, Route, Security, Tags } from 'tsoa';
import express from 'express';
import { HexColor } from '../../../lights/color-definitions';
import { ServerSettingsStore } from '../../../server-settings';
import { ISettings } from '../../../server-settings/server-setting';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';
import { lookup } from 'mime-types';

export interface PosterScreenSettingsResponse {
  defaultMinimal: boolean;
  defaultProgressBarColor: HexColor;
  progressBarLogo: boolean;
  stylesheet: boolean;
  clockShouldTick: boolean;
}

@injectable()
@Route('handler/screen/poster')
@Tags('Handlers')
export class BasePosterScreenController extends Controller {
  constructor(private readonly serverSettingsStore: ServerSettingsStore) {
    super();
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings')
  public getPosterSettings(): PosterScreenSettingsResponse {
    const logo = this.serverSettingsStore.getSetting(
      'Poster.ProgressBarLogo',
    ) as ISettings['Poster.ProgressBarLogo'];
    const stylesheet = this.serverSettingsStore.getSetting(
      'Poster.CustomStylesheet',
    ) as ISettings['Poster.CustomStylesheet'];

    return {
      defaultMinimal: this.serverSettingsStore.getSetting(
        'Poster.DefaultMinimal',
      ) as ISettings['Poster.DefaultMinimal'],
      defaultProgressBarColor: this.serverSettingsStore.getSetting(
        'Poster.DefaultProgressBarColor',
      ) as ISettings['Poster.DefaultProgressBarColor'],
      progressBarLogo: logo !== '',
      stylesheet: stylesheet !== '',
      clockShouldTick: this.serverSettingsStore.getSetting(
        'Poster.ClockShouldTick',
      ) as ISettings['Poster.ClockShouldTick'],
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings/progress-bar-logo')
  public async getSettingsProgressBarLogo(@Request() request: express.Request) {
    const fileStorage = this.serverSettingsStore.getFileStorage();

    const logo = this.serverSettingsStore.getSetting(
      'Poster.ProgressBarLogo',
    ) as ISettings['Poster.ProgressBarLogo'];

    if (logo === '') {
      return;
    }

    const res = request?.res;
    if (logo && res) {
      const buffer = await fileStorage.getFile(logo);
      const contentType = lookup(logo.originalName) || 'application/octet-stream';

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline; filename=' + logo.originalName);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings/custom-stylesheet')
  public async getSettingsProgressBarStylesheet(@Request() request: express.Request) {
    const fileStorage = this.serverSettingsStore.getFileStorage();

    const stylesheet = this.serverSettingsStore.getSetting(
      'Poster.CustomStylesheet',
    ) as ISettings['Poster.CustomStylesheet'];

    if (stylesheet === '') {
      return;
    }

    const res = request?.res;
    if (stylesheet && res) {
      const buffer = await fileStorage.getFile(stylesheet);
      const contentType = lookup(stylesheet.originalName) || 'application/octet-stream';

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline; filename=' + stylesheet.originalName);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    }
  }
}
