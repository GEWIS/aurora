import { FileStorage } from '../../../../files/storage/file-storage';
import { Repository } from 'typeorm';
import { File } from '../../../../files/entities';
import Poster, { FooterSize, PosterType } from './poster';
import { DiskStorage } from '../../../../files/storage';
import dataSource from '../../../../../database';
import { HttpApiException } from '../../../../../helpers/custom-error';
import { HttpStatusCode } from 'axios';
import FileResponse from '../../../../files/entities/file-response';

type BasePosterFields =
  | 'name'
  | 'label'
  | 'startDate'
  | 'expirationDate'
  | 'accentColor'
  | 'footerSize'
  | 'defaultTimeout'
  | 'borrelMode';

export interface BasePosterParams extends Pick<Poster, BasePosterFields> {
  trello?: boolean;
}

export interface MediaPosterRequest extends BasePosterParams {
  type: PosterType.IMAGE | PosterType.VIDEO;
}

export interface ExternalPosterRequest extends BasePosterParams, Required<Pick<Poster, 'uri'>> {
  type: PosterType.EXTERNAL;
}

export interface PhotoPosterRequest extends BasePosterParams, Required<Pick<Poster, 'albums'>> {
  type: PosterType.PHOTO;
}

export type CreatePosterRequest = MediaPosterRequest | ExternalPosterRequest | PhotoPosterRequest;

export interface UpdatePosterRequest extends Partial<
  Pick<
    Poster,
    | 'name'
    | 'label'
    | 'startDate'
    | 'expirationDate'
    | 'accentColor'
    | 'footerSize'
    | 'defaultTimeout'
    | 'borrelMode'
    | 'albums'
  >
> {}

export interface PosterResponse {
  id: number;
  name: string;
  label?: string;
  type: PosterType;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  startDate?: Date;
  expirationDate?: Date;
  accentColor?: string;
  footerSize: FooterSize;
  defaultTimeout: number;
  borrelMode: boolean;
  protected: boolean;
  trello: boolean;
  uri?: string;
  albums?: number[];
  files: FileResponse[];
}

export default class PosterService {
  private storage: FileStorage;

  private repo: Repository<Poster>;

  private fileRepo: Repository<File>;

  constructor() {
    this.storage = new DiskStorage('posters');
    this.repo = dataSource.getRepository(Poster);
    this.fileRepo = dataSource.getRepository(File);
  }

  /**
   * Converts a poster entity to the PosterResponse format.
   * @param poster The poster to be converted.
   */
  public toResponse(poster: Poster): PosterResponse {
    const files: FileResponse[] = (poster.files ?? []).reduce<FileResponse[]>((acc, file) => {
      const location = this.storage.getPublicFileUri(file);
      if (location) {
        acc.push({ location, name: file.originalName });
      }
      return acc;
    }, []);

    return {
      id: poster.id,
      name: poster.name,
      label: poster.label ?? undefined,
      type: poster.type,
      enabled: poster.enabled,
      createdAt: poster.createdAt.toISOString(),
      updatedAt: poster.updatedAt.toISOString(),
      startDate: poster.startDate ?? undefined,
      expirationDate: poster.expirationDate ?? undefined,
      accentColor: poster.accentColor ?? undefined,
      footerSize: poster.footerSize,
      defaultTimeout: poster.defaultTimeout,
      borrelMode: poster.borrelMode,
      protected: poster.protected,
      trello: poster.trello,
      uri: poster.uri ?? undefined,
      albums: poster.albums ?? undefined,
      files,
    };
  }

  /**
   * Fetches all Local Posters from the database.
   */
  public async getAllPosters(): Promise<Poster[]> {
    return this.repo.find();
  }

  /**
   * Gets a specific Local Poster from the database.
   * @param id The id of the poster to fetch.
   */
  public async getSinglePoster(id: number): Promise<Poster> {
    const poster = await this.repo.findOneBy({ id });
    if (poster === null) {
      throw new HttpApiException(HttpStatusCode.NotFound, `Poster with ID "${id}" not found.`);
    }
    return poster;
  }

  /**
   * Creates a new Local Poster of the given type in the database.
   * For media posters this does not yet contain the actual image or video.
   * @param params Metadata of the poster as specified in CreatePosterRequest.
   */
  public async createPoster(params: CreatePosterRequest): Promise<Poster> {
    return this.repo.save({
      ...params,
      uri: params.type === PosterType.EXTERNAL ? params.uri : undefined,
      albums: params.type === PosterType.PHOTO ? params.albums : undefined,
    });
  }

  /**
   * Adds the given image or video to the database entry for the specified poster.
   * @param id Id of the poster to add the media to.
   * @param filename Original filename of the media file.
   * @param filedata Buffer containing the file.
   */
  public async attachMedia(id: number, filename: string, filedata: Buffer): Promise<Poster> {
    const poster = await this.getSinglePoster(id);
    if (poster.type != PosterType.IMAGE && poster.type != PosterType.VIDEO) {
      throw new HttpApiException(
        HttpStatusCode.BadRequest,
        `Poster with ID "${id}" is not a media poster.`,
      );
    }

    const fileParams = await this.storage.saveFile(filename, filedata);
    try {
      return await dataSource.transaction(async (manager) => {
        const file = await manager.getRepository(File).save(fileParams);
        poster.files = [...(poster.files ?? []), file];
        return manager.getRepository(Poster).save(poster);
      });
    } catch (error) {
      await this.storage.deleteFile(fileParams);
      throw error;
    }
  }

  /**
   * Deletes the given poster from the database and storage.
   * @param id The id of the poster to be deleted.
   */
  public async deletePoster(id: number): Promise<void> {
    const poster = await this.getSinglePoster(id);
    const files = poster.files ?? [];
    await this.repo.remove(poster);
    await Promise.all(
      files.map(async (file) => {
        await this.storage.deleteFile(file);
      }),
    );
  }

  /**
   * Updates the given fields in the database entry of the given poster.
   * @param id The id of the poster to be updated.
   * @param params The fields of the poster to be updated as specified in UpdatePosterParams.
   */
  public async updatePoster(id: number, params: UpdatePosterRequest): Promise<Poster> {
    return dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Poster);
      const poster = await repo.findOneBy({ id });
      if (poster === null) {
        throw new HttpApiException(HttpStatusCode.NotFound, `Poster with ID "${id}" not found.`);
      }
      Object.assign(poster, params);
      return repo.save(poster);
    });
  }

  /**
   * Changes the enabled status of the given poster.
   * @param id The id of the poster to enable/disable.
   * @param enabled The state to put the poster in.
   */
  public async togglePosterEnable(id: number, enabled: boolean): Promise<Poster> {
    await this.repo.update({ id }, { enabled });
    return this.getSinglePoster(id);
  }
}
