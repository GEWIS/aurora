import { Delete, Get, Post, Query, Request, Res, Response, Route, Security, Tags } from 'tsoa';
import { Controller, TsoaResponse } from '@tsoa/runtime';
import { Request as ExpressRequest } from 'express';
import * as querystring from 'querystring';
import * as crypto from 'crypto';
import SpotifyApiHandler, { SpotifyUserProfile } from './spotify-api-handler';
import { SpotifyUser } from './entities';
import { SecurityNames } from '../../helpers/security';
import SpotifyTrackHandler from './spotify-track-handler';
import { securityGroups } from '../../helpers/security-groups';
import { HttpStatusCode } from 'axios';

interface SpotifyUserResponse {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  spotifyId: string;
  active: boolean;
}

@Route('spotify')
@Tags('Spotify')
export class SpotifyController extends Controller {
  public toResponse(user: SpotifyUser): SpotifyUserResponse {
    return {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      name: user.name,
      spotifyId: user.spotifyId,
      active: user.active,
    };
  }

  /**
   * Login a user via Spotify. Used to bind the returned spotify user to this server instance.
   * Performs a redirect to the Spotify website
   * @param req
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.privileged)
  @Get('login')
  public async spotifyLogin(@Request() req: ExpressRequest) {
    const response = req.res;

    const state = crypto.randomBytes(20).toString('hex');

    response?.cookie('spotifyOAuthState', state, { maxAge: 1000 * 60 * 5, signed: true });

    response?.redirect(
      `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing',
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state,
      })}`,
    );
  }

  @Security(SecurityNames.LOCAL, securityGroups.spotify.privileged)
  @Get('callback')
  public async spotifyLoginCallback(
    @Request() req: ExpressRequest,
    @Res() invalidStateResponse: TsoaResponse<HttpStatusCode.PreconditionFailed, string>,
    @Res() errorResponse: TsoaResponse<HttpStatusCode.BadRequest, string>,
    @Res() profileNotFoundResponse: TsoaResponse<HttpStatusCode.InternalServerError, string>,
    @Query() state: string,
    @Query() code?: string,
    @Query() error?: string,
  ): Promise<SpotifyUserProfile> {
    const { spotifyOAuthState } = req.signedCookies;
    if (state !== spotifyOAuthState) {
      return invalidStateResponse(HttpStatusCode.PreconditionFailed, 'Invalid state');
    }

    if (!code || error) {
      return errorResponse(HttpStatusCode.BadRequest, `Could not log in: ${error}`);
    }

    await SpotifyApiHandler.getInstance().bindSpotifyUser(code);
    const profile = await SpotifyApiHandler.getInstance().getSpotifyUserProfile();
    if (!profile) {
      return profileNotFoundResponse(
        HttpStatusCode.InternalServerError,
        `Could not find Spotify user profile.`,
      );
    }

    return profile;
  }

  // @Post('accept-user-token')
  // public async spotifyAcceptUserToken(@Body() body: AccessToken) {
  //   const sdk = SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID || '', body);
  //   await sdk.authenticate();
  // }

  /**
   * Get the currently active Spotify user.
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.base)
  @Get('user/current')
  @Response('200', 'Active user')
  @Response('204', 'No user active')
  public getCurrentSpotifyUser(): SpotifyUserResponse | undefined {
    const { user } = SpotifyApiHandler.getInstance();
    return user ? this.toResponse(user) : undefined;
  }

  /**
   * Get all existing Spotify users
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.privileged)
  @Get('users')
  public async getAllSpotifyUsers(): Promise<SpotifyUserResponse[]> {
    return (await SpotifyUser.find()).map(this.toResponse.bind(this));
  }

  /**
   * Delete an existing Spotify user
   * @param id
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.privileged)
  @Delete('users/{id}')
  public async deleteSpotifyUser(id: number) {
    const user = await SpotifyUser.findOne({ where: { id } });
    if (!user) {
      this.setStatus(404);
      return;
    }
    if (SpotifyApiHandler.getInstance().user?.id === user.id) {
      await SpotifyApiHandler.getInstance().unloadSpotifyUser();
    }
    await SpotifyUser.delete(user.id);
  }

  /**
   * Switch the currently active Spotify user to the user with the given ID
   * @param id
   * @param notFoundResponse
   * @param alreadyActiveRepsonse
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.privileged)
  @Post('users/{id}/switch')
  public async switchToSpotifyUser(
    id: number,
    @Res() notFoundResponse: TsoaResponse<HttpStatusCode.NotFound, string>,
    @Res() alreadyActiveRepsonse: TsoaResponse<HttpStatusCode.BadRequest, string>,
  ): Promise<void> {
    const user = await SpotifyUser.findOne({ where: { id } });
    if (!user) {
      return notFoundResponse(
        HttpStatusCode.NotFound,
        `Could not find SpotifyUser with id "${id}".`,
      );
    }

    const api = SpotifyApiHandler.getInstance();
    if (api.user?.id === user.id) {
      return alreadyActiveRepsonse(HttpStatusCode.BadRequest, 'User is already active.');
    }

    await api.loadSpotifyUser(user);
  }

  /**
   * Get the Spotify profile from the currently active user
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.base)
  @Get('profile')
  @Response('200', 'Active user')
  @Response('204', 'No user active')
  public async getSpotifyProfile(): Promise<SpotifyUserProfile | undefined> {
    return SpotifyApiHandler.getInstance().getSpotifyUserProfile();
  }

  /**
   * Get the currently playing track (on Spotify or locally playing). Null if nothing is playing.
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.base)
  @Get('currently-playing')
  public getSpotifyCurrentlyPlaying() {
    return SpotifyTrackHandler.getInstance().musicEmitter.getCurrentlyPlayingTrack;
  }

  /**
   * Skip the currently playing Spotify track.
   */
  @Security(SecurityNames.LOCAL, securityGroups.spotify.base)
  @Post('skip')
  public async skipSpotifyTrack(): Promise<void> {
    return SpotifyTrackHandler.getInstance().skipToNext();
  }
}
