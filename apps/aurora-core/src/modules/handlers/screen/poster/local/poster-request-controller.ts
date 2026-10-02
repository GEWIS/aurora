import { Controller, FormField, UploadedFile } from '@tsoa/runtime';
import { Body, Get, Post, Request, Response, Route, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { SecurityNames } from '../../../../../helpers/security';
import { securityGroups } from '../../../../../helpers/security-groups';
import { Security } from '../../../../auth';
import { FeatureEnabled } from '../../../../server-settings';
import logger from '../../../../../logger';
import PosterRequestService, {
  ApprovePosterRequestParams,
  CreatePosterRequestResponse,
  PosterRequestResponse,
} from './poster-request-service';
import PosterService, { PosterResponse } from './poster-service';
import { FooterSize } from './poster';

@Route('handler/screen/poster/requests')
@Tags('Handlers')
@FeatureEnabled('Poster.Requests')
export class PosterRequestController extends Controller {
  private service = new PosterRequestService();

  /**
   * Submit a request for a new poster, which has to be approved in the backoffice before it is
   * shown. Send either a file for a media poster, or a uri for an external poster. The file has to
   * be a JPG, PNG or MP4 of at most 20 MB.
   * @param requesterName Name of the person requesting the poster.
   * @param requesterEmail Email address of the person requesting the poster.
   * @param name Internal name of the poster.
   * @param file The image or video of a media poster.
   * @param uri Link to an external poster (http or https).
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
  @Response<string>(400, 'Invalid fields, or not exactly one of a file and a uri')
  @Response<string>(413, 'File is too large')
  @Response<string>(415, 'File is not a JPG, PNG or MP4')
  public async createPosterRequest(
    @FormField() requesterName: string,
    @FormField() requesterEmail: string,
    @FormField() name: string,
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
    @FormField() uri?: string,
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
        uri,
      },
      file ? { name: file.originalname, data: file.buffer } : undefined,
      req.user?.integrationUserId,
    );

    logger.audit(req.user, `Create poster request (id: ${request.id}).`);
    return this.service.toCreateResponse(request);
  }

  /**
   * Get all pending poster requests, oldest first.
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Get('')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async getAllPosterRequests(): Promise<PosterRequestResponse[]> {
    const requests = await this.service.getAllPosterRequests();
    return requests.map((request) => this.service.toResponse(request));
  }

  /**
   * Get the uploaded image or video of a pending poster request.
   * @param id The id of the poster request.
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Get('{id}/media')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async getPosterRequestMedia(id: number, @Request() req: ExpressRequest): Promise<void> {
    const { data, mimeType } = await this.service.getPosterRequestMedia(id);

    const res = req.res!;
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // The original filename is provided by the requester, so it is not put in a header
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', mimeType);
    res.send(data);
  }

  /**
   * Approve a poster request, creating an enabled poster with the given fields at the end of the
   * carousel. External poster requests need a uri. The request and the requester's details are
   * deleted afterwards.
   * @param id The id of the poster request.
   * @param body The final poster fields. Optional fields that are left out are not set.
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('{id}/approve')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async approvePosterRequest(
    id: number,
    @Body() body: ApprovePosterRequestParams,
    @Request() req: ExpressRequest,
  ): Promise<PosterResponse> {
    const poster = await this.service.approvePosterRequest(id, body);
    logger.audit(req.user, `Approve poster request (id: ${id}) as poster (id: ${poster.id}).`);
    return new PosterService().toResponse(poster);
  }

  /**
   * Deny a poster request. The request, the requester's details and the file are deleted.
   * @param id The id of the poster request.
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.poster.privileged)
  @Post('{id}/deny')
  @Response<string>(409, 'Endpoint is disabled in the server settings')
  public async denyPosterRequest(id: number, @Request() req: ExpressRequest): Promise<void> {
    await this.service.denyPosterRequest(id);
    logger.audit(req.user, `Deny poster request (id: ${id}).`);
  }
}
