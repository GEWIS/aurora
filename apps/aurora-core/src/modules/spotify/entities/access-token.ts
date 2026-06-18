import { AccessToken as SpotifyAccessToken } from '@fostertheweb/spotify-web-sdk';
import { Column } from 'typeorm';

export default class AccessToken implements SpotifyAccessToken {
  @Column()
  public access_token: string;

  @Column({ type: 'bigint', unsigned: true })
  public expires: number;

  @Column()
  public expires_in: number;

  @Column()
  public refresh_token: string;

  @Column()
  public token_type: string;
}
