import { fromBuffer } from 'file-type';
import { HttpStatusCode } from 'axios';
import { FileStorage } from '../../../../files/storage/file-storage';
import { DiskStorage } from '../../../../files/storage';
import { File } from '../../../../files/entities';
import { getDataSource } from '../../../../../database';
import { HttpApiException } from '../../../../../helpers/custom-error';
import EmitterStore from '../../../../events/emitter-store';
import PosterRequest from './poster-request';
import { FooterSize, PosterType } from './poster';

/**
 * File types that can be attached to a poster request, mapped to the resulting poster type.
 */
const POSTER_REQUEST_FILE_TYPES: Record<string, PosterType.IMAGE | PosterType.VIDEO> = {
  'image/jpeg': PosterType.IMAGE,
  'image/png': PosterType.IMAGE,
  'video/mp4': PosterType.VIDEO,
};

const MAX_STRING_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

export interface CreatePosterRequestParams {
  requesterName: string;
  requesterEmail: string;
  requesterAssociation?: string;
  message?: string;
  name: string;
  label?: string;
  startDate?: Date;
  expirationDate?: Date;
  accentColor?: string;
  footerSize?: FooterSize;
  defaultTimeout?: number;
  borrelMode?: boolean;
}

export interface CreatePosterRequestResponse {
  id: number;
  createdAt: string;
}

export default class PosterRequestService {
  private storage: FileStorage;

  constructor() {
    // Requested files are unreviewed, so they are not publicly accessible
    this.storage = new DiskStorage('poster-requests', false);
  }

  /**
   * Trim the given string and return undefined when it is empty.
   * @param value
   */
  private static optional(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  /**
   * Validate the metadata of a poster request, throwing a 400 on the first invalid field.
   * @param params
   */
  private static validate(params: CreatePosterRequestParams): void {
    const badRequest = (message: string) =>
      new HttpApiException(HttpStatusCode.BadRequest, message);

    const required: (keyof CreatePosterRequestParams)[] = [
      'requesterName',
      'requesterEmail',
      'name',
    ];
    required.forEach((field) => {
      if (!PosterRequestService.optional(params[field] as string | undefined)) {
        throw badRequest(`Field "${field}" is required.`);
      }
    });

    const limited: (keyof CreatePosterRequestParams)[] = [
      'requesterName',
      'requesterEmail',
      'requesterAssociation',
      'name',
      'label',
    ];
    limited.forEach((field) => {
      const value = params[field] as string | undefined;
      if (value && value.trim().length > MAX_STRING_LENGTH) {
        throw badRequest(`Field "${field}" can be at most ${MAX_STRING_LENGTH} characters.`);
      }
    });

    if (params.message && params.message.trim().length > MAX_MESSAGE_LENGTH) {
      throw badRequest(`Field "message" can be at most ${MAX_MESSAGE_LENGTH} characters.`);
    }
    if (!EMAIL_REGEX.test(params.requesterEmail.trim())) {
      throw badRequest('Field "requesterEmail" must be a valid email address.');
    }
    if (params.accentColor && !HEX_COLOR_REGEX.test(params.accentColor.trim())) {
      throw badRequest('Field "accentColor" must be a 6-digit hex color, like "#c40000".');
    }
    if (
      params.defaultTimeout !== undefined &&
      (!Number.isInteger(params.defaultTimeout) || params.defaultTimeout < 1)
    ) {
      throw badRequest('Field "defaultTimeout" must be a whole number of at least 1 second.');
    }
    if (
      params.startDate &&
      params.expirationDate &&
      params.expirationDate.getTime() <= params.startDate.getTime()
    ) {
      throw badRequest('Field "expirationDate" must be after "startDate".');
    }
  }

  /**
   * Determine the poster type of the given file, rejecting files that are not a JPG, PNG or MP4.
   * The file size is already limited by the upload handler.
   * @param fileData
   */
  private static async getPosterType(
    fileData: Buffer,
  ): Promise<PosterType.IMAGE | PosterType.VIDEO> {
    const fileType = await fromBuffer(fileData);
    const posterType = fileType ? POSTER_REQUEST_FILE_TYPES[fileType.mime] : undefined;
    if (!posterType) {
      throw new HttpApiException(
        HttpStatusCode.UnsupportedMediaType,
        'Invalid file type, expected a JPG, PNG or MP4 file.',
      );
    }
    return posterType;
  }

  /**
   * Store a new poster request with its file, and notify the backoffice.
   * @param params Metadata of the requested poster.
   * @param filename Original filename of the media file.
   * @param fileData Buffer containing the file.
   * @param integrationUserId Integration that submitted the request, if any.
   */
  public async createPosterRequest(
    params: CreatePosterRequestParams,
    filename: string,
    fileData: Buffer,
    integrationUserId?: number,
  ): Promise<PosterRequest> {
    PosterRequestService.validate(params);
    const type = await PosterRequestService.getPosterType(fileData);

    const fileParams = await this.storage.saveFile(filename, fileData);
    let request: PosterRequest;
    try {
      request = await getDataSource().transaction(async (manager) => {
        const file = await manager.getRepository(File).save(fileParams);
        return manager.getRepository(PosterRequest).save({
          requesterName: params.requesterName.trim(),
          requesterEmail: params.requesterEmail.trim(),
          requesterAssociation: PosterRequestService.optional(params.requesterAssociation),
          message: PosterRequestService.optional(params.message),
          integrationUser: integrationUserId !== undefined ? { id: integrationUserId } : null,
          name: params.name.trim(),
          type,
          label: PosterRequestService.optional(params.label),
          startDate: params.startDate,
          expirationDate: params.expirationDate,
          accentColor: params.accentColor?.trim().replace(/^#/, '').toLowerCase() || undefined,
          footerSize: params.footerSize ?? FooterSize.FULL,
          defaultTimeout: params.defaultTimeout ?? 15,
          borrelMode: params.borrelMode ?? false,
          file,
        });
      });
    } catch (error) {
      await this.storage.deleteFile(fileParams);
      throw error;
    }

    this.notifyBackoffice();
    return request;
  }

  /**
   * Tell connected backoffice clients that the list of poster requests has changed. The event
   * deliberately carries no data, as the requests contain personal details.
   */
  private notifyBackoffice(): void {
    EmitterStore.getInstance().backofficeSyncEmitter.emit('poster_request_update');
  }

  /**
   * Converts a poster request to the minimal response returned to the requesting integration.
   * @param request
   */
  public toCreateResponse(request: PosterRequest): CreatePosterRequestResponse {
    return { id: request.id, createdAt: request.createdAt.toISOString() };
  }
}
