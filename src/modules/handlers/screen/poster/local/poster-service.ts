import { FileStorage } from '../../../../files/storage/file-storage';
import { Repository } from 'typeorm';
import { lookup } from 'mime-types';
import { File } from '../../../../files/entities';
import Poster, { FooterSize, PosterType } from './poster';
import StaticPoster from '../static/static-poster';
import { DiskStorage } from '../../../../files/storage';
import dataSource from '../../../../../database';
import logger from '../../../../../logger';
import { HttpApiException } from '../../../../../helpers/custom-error';
import { HttpStatusCode } from 'axios';
import FileResponse from '../../../../files/entities/file-response';

interface BasePosterParams {
  name: string;
  label?: string;
  startDate?: Date;
  expirationDate?: Date;
  accentColor?: string;
  footerSize?: FooterSize;
  defaultTimeout?: number;
  borrelMode?: boolean;
  trello?: boolean;
}

export interface MediaPosterRequest extends BasePosterParams {
  type: PosterType.IMAGE | PosterType.VIDEO;
}

export interface ExternalPosterRequest extends BasePosterParams {
  type: PosterType.EXTERNAL;
  uri: string;
}

export interface PhotoPosterRequest extends BasePosterParams {
  type: PosterType.PHOTO;
  albums: number[];
}

export type CreatePosterRequest = MediaPosterRequest | ExternalPosterRequest | PhotoPosterRequest;

export interface UpdatePosterRequest {
  name?: string;
  label?: string;
  startDate?: Date;
  expirationDate?: Date;
  accentColor?: string;
  footerSize?: FooterSize;
  defaultTimeout?: number;
  borrelMode?: boolean;
  albums?: number[];
}

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
    const poster = await this.repo.findOne({ where: { id } });
    if (poster == null) {
      throw new HttpApiException(HttpStatusCode.NotFound, `Poster with ID "${id}" not found.`);
    }
    return poster;
  }

  /**
   * Creates a new Local Poster with the media type in the database.
   * This does not yet contain the actual image or video of the poster.
   * @param params Metadata of the poster as specified in the MediaPosterParams interface.
   */
  public async createMediaPoster(params: MediaPosterRequest): Promise<Poster> {
    const {
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      trello,
    } = params;
    return this.repo.save({
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      trello,
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
      const file = await this.fileRepo.save(fileParams);
      poster.files = [...(poster.files ?? []), file];
      return this.repo.save(poster);
    } catch (error) {
      await this.storage.deleteFile(fileParams);
      throw error;
    }
  }

  /**
   * Creates a new Local Poster of the url type.
   * @param params The specifics of the poster as specified in the UrlPosterParams interface.
   */
  public async createExternalPoster(params: ExternalPosterRequest): Promise<Poster> {
    const {
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      uri,
      trello,
    } = params;
    return this.repo.save({
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      uri,
      trello,
    });
  }

  /**
   * Creates a new Local Poster of the photo type.
   * @param params The specifics of the poster as specified in the PhotoPosterParams interface.
   */
  public async createPhotoPoster(params: PhotoPosterRequest): Promise<Poster> {
    const {
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      albums,
      trello,
    } = params;
    return this.repo.save({
      name,
      label,
      type,
      startDate,
      expirationDate,
      accentColor,
      footerSize,
      defaultTimeout,
      borrelMode,
      albums,
      trello,
    });
  }

  /**
   * Deletes the given poster from the database and storage.
   * @param id The id of the poster to be deleted.
   */
  public async deletePoster(id: number): Promise<void> {
    const poster = await this.getSinglePoster(id);
    const files = poster.files ?? [];
    // Removing the poster clears the owning-side join-table rows, after which
    // the now-orphaned files can be deleted from the database and disk.
    await this.repo.remove(poster);
    await Promise.all(
      files.map(async (file) => {
        await this.fileRepo.delete(file.id);
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
    const poster = await this.getSinglePoster(id);
    Object.assign(poster, params);
    return this.repo.save(poster);
  }

  /**
   * Changes the enabled status of the given poster.
   * @param id The id of the poster to enable/disable.
   * @param enabled The state to put the poster in.
   */
  public async togglePosterEnable(id: number, enabled: boolean): Promise<Poster> {
    const poster = await this.getSinglePoster(id);
    poster.enabled = enabled;
    return this.repo.save(poster);
  }

  /**
   * Deletes every poster with the trello flag from the database.
   */
  public async deleteTrelloPosters(): Promise<void> {
    const posters = await this.repo.find({ where: { trello: true } });
    await Promise.all(posters.map((poster) => this.deletePoster(poster.id)));
  }

  /**
   * Checks whether the legacy static poster table exists, and if it does, migrates
   * every static poster.
   */
  public async migrateStaticPosters(): Promise<void> {
    const staticRepo = dataSource.getRepository(StaticPoster);

    const queryRunner = dataSource.createQueryRunner();
    let tableExists: boolean;
    try {
      tableExists = await queryRunner.hasTable(staticRepo.metadata.tableName);
    } finally {
      await queryRunner.release();
    }
    if (!tableExists) return;

    const staticPosters = await staticRepo.find();
    if (staticPosters.length === 0) return;

    const migrated: StaticPoster[] = [];
    for (const staticPoster of staticPosters) {
      try {
        if (staticPoster.file) {
          const sourceStorage = new DiskStorage(
            staticPoster.file.relativeDirectory.replace(/^public[\\/]/, ''),
          );
          const data = await sourceStorage.getFile(staticPoster.file);

          const fileParams = await this.storage.saveFile(staticPoster.file.originalName, data);
          const file = await this.fileRepo.save(fileParams);

          const mimeType = lookup(staticPoster.file.originalName);
          await this.repo.save({
            name: staticPoster.file.originalName,
            type: mimeType && mimeType.startsWith('video/') ? PosterType.VIDEO : PosterType.IMAGE,
            files: [file],
            enabled: false,
          });

          await sourceStorage.deleteFile(staticPoster.file);
          await this.fileRepo.delete(staticPoster.file.id);
        } else if (staticPoster.uri) {
          await this.repo.save({
            name: staticPoster.uri,
            type: PosterType.EXTERNAL,
            uri: staticPoster.uri,
            enabled: false,
          });
        } else {
          logger.warn(
            `Skipping static poster ${staticPoster.id}: it has neither a file nor a uri.`,
          );
          continue;
        }
        migrated.push(staticPoster);
      } catch (error) {
        logger.error(`Failed to migrate static poster ${staticPoster.id}: ${error}`);
      }
    }

    if (migrated.length > 0) {
      await staticRepo.remove(migrated);
    }
    logger.info(`Migrated ${migrated.length} static poster(s) to local posters.`);
  }
}
