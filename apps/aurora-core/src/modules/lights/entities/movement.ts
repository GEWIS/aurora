import { Column } from 'typeorm';

export interface IMovement {
  panChannel: number;
  finePanChannel?: number | null;
  tiltChannel: number;
  fineTiltChannel?: number | null;
  movingSpeedChannel?: number | null;
}

export default class Movement implements IMovement {
  @Column({ type: 'tinyint', unsigned: true })
  public panChannel: number;

  @Column({ type: 'real', unsigned: true, default: 0 })
  public basePanValue: number;

  @Column({ default: false })
  public mirrorPan?: boolean;

  @Column({ type: 'tinyint', nullable: true, unsigned: true })
  public finePanChannel?: number | null;

  @Column({ type: 'tinyint', unsigned: true })
  public tiltChannel: number;

  @Column({ default: false })
  public mirrorTilt?: boolean;

  @Column({ type: 'tinyint', nullable: true, unsigned: true })
  public fineTiltChannel?: number | null;

  @Column({ type: 'tinyint', nullable: true, unsigned: true })
  public movingSpeedChannel?: number | null;

  private valuesUpdatedAt = new Date();

  private currentValues: Required<IMovement> = {
    panChannel: 0,
    finePanChannel: 0,
    tiltChannel: 0,
    fineTiltChannel: 0,
    movingSpeedChannel: 0,
  };

  /**
   * When the moving head's position has last changed
   */
  public lastUpdate(): Date {
    return this.valuesUpdatedAt;
  }

  /**
   * @param panFactor value between [0, 1]
   * @param tiltFactor value between [0, 1]
   */
  public setPositionRel(panFactor: number, tiltFactor: number) {
    this.valuesUpdatedAt = new Date();

    // Calculate the pan given the base pan value and whether the pan should be mirrored
    let relativePan = panFactor;
    if (this.mirrorPan) relativePan = 1 - relativePan;
    relativePan = relativePan + this.basePanValue;

    // Calculate the tilt, whether the tilt should be mirrored
    let relativeTilt = tiltFactor;
    if (this.mirrorTilt) relativeTilt = 1 - relativeTilt;

    // Pan should be 360 degrees: we assume here that a moving head
    // can rotate 540 degrees (1.5 rounds)
    const pan = relativePan * 170;
    const tilt = relativeTilt * 255;
    const panChannel = Math.floor(pan);
    const tiltChannel = Math.floor(tilt);
    const finePanChannel = Math.floor((pan - panChannel) * 255);
    const fineTiltChannel = Math.floor((tilt - tiltChannel) * 255);

    this.currentValues = {
      panChannel,
      finePanChannel,
      tiltChannel,
      fineTiltChannel,
      movingSpeedChannel: 0,
    };
  }

  /**
   * @param pan value between [0, 255). Any decimals are applied to the finePan
   * @param tilt value between [0, 255). Any decimals are applied to the fineTilt
   * @deprecated
   */
  public setPositionAbs(pan: number, tilt: number) {
    return this.setPositionRel(pan / 255, tilt / 255);
  }

  /**
   * Reset the moving head to its initial position
   */
  public reset() {
    this.valuesUpdatedAt = new Date();

    this.currentValues = {
      panChannel: 0,
      finePanChannel: 0,
      tiltChannel: 0,
      fineTiltChannel: 0,
      movingSpeedChannel: 0,
    };
  }

  private get channelValues() {
    return this.currentValues;
  }

  public setPositionInDmx(values: number[]): number[] {
    values[this.panChannel - 1] = this.channelValues.panChannel;
    if (this.finePanChannel != null) {
      values[this.finePanChannel] = this.channelValues.finePanChannel || 0;
    }
    values[this.tiltChannel - 1] = this.channelValues.tiltChannel;
    if (this.fineTiltChannel != null) {
      values[this.fineTiltChannel - 1] = this.channelValues.fineTiltChannel || 0;
    }
    if (this.movingSpeedChannel != null) {
      values[this.movingSpeedChannel - 1] = this.channelValues.movingSpeedChannel || 0;
    }
    return values;
  }
}
