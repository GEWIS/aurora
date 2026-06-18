import { Column, Entity } from 'typeorm';
import SubscribeEntity from './subscribe-entity';

@Entity()
export default class Screen extends SubscribeEntity {
  /**
   * Display scale factor. Defaults to 1 (1920x1080)
   */
  @Column({ nullable: false, default: 1 })
  scaleFactor: number;
}
