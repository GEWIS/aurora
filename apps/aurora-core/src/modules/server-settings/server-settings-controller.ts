import { Controller, FormField, TsoaResponse, UploadedFile } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Res, Route, Security, Tags } from 'tsoa';
import { SecurityGroup, SecurityNames } from '../../helpers/security';
import ServerSettingsStore from './server-settings-store';
import { ISettings } from './server-setting';
import FeatureFlagManager from './feature-flag-manager';
import { securityGroups } from '../../helpers/security-groups';
import { DiskStorage } from '../files/storage';
import { IFile } from '../files/entities';

type SetServerSettingRequest = {
  key: string;
  value: any;
};

interface ServerSettingResponse {
  key: keyof ISettings;
  value: any;
}

@Tags('ServerSettings')
@Route('settings')
export class ServerSettingsController extends Controller {
  /**
   * Get all server settings. NOTE: this can include secrets
   * like private keys!
   */
  @Security(SecurityNames.LOCAL, securityGroups.serverSettings.privileged)
  @Get('')
  public async getSettings() {
    return ServerSettingsStore.getInstance().getSettings();
  }

  /**
   * Change the value of a server setting
   * @param request
   * @param validationErrorResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.serverSettings.privileged)
  @Post('')
  public async setSetting(
    @Body() request: SetServerSettingRequest,
    @Res() validationErrorResponse: TsoaResponse<400, string>,
  ): Promise<ServerSettingResponse> {
    const store = ServerSettingsStore.getInstance();
    if (!store.hasSetting(request.key)) {
      return validationErrorResponse(400, `Setting with key "${request.key}" not found.`);
    }

    const key = request.key as keyof ISettings;
    const currentValue = store.getSetting(key);
    const currentType = typeof currentValue;
    const newType = typeof request.value;
    if (typeof currentValue !== typeof request.value) {
      return validationErrorResponse(
        400,
        `Setting with key "${request.key}" does not have the correct value type. Expected "${currentType}", but received "${newType}".`,
      );
    }

    await store.setSetting(key, request.value);
    const newValue = store.getSetting(key);
    return { key, value: newValue };
  }

  /**
   * Upload a file for a server setting
   */
  @Security(SecurityNames.LOCAL, securityGroups.serverSettings.privileged)
  @Post('file')
  public async setSettingFile(
    @UploadedFile() file: Express.Multer.File,
    @FormField() key: keyof ISettings,
  ): Promise<ServerSettingResponse> {
    const store = ServerSettingsStore.getInstance();
    const storage = store.getFileStorage();

    const currentValue = store.getSetting(key);
    if (currentValue !== '') {
      const existingFile = currentValue as IFile;
      await storage.deleteFile(existingFile);
    }

    const value = await storage.saveFile(file.originalname, file.buffer);
    await store.setSetting(key, value);

    return { key, value };
  }

  /**
   * Clear a file from the server settings
   * @param request
   * @param notFoundErrorResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.serverSettings.privileged)
  @Delete('file')
  public async clearSettingsFile(
    @Body() request: { key: string },
    @Res() notFoundErrorResponse: TsoaResponse<404, string>,
  ): Promise<ServerSettingResponse> {
    const store = ServerSettingsStore.getInstance();
    const storage = store.getFileStorage();

    const key = request.key as keyof ISettings;
    const currentValue = store.getSetting(key);
    if (currentValue == undefined) {
      return notFoundErrorResponse(404, 'Setting not found');
    }
    if (currentValue !== '') {
      const existingFile = currentValue as IFile;
      await storage.deleteFile(existingFile);
    }

    await store.setSetting(key, '');

    return { key, value: '' };
  }

  /**
   * Get a list of all feature flags and whether they are enabled/disabled.
   */
  @Security(SecurityNames.LOCAL, securityGroups.serverSettings.base)
  @Get('feature-flags')
  public getFeatureFlags() {
    return FeatureFlagManager.getInstance().getFeatureFlags();
  }
}
