import { Controller } from '@tsoa/runtime';
import { Get, Request, Route, Security, Tags } from 'tsoa';
import express from 'express';
import { HexColor } from '../../../lights/color-definitions';
import { ServerSettingsStore } from '../../../server-settings';
import { ISettings } from '../../../server-settings/server-setting';
import { SecurityNames } from '../../../../helpers/security';
import { securityGroups } from '../../../../helpers/security-groups';
import { fromBuffer } from 'file-type';

export interface PosterScreenSettingsResponse {
  defaultMinimal: boolean;
  defaultProgressBarColor: HexColor;
  progressBarLogo: boolean;
  stylesheet: boolean;
  clockShouldTick: boolean;
}

@Route('handler/screen/poster')
@Tags('Handlers')
export class BasePosterScreenController extends Controller {
  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings')
  public getPosterSettings(): PosterScreenSettingsResponse {
    const store = ServerSettingsStore.getInstance();

    const logo = store.getSetting('Poster.ProgressBarLogo') as ISettings['Poster.ProgressBarLogo'];
    const stylesheet = store.getSetting(
      'Poster.CustomStylesheet',
    ) as ISettings['Poster.CustomStylesheet'];

    return {
      defaultMinimal: store.getSetting(
        'Poster.DefaultMinimal',
      ) as ISettings['Poster.DefaultMinimal'],
      defaultProgressBarColor: store.getSetting(
        'Poster.DefaultProgressBarColor',
      ) as ISettings['Poster.DefaultProgressBarColor'],
      progressBarLogo: logo !== '',
      stylesheet: stylesheet !== '',
      clockShouldTick: store.getSetting(
        'Poster.ClockShouldTick',
      ) as ISettings['Poster.ClockShouldTick'],
    };
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings/progress-bar-logo')
  public async getSettingsProgressBarLogo(@Request() request: express.Request) {
    const settingsStore = ServerSettingsStore.getInstance();
    const fileStorage = settingsStore.getFileStorage();

    const logo = ServerSettingsStore.getInstance().getSetting(
      'Poster.ProgressBarLogo',
    ) as ISettings['Poster.ProgressBarLogo'];

    if (logo === '') {
      return;
    }

    const res = request?.res;
    if (logo && res) {
      const buffer = await fileStorage.getFile(logo);
      const fileType = await fromBuffer(buffer);
      const contentType = fileType?.mime ?? 'application/octet-stream';

      res.setHeader('Content-Disposition', 'attachment; filename=' + logo.originalName);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    }
  }

  @Security(SecurityNames.LOCAL, securityGroups.poster.subscriber)
  @Get('settings/custom-stylesheet')
  public async getSettingsProgressBarStylesheet(@Request() request: express.Request) {
    const settingsStore = ServerSettingsStore.getInstance();
    const fileStorage = settingsStore.getFileStorage();

    const stylesheet = ServerSettingsStore.getInstance().getSetting(
      'Poster.CustomStylesheet',
    ) as ISettings['Poster.CustomStylesheet'];

    if (stylesheet === '') {
      return;
    }

    const res = request?.res;
    if (stylesheet && res) {
      const buffer = await fileStorage.getFile(stylesheet);
      const fileType = await fromBuffer(buffer);
      const contentType = fileType?.mime ?? 'application/octet-stream';

      res.setHeader('Content-Disposition', 'attachment; filename=' + stylesheet.originalName);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    }
  }
}
