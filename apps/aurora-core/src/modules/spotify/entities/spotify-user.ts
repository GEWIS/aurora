import { Column, Entity } from 'typeorm';
import { AccessToken as SpotifyAccessToken } from '@fostertheweb/spotify-web-sdk';
import BaseEntity from '../../root/entities/base-entity';
import AccessToken from './access-token';

@Entity()
export default class SpotifyUser extends BaseEntity {
  @Column()
  public spotifyId: string;

  @Column()
  public name: string;

  @Column(() => AccessToken)
  public token: AccessToken;

  /**
   * Whether this account is currently active
   */
  @Column()
  public active: boolean;

  /**
   * Set the last known Spotify spotify access token for this user
   * @param token Spotify access token
   */
  public setToken(token: SpotifyAccessToken) {
    this.token = {
      ...token,
      expires: token.expires || new Date().getTime() + token.expires_in * 1000,
    };
  }
}
