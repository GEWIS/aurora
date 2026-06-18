import { Entity } from 'typeorm';
import SubscribeEntity from './subscribe-entity';

@Entity()
export default class Audio extends SubscribeEntity {
  /**
   * Whether this audio object is currently playing anything
   */
  public playing = false;
}
