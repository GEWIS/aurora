import { HttpStatusCode } from 'axios';
import { Repository } from 'typeorm';
import { FileStorage } from '../../../../files/storage/file-storage';
import { DiskStorage } from '../../../../files/storage';
import { File } from '../../../../files/entities';
import { getDataSource } from '../../../../../database';
import { HttpApiException } from '../../../../../helpers/custom-error';
import EmitterStore from '../../../../events/emitter-store';
import PosterRequest from './poster-request';
import Poster, { FooterSize, PosterType } from './poster';
import { POSTER_STORAGE_DIRECTORY } from './poster-service';
import { getMimeType, validatePosterRequestFile } from './poster-request-file';

const MAX_STRING_LENGTH = 255;
const ALLOWED_URI_PROTOCOLS = ['http:', 'https:'];
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

/**
 * Poster fields that can be requested, and that are set by the reviewer when approving.
 */
type PosterRequestFields =
  | 'name'
  | 'label'
  | 'startDate'
  | 'expirationDate'
  | 'accentColor'
  | 'footerSize'
  | 'defaultTimeout'
  | 'borrelMode';

/**
 * Whether a poster is only shown in borrel mode is up to the reviewer, so it cannot be requested.
 */
export interface CreatePosterRequestParams extends Partial<
  Pick<Poster, Exclude<PosterRequestFields, 'name' | 'borrelMode'>>
> {
  requesterName: string;
  requesterEmail: string;
  requesterAssociation?: string;
  message?: string;
  name: string;
  /**
   * Link to an external poster. Requests have either a file or a uri.
   */
  uri?: string;
}

export interface PosterRequestFile {
  name: string;
  data: Buffer;
}

/**
 * The final poster as approved by the reviewer. Optional fields that are left out are not set on
 * the poster, even if the requester provided them.
 */
export interface ApprovePosterRequestParams extends Pick<Poster, PosterRequestFields> {
  /**
   * Link of the external poster. Required when approving an external poster request, and not
   * allowed for other requests.
   */
  uri?: string;
}

export interface CreatePosterRequestResponse {
  id: number;
  createdAt: string;
}

export interface PosterRequestResponse {
  id: number;
  createdAt: string;
  requesterName: string;
  requesterEmail: string;
  requesterAssociation?: string;
  message?: string;
  /**
   * Name of the integration that submitted the request, if it still exists.
   */
  integrationName?: string;
  name: string;
  type: PosterType.IMAGE | PosterType.VIDEO | PosterType.EXTERNAL;
  /**
   * Link to the requested external poster. Only set for external posters.
   */
  uri?: string;
  label?: string;
  startDate?: Date;
  expirationDate?: Date;
  accentColor?: string;
  footerSize: FooterSize;
  defaultTimeout: number;
  /**
   * Original name of the uploaded file. The file itself is served by a separate endpoint. Not set
   * for external posters.
   */
  fileName?: string;
}

export interface PosterRequestMedia {
  data: Buffer;
  mimeType: string;
}

const badRequest = (message: string) => new HttpApiException(HttpStatusCode.BadRequest, message);

export default class PosterRequestService {
  private storage: FileStorage;

  private repo: Repository<PosterRequest>;

  constructor() {
    // Requested files are unreviewed, so they are not publicly accessible
    this.storage = new DiskStorage('poster-requests', false);
    this.repo = getDataSource().getRepository(PosterRequest);
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
   * Normalize a hex color to the format used by the backoffice: lowercase and without "#".
   * @param color
   */
  private static normalizeColor(color?: string): string | undefined {
    return color?.trim().replace(/^#/, '').toLowerCase() || undefined;
  }

  /**
   * Throw a 400 if the given optional string is longer than the given maximum.
   * @param field
   * @param value
   * @param max
   */
  private static validateLength(field: string, value: string | undefined, max: number): void {
    if (value && value.trim().length > max) {
      throw badRequest(`Field "${field}" can be at most ${max} characters.`);
    }
  }

  /**
   * Validate the requester details, throwing a 400 on the first invalid field.
   * @param params
   */
  private static validateRequester(params: CreatePosterRequestParams): void {
    if (!PosterRequestService.optional(params.requesterName)) {
      throw badRequest('Field "requesterName" is required.');
    }
    if (!PosterRequestService.optional(params.requesterEmail)) {
      throw badRequest('Field "requesterEmail" is required.');
    }
    PosterRequestService.validateLength('requesterName', params.requesterName, MAX_STRING_LENGTH);
    PosterRequestService.validateLength('requesterEmail', params.requesterEmail, MAX_STRING_LENGTH);
    PosterRequestService.validateLength(
      'requesterAssociation',
      params.requesterAssociation,
      MAX_STRING_LENGTH,
    );
    PosterRequestService.validateLength('message', params.message, MAX_MESSAGE_LENGTH);
    if (!EMAIL_REGEX.test(params.requesterEmail.trim())) {
      throw badRequest('Field "requesterEmail" must be a valid email address.');
    }
  }

  /**
   * Validate the poster fields, throwing a 400 on the first invalid field.
   * @param params
   */
  private static validatePosterFields(params: Partial<Pick<Poster, PosterRequestFields>>): void {
    if (!PosterRequestService.optional(params.name)) {
      throw badRequest('Field "name" is required.');
    }
    PosterRequestService.validateLength('name', params.name, MAX_STRING_LENGTH);
    PosterRequestService.validateLength('label', params.label, MAX_STRING_LENGTH);
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
   * Validate the link of an external poster, throwing a 400 if it is not a http(s) URL.
   * @param uri
   */
  private static validateUri(uri: string): void {
    PosterRequestService.validateLength('uri', uri, MAX_STRING_LENGTH);
    let url: URL;
    try {
      url = new URL(uri);
    } catch {
      throw badRequest('Field "uri" must be a valid URL.');
    }
    if (!ALLOWED_URI_PROTOCOLS.includes(url.protocol)) {
      throw badRequest('Field "uri" must be a http or https URL.');
    }
  }

  /**
   * Store a new poster request, with either a file or a link to an external poster, and notify
   * the backoffice.
   * @param params Metadata of the requested poster.
   * @param file The image or video of a media poster.
   * @param integrationUserId Integration that submitted the request, if any.
   */
  public async createPosterRequest(
    params: CreatePosterRequestParams,
    file: PosterRequestFile | undefined,
    integrationUserId?: number,
  ): Promise<PosterRequest> {
    PosterRequestService.validateRequester(params);
    PosterRequestService.validatePosterFields(params);

    const uri = PosterRequestService.optional(params.uri);
    if (file && uri) throw badRequest('Provide either a file or a "uri", not both.');
    if (!file && !uri) throw badRequest('Provide either a file or a "uri".');
    if (uri) PosterRequestService.validateUri(uri);
    const validatedFile = file ? await validatePosterRequestFile(file.name, file.data) : undefined;
    const type = validatedFile?.type ?? PosterType.EXTERNAL;

    // The stored name has a safe extension, which the public copy keeps after approval
    const fileParams = validatedFile
      ? await this.storage.saveFile(validatedFile.name, validatedFile.data)
      : undefined;
    let request: PosterRequest;
    try {
      request = await getDataSource().transaction(async (manager) => {
        const savedFile = fileParams ? await manager.getRepository(File).save(fileParams) : null;
        return manager.getRepository(PosterRequest).save({
          requesterName: params.requesterName.trim(),
          requesterEmail: params.requesterEmail.trim(),
          requesterAssociation: PosterRequestService.optional(params.requesterAssociation),
          message: PosterRequestService.optional(params.message),
          integrationUser: integrationUserId !== undefined ? { id: integrationUserId } : null,
          name: params.name.trim(),
          type,
          uri,
          label: PosterRequestService.optional(params.label),
          startDate: params.startDate,
          expirationDate: params.expirationDate,
          accentColor: PosterRequestService.normalizeColor(params.accentColor),
          footerSize: params.footerSize ?? FooterSize.FULL,
          defaultTimeout: params.defaultTimeout ?? 15,
          file: savedFile,
        });
      });
    } catch (error) {
      if (fileParams) await this.storage.deleteFile(fileParams);
      throw error;
    }

    this.notifyBackoffice();
    return request;
  }

  /**
   * Fetches all pending poster requests, oldest first.
   */
  public async getAllPosterRequests(): Promise<PosterRequest[]> {
    return this.repo.find({ order: { createdAt: 'ASC', id: 'ASC' } });
  }

  /**
   * Gets a specific pending poster request.
   * @param id The id of the poster request to fetch.
   */
  public async getSinglePosterRequest(id: number): Promise<PosterRequest> {
    const request = await this.repo.findOneBy({ id });
    if (request === null) {
      throw new HttpApiException(
        HttpStatusCode.NotFound,
        `Poster request with ID "${id}" not found.`,
      );
    }
    return request;
  }

  /**
   * Gets the uploaded file of a poster request, with its mime type derived from its contents.
   * @param id The id of the poster request.
   */
  public async getPosterRequestMedia(id: number): Promise<PosterRequestMedia> {
    const request = await this.getSinglePosterRequest(id);
    if (!request.file) {
      throw new HttpApiException(
        HttpStatusCode.NotFound,
        `Poster request with ID "${id}" has no file, as it is an external poster.`,
      );
    }
    const data = await this.storage.getFile(request.file);
    const mimeType = (await getMimeType(data)) ?? 'application/octet-stream';
    return { data, mimeType };
  }

  /**
   * Creates an enabled poster from the given request and deletes the request, including the
   * requester's details and the private copy of the file.
   * @param id The id of the poster request to approve.
   * @param params The final poster fields as set by the reviewer.
   */
  public async approvePosterRequest(
    id: number,
    params: ApprovePosterRequestParams,
  ): Promise<Poster> {
    PosterRequestService.validatePosterFields(params);
    const request = await this.getSinglePosterRequest(id);
    const requestFile = request.file;

    const uri = PosterRequestService.optional(params.uri);
    if (request.type === PosterType.EXTERNAL) {
      if (!uri) throw badRequest('Field "uri" is required for an external poster.');
      PosterRequestService.validateUri(uri);
    } else if (uri) {
      throw badRequest('Field "uri" can only be set for an external poster.');
    }

    // Copy the file to the public poster storage, as it is now allowed on the screens
    const posterStorage = new DiskStorage(POSTER_STORAGE_DIRECTORY);
    const fileParams = requestFile
      ? await posterStorage.saveFile(
          requestFile.originalName,
          await this.storage.getFile(requestFile),
        )
      : undefined;

    let poster: Poster;
    try {
      poster = await getDataSource().transaction(async (manager) => {
        const file = fileParams ? await manager.getRepository(File).save(fileParams) : undefined;
        const created = await manager.getRepository(Poster).save({
          name: params.name.trim(),
          type: request.type,
          uri,
          enabled: true,
          label: PosterRequestService.optional(params.label),
          startDate: params.startDate,
          expirationDate: params.expirationDate,
          accentColor: PosterRequestService.normalizeColor(params.accentColor),
          footerSize: params.footerSize,
          defaultTimeout: params.defaultTimeout,
          borrelMode: params.borrelMode,
          files: file ? [file] : [],
        });
        await manager.getRepository(PosterRequest).delete({ id: request.id });
        if (requestFile) await manager.getRepository(File).delete({ id: requestFile.id });
        return created;
      });
    } catch (error) {
      if (fileParams) await posterStorage.deleteFile(fileParams);
      throw error;
    }

    if (requestFile) await this.storage.deleteFile(requestFile);
    this.notifyBackoffice();
    return poster;
  }

  /**
   * Deletes the given poster request, including the requester's details and the file, if any.
   * @param id The id of the poster request to deny.
   */
  public async denyPosterRequest(id: number): Promise<void> {
    const request = await this.getSinglePosterRequest(id);
    const requestFile = request.file;

    await getDataSource().transaction(async (manager) => {
      await manager.getRepository(PosterRequest).delete({ id: request.id });
      if (requestFile) await manager.getRepository(File).delete({ id: requestFile.id });
    });

    if (requestFile) await this.storage.deleteFile(requestFile);
    this.notifyBackoffice();
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

  /**
   * Converts a poster request to the response shown to reviewers.
   * @param request
   */
  public toResponse(request: PosterRequest): PosterRequestResponse {
    return {
      id: request.id,
      createdAt: request.createdAt.toISOString(),
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterAssociation: request.requesterAssociation ?? undefined,
      message: request.message ?? undefined,
      integrationName: request.integrationUser?.name ?? undefined,
      name: request.name,
      type: request.type,
      uri: request.uri ?? undefined,
      label: request.label ?? undefined,
      startDate: request.startDate ?? undefined,
      expirationDate: request.expirationDate ?? undefined,
      accentColor: request.accentColor ?? undefined,
      footerSize: request.footerSize,
      defaultTimeout: request.defaultTimeout,
      fileName: request.file?.originalName,
    };
  }
}
