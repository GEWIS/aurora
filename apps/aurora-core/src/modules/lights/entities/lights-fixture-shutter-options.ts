import { BaseEntity, Column, PrimaryColumn } from 'typeorm';

export enum ShutterOption {
  OPEN = 'open',
  STROBE = 'strobe',
}
export default class LightsFixtureShutterOptions extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  public shutterOption: ShutterOption;

  @Column({ type: 'tinyint', unsigned: true })
  public channelValue: number;
}
