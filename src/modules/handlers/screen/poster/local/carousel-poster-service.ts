import { Repository } from 'typeorm';
import Carousel from './local-carousel';
import dataSource from '../../../../../database';

/**
 * Id of the single carousel currently in use. Once multiple carousels are
 * supported this hardcoded value can be replaced by a real selection.
 */
export const CAROUSEL_ID = 1;

export default class CarouselPosterService {
  private repo: Repository<Carousel>;

  constructor() {
    this.repo = dataSource.getRepository(Carousel);
  }

  /**
   * Returns the ordered poster IDs of the given carousel.
   * @param carouselId The id of the carousel to read.
   */
  public async getOrder(carouselId: number): Promise<number[]> {
    const carousel = await this.repo.findOne({ where: { id: carouselId } });
    // TypeORM's 'simple-array' deserializes to strings, so coerce back to numbers.
    return (carousel?.posterOrder ?? []).map(Number);
  }

  /**
   * Persists the given ordered poster IDs on the given carousel, creating it if needed.
   * @param carouselId The id of the carousel to write.
   * @param posterIds The poster IDs in the desired display order.
   */
  public async setOrder(carouselId: number, posterIds: number[]): Promise<void> {
    const carousel =
      (await this.repo.findOne({ where: { id: carouselId } })) ??
      this.repo.create({ id: carouselId, name: 'default' });
    carousel.posterOrder = posterIds;
    await this.repo.save(carousel);
  }
}
