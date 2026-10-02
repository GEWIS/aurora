import { Controller, FormField, UploadedFile } from '@tsoa/runtime';
import { Post, Request, Response, Route, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { SecurityNames } from '../../../../../helpers/security';
import { Security } from '../../../../auth';
import { FeatureEnabled } from '../../../../server-settings';
import logger from '../../../../../logger';
import PosterRequestService, { CreatePosterRequestResponse } from './poster-request-service';
import { FooterSize } from './poster';

@Route('handler/screen/poster/requests')
@Tags('Handlers')
@FeatureEnabled('Poster.Requests')
export class PosterRequestController extends Controller {
  private service = new PosterRequestService();

  /**
   * Submit a request for a new media poster, which has to be approved in the backoffice before
   * it is shown. The file has to be a JPG, PNG or MP4 of at most 20 MB.
   * @param file The image or video of the poster.
   * @param requesterName Name of the person requesting the poster.
   * @param requesterEmail Email address of the person requesting the poster.
   * @param name Internal name of the poster.
   * @param requesterAssociation Association the poster is requested for.
   * @param message Message to the reviewers.
   * @param label Visible title of the poster on the screens.
   * @param startDate Moment from when the poster should be in rotation (ISO 8601).
   * @param expirationDate Moment from when the poster should be out of rotation (ISO 8601).
   * @param accentColor Color of the progress bar as 6-digit hex, with or without "#".
   * @param footerSize Size of the footer.
   * @param defaultTimeout Time in seconds the poster should be on the screens for.
   * @param borrelMode Whether the poster should only be shown in borrel mode.
   * @param req
   */
  @Security(SecurityNames.INTEGRATION, ['createPosterRequest'])
  @Post('')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  @Response<string>(413, 'File is too large')
  @Response<string>(415, 'File is not a JPG, PNG or MP4')
  public async createPosterRequest(
    @UploadedFile() file: Express.Multer.File,
    @FormField() requesterName: string,
    @FormField() requesterEmail: string,
    @FormField() name: string,
    @Request() req: ExpressRequest,
    @FormField() requesterAssociation?: string,
    @FormField() message?: string,
    @FormField() label?: string,
    @FormField() startDate?: Date,
    @FormField() expirationDate?: Date,
    @FormField() accentColor?: string,
    @FormField() footerSize?: FooterSize,
    @FormField() defaultTimeout?: number,
    @FormField() borrelMode?: boolean,
  ): Promise<CreatePosterRequestResponse> {
    const request = await this.service.createPosterRequest(
      {
        requesterName,
        requesterEmail,
        requesterAssociation,
        message,
        name,
        label,
        startDate,
        expirationDate,
        accentColor,
        footerSize,
        defaultTimeout,
        borrelMode,
      },
      file.originalname,
      file.buffer,
      req.user?.integrationUserId,
    );

    logger.audit(req.user, `Create poster request (id: ${request.id}).`);
    return this.service.toCreateResponse(request);
  }
}
