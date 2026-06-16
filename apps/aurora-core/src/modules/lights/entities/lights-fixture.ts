import { AfterLoad, Column } from 'typeorm';
import BaseEntity from '../../root/entities/base-entity';
import { RgbColor } from '../color-definitions';
import { DEFAULT_MASTER_DIMMER } from './lights-group-fixture';
import { jsonTransformer } from '../../../helpers/transformers';

export default abstract class LightsFixture extends BaseEntity {
  @Column()
  public name: string;

  @Column({ type: 'tinyint', unsigned: true })
  public nrChannels: number;

  @Column({
    type: 'varchar',
    transformer: jsonTransformer<number[]>(),
    nullable: true,
  })
  public resetChannelAndValue?: number[] | null;

  public valuesUpdatedAt: Date;

  private overrideDmx: (number | null)[];

  protected shouldFreezeDmx: boolean;

  protected frozenDmx: number[] | undefined;

  @AfterLoad()
  afterLoad() {
    this.valuesUpdatedAt = new Date();
  }

  protected shouldReset: Date | undefined;

  constructor() {
    super();

    this.overrideDmx = this.getEmptyDmxSubPacket().map(() => null);
  }

  /**
   * Reset the fixture if possible.
   * @return true if reset command can be sent. False otherwise
   */
  hardwareReset(): boolean {
    if (this.resetChannelAndValue == null || this.resetChannelAndValue.length < 2) return false;
    this.shouldReset = new Date();
    return true;
  }

  protected getMaxDate(...dates: Date[]): Date {
    const times = dates.map((d) => d.getTime());
    const maxTime = Math.max(...times);
    return new Date(maxTime);
  }
  public abstract lastUpdate(): Date;

  public abstract setColor(color: RgbColor): void;
  public abstract resetColor(): void;

  public abstract enableStrobe(milliseconds?: number): void;
  protected abstract strobeEnabled(): boolean;
  public abstract disableStrobe(): void;

  /**
   * Set the relative brightness of the fixture.
   * Should be used by effects.
   * @param brightness Value between [0, 1]
   */
  public abstract setBrightness(brightness: number): void;

  /**
   * Override any set relative DMX channels with the given values.
   * Undefined if a channel should not be overriden
   * @param relativeChannels
   */
  public setOverrideDmx(relativeChannels: (number | null)[]) {
    const safetyMargin = this.getEmptyDmxSubPacket().map(() => null);
    this.overrideDmx = relativeChannels.concat(safetyMargin).slice(0, this.nrChannels);
    this.valuesUpdatedAt = new Date();
  }

  /**
   * Clear any overrides
   */
  public clearOverrideDmx() {
    this.setOverrideDmx([]);
  }

  /**
   * Given an array of length 16 with DMX values, replace any
   * DMX channel value with its override if its not undefined
   * @param dmxValues
   * @protected
   */
  protected applyDmxOverride(dmxValues: number[]): number[] {
    return dmxValues.map((v, i): number => {
      if (this.overrideDmx[i] != null) {
        return this.overrideDmx[i] as number;
      }
      return v;
    });
  }

  /**
   * Apply a blackout to this fixture, i.e. set all channels to zero
   * @protected
   */
  public blackout(): void {
    this.valuesUpdatedAt = new Date();
  }

  /**
   * Get an array of zeroes with length equaling the number of channels
   * this fixture requires
   * @protected
   */
  protected getEmptyDmxSubPacket(): number[] {
    return new Array(this.nrChannels).fill(0);
  }

  /**
   * Get the DMX channels that should be used when the fixture should strobe
   * @protected
   */
  protected abstract getStrobeDMX(masterRelativeBrightness: number): number[];

  /**
   * Get the DMX channels that are created from the channel values
   * @protected
   */
  protected abstract getDmxFromCurrentValues(masterRelativeBrightness: number): number[];

  /**
   * Get the current DMX values as an 16-length array of integers.
   */
  toDmx(relativeBrightness: number = DEFAULT_MASTER_DIMMER): number[] {
    if (this.strobeEnabled()) return this.getStrobeDMX(relativeBrightness);

    if (this.frozenDmx != null && this.frozenDmx.length > 0) {
      return this.frozenDmx;
    }

    let values: number[] = this.getDmxFromCurrentValues(relativeBrightness);
    values = this.applyDmxOverride(values);

    if (this.shouldReset !== undefined) {
      if (new Date().getTime() - this.shouldReset.getTime() > 5000) {
        this.shouldReset = undefined;
      }
      if (this.resetChannelAndValue && this.resetChannelAndValue.length >= 2) {
        const [channel, value] = this.resetChannelAndValue;
        values[channel - 1] = value;
        this.valuesUpdatedAt = new Date();
      }
    }

    if (this.shouldFreezeDmx) {
      this.frozenDmx = values;
    }

    return values;
  }

  /**
   * Store the next state of the fixture and do not change anymore
   */
  public freezeDmx() {
    this.shouldFreezeDmx = true;
    this.valuesUpdatedAt = new Date();
  }

  /**
   * Unfreeze the DMX values
   */
  public unfreezeDmx() {
    this.shouldFreezeDmx = false;
    this.frozenDmx = [];
    this.valuesUpdatedAt = new Date();
  }
}
