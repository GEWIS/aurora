import {
  AccessToken,
  ProvidedAccessTokenStrategy,
  SpotifyApi,
  UserProfile,
} from '@fostertheweb/spotify-web-sdk';
import { Repository } from 'typeorm';
import { SpotifyUser } from './entities';
import dataSource from '../../database';
import logger from '../../logger';

export interface SpotifyUserProfile extends UserProfile {}

export default class SpotifyApiHandler {
  private static instance: SpotifyApiHandler;

  private initialized = false;

  private sdk: SpotifyApi | undefined;

  private currentUser: SpotifyUser | undefined;

  private repository: Repository<SpotifyUser>;

  constructor() {
    this.repository = dataSource.getRepository(SpotifyUser);
  }

  public async init() {
    if (this.initialized) throw new Error('SpotifyApiHandler is already initialized!');
    const user = await this.repository.findOne({ where: { active: true } });
    if (user) {
      try {
        await this.loadSpotifyUser(user);
        logger.info('Spotify initialized!');
      } catch (e) {
        logger.error(`Could not load Spotify user: ${e}`);
      }
    } else {
      logger.info('No Spotify user found. Please log in to use Spotify API integration.');
    }
    this.initialized = true;
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new SpotifyApiHandler();
    }
    return this.instance;
  }

  /**
   * Custom function to refresh the Spotify access token,
   * primarily to also include the private key in the header
   * @param clientId
   * @param accessToken
   * @private
   */
  private static async refreshAccessToken(
    clientId: string,
    accessToken: AccessToken,
  ): Promise<AccessToken> {
    const content: { [key: string]: string } = {
      grant_type: 'refresh_token',
      refresh_token: accessToken.refresh_token,
    };

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams(content),
      headers: {
        Authorization: `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`Could not get access token: ${json.error}`);

    const token = json as AccessToken;

    if (token.expires && token.expires === -1) {
      return token;
    }

    return {
      ...token,
      expires: Date.now() + token.expires_in * 1000,
      // A (new) refresh token is not returned, so reuse the old to make a correct AccessToken
      refresh_token: accessToken.refresh_token,
    };
  }

  /**
   * Create an Authorization Code flow API client that automatically refreshes tokens
   * @param accessToken
   * @private
   */
  private createSdk(accessToken: AccessToken): SpotifyApi {
    const strategy = new ProvidedAccessTokenStrategy(
      process.env.SPOTIFY_CLIENT_ID || '',
      accessToken,
      SpotifyApiHandler.refreshAccessToken,
    );
    return new SpotifyApi(strategy);
  }

  /**
   * Get a Spotify API access token for the given Spotify user
   * @private
   * @param code
   */
  public static async getAccessToken(code: string): Promise<AccessToken> {
    const content: { [key: string]: string } = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
    };

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams(content),
      headers: {
        Authorization: `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`Could not get access token: ${json.error}`);

    return json;
  }

  private async updateUserReference(newUser: SpotifyUser) {
    if (this.currentUser) {
      this.currentUser.active = false;
      await this.repository.save(this.currentUser);
    }

    this.currentUser = newUser;
    if (!this.currentUser.active) {
      this.currentUser.active = true;
      await this.repository.save(this.currentUser);
    }
  }

  /**
   * Stop watching the current active user
   */
  public async unloadSpotifyUser() {
    if (this.sdk) this.sdk = undefined;
    if (this.currentUser) {
      this.currentUser.active = false;
      await this.repository.save(this.currentUser);
      this.currentUser = undefined;
    }
  }

  /**
   * Make the given user the currently active user
   * @param spotifyUser
   */
  public async loadSpotifyUser(spotifyUser: SpotifyUser) {
    let accessToken: AccessToken;
    if (new Date().getTime() + 5000 > spotifyUser.token.expires) {
      // Token has expired, so let's get a new one
      accessToken = await SpotifyApiHandler.refreshAccessToken('', spotifyUser.token);
    } else {
      accessToken = spotifyUser.token;
    }

    await this.unloadSpotifyUser();

    this.sdk = this.createSdk(accessToken);

    const newToken = await this.sdk.getAccessToken();
    if (newToken) {
      spotifyUser.setToken(newToken);
      // eslint-disable-next-line no-param-reassign
      spotifyUser.active = true;
      await this.repository.save(spotifyUser);
      this.currentUser = spotifyUser;
    }

    await this.updateUserReference(spotifyUser);
  }

  /**
   * Given an authorization code, find or create its SpotifyUser and authenticate the sdk
   * @param code
   */
  public async bindSpotifyUser(code: string) {
    const accessToken = await SpotifyApiHandler.getAccessToken(code);

    this.sdk = this.createSdk(accessToken);
    const profile = await this.sdk.currentUser.profile();

    let spotifyUser = await this.repository.findOne({ where: { spotifyId: profile.id } });
    if (spotifyUser == null) {
      spotifyUser = await this.repository.save({
        spotifyId: profile.id,
        name: profile.display_name,
        token: {
          ...accessToken,
          expires: accessToken.expires || new Date().getTime() + accessToken.expires_in * 1000,
        },
        active: true,
      } as SpotifyUser);
    } else if (accessToken.refresh_token) {
      // SpotifyUser exists and we have a (new) refresh token
      spotifyUser.setToken(accessToken);
      await this.repository.save(spotifyUser);
    }

    await this.updateUserReference(spotifyUser);

    return spotifyUser;
  }

  public get client() {
    return this.sdk;
  }

  public get user() {
    return this.currentUser;
  }

  public async getSpotifyUserProfile(): Promise<SpotifyUserProfile | undefined> {
    return this.client?.currentUser.profile();
  }
}
