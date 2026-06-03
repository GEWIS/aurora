import { Controller, Patch, TsoaResponse, UploadedFile } from '@tsoa/runtime';
import { Body, Delete, Get, Post, Put, Res, Route, Security, Tags } from 'tsoa';
import { SecurityNames } from '../../../../../helpers/security';
import { securityGroups } from '../../../../../helpers/security-groups';
import { HttpStatusCode } from 'axios';
import PosterService, {
  CreatePosterRequest,
  PosterResponse,
  UpdatePosterRequest,
} from './poster-service';
import Poster, { PosterType } from './poster';
import { lookup } from 'mime-types';
import { FeatureEnabled } from '../../../../server-settings';

@Route('/handler/screen/poster')
@Tags('Handlers')
@FeatureEnabled('Poster')
export class PosterController extends Controller {
  private service = new PosterService();

  /**
   * Get all posters from the database.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('items')
  public async getAllPosters(): Promise<PosterResponse[]> {
    const posters = await this.service.getAllPosters();
    return posters.map((poster) => this.service.toResponse(poster));
  }

  /**
   * Gets a single poster from the database.
   * @param id The id of the poster to get.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.base)
  @Get('items/{id}')
  public async getPoster(id: number): Promise<PosterResponse> {
    const poster = await this.service.getSinglePoster(id);
    return this.service.toResponse(poster);
  }

  /**
   * Creates a new poster of the given type.
   * @param body Body specifying the poster to be created.
   * @param invalidPosterTypeResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('items')
  public async createPoster(
    @Body() body: CreatePosterRequest,
    @Res()
    invalidPosterTypeResponse: TsoaResponse<HttpStatusCode.BadRequest, 'Unknown Poster Type'>,
  ): Promise<PosterResponse> {
    let poster: Poster;
    switch (body.type) {
      case PosterType.IMAGE:
      case PosterType.VIDEO:
        poster = await this.service.createMediaPoster(body);
        break;
      case PosterType.EXTERNAL:
        poster = await this.service.createExternalPoster(body);
        break;
      case PosterType.PHOTO:
        poster = await this.service.createPhotoPoster(body);
        break;
      default: {
        return invalidPosterTypeResponse(HttpStatusCode.BadRequest, 'Unknown Poster Type');
      }
    }
    return this.service.toResponse(poster);
  }

  /**
   * Attaches uploaded file to existing media poster.
   * @param id Id of the poster.
   * @param file File to be attached, has to be an image or video.
   * @param invalidFileTypeResponse
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Put('items/{id}/media')
  public async attachMedia(
    id: number,
    @UploadedFile() file: Express.Multer.File,
    @Res()
    invalidFileTypeResponse: TsoaResponse<
      HttpStatusCode.UnsupportedMediaType,
      'Invalid file type, expected an image or a video.'
    >,
  ): Promise<PosterResponse> {
    const mimeType = lookup(file.originalname);
    if (!mimeType || !(mimeType.startsWith('image/') || mimeType.startsWith('video/'))) {
      return invalidFileTypeResponse(
        HttpStatusCode.UnsupportedMediaType,
        'Invalid file type, expected an image or a video.',
      );
    }

    const poster = await this.service.attachMedia(id, file.originalname, file.buffer);
    return this.service.toResponse(poster);
  }

  /**
   * Deletes a specific poster from the database.
   * @param id Indicates the poster to be deleted.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Delete('items/{id}')
  public async deletePoster(id: number): Promise<void> {
    await this.service.deletePoster(id);
  }

  /**
   * Updates the updatable fields of a specific poster.
   * @param id The id of the to be updated poster.
   * @param body The new values of the fields to be changed as specified in UpdatePosterParams.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Patch('items/{id}')
  public async updatePoster(
    id: number,
    @Body() body: UpdatePosterRequest,
  ): Promise<PosterResponse> {
    const poster = await this.service.updatePoster(id, body);
    return this.service.toResponse(poster);
  }
}
