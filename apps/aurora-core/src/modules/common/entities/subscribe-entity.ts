import { Column } from 'typeorm';
import BaseEntity from './base-entity';
import { SocketioNamespaces } from '../../../socketio-namespaces';
import { jsonTransformer } from '../../../helpers/transformers';

export default class SubscribeEntity extends BaseEntity {
  @Column({ nullable: true })
  public currentHandler?: string;

  @Column({ default: '' })
  public defaultHandler: string;

  @Column()
  public name: string;

  /**
   * ID of the socket connection if present.
   * Required to send events specifically and only to this entity.
   * Mapping from namespace to ID, as a websocket has a different ID
   * for each namespace its in.
   */
  // A copy should be kept in the database, because entities are only
  // in memory when they are registered to a handler.
  @Column({
    nullable: true,
    type: 'varchar',
    transformer: jsonTransformer<Partial<Record<SocketioNamespaces, string>>>(),
  })
  public socketIds?: Partial<Record<SocketioNamespaces, string>> | null;

  /**
   * Get the socket ID for the given namespace. Undefined if no connection.
   * @param namespace
   */
  public getSocketId(namespace: SocketioNamespaces): string | undefined {
    return this.socketIds ? this.socketIds[namespace] : undefined;
  }
}
