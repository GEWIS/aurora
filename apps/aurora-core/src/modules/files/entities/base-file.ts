import { Column, Entity } from 'typeorm';
import BaseEntity from '../../root/entities/base-entity';

export interface IFile {
  /**
   * In which directory on disk (relative to the root directory) this file is stored
   */
  relativeDirectory: string;
  /**
   * Name of the file on disk
   */
  name: string;
  /**
   * Original name of the file
   */
  originalName: string;
}

export default class BaseFile implements IFile {
  @Column()
  public relativeDirectory: string;

  @Column()
  public name: string;

  @Column()
  public originalName: string;
}

@Entity()
export class File extends BaseEntity implements IFile {
  @Column()
  public relativeDirectory: string;

  @Column()
  public name: string;

  @Column()
  public originalName: string;
}
