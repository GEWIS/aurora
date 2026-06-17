import Carousel from './local-carousel';
import CarouselPoster from './local-carousel-poster';
import dataSource from '../../../../../database';

/**
 * Id of the single carousel currently in use. Once multiple carousels are
 * supported this hardcoded value can be replaced by a real selection.
 */
export const CAROUSEL_ID = 1;

export default class CarouselPosterService {
  /**
   * Returns the ordered poster IDs of the given carousel.
   * @param carouselId The id of the carousel to read.
   */
  public async getOrder(carouselId: number): Promise<number[]> {
    const rows = await dataSource.getRepository(CarouselPoster).find({
      where: { carousel: { id: carouselId } },
      order: { ordering: 'ASC' },
      loadRelationIds: true,
    });
    return rows.map((row) => row.poster as unknown as number);
  }

  /**
   * Persists the given ordered poster IDs on the given carousel, creating it if needed.
   * @param carouselId The id of the carousel to write.
   * @param posterIds The poster IDs in the desired display order.
   */
  public async setOrder(carouselId: number, posterIds: number[]): Promise<void> {
    await dataSource.transaction(async (manager) => {
      const carouselRepo = manager.getRepository(Carousel);
      const carousel =
        (await carouselRepo.findOne({ where: { id: carouselId } })) ??
        (await carouselRepo.save(carouselRepo.create({ id: carouselId, name: 'default' })));

      const repo = manager.getRepository(CarouselPoster);
      await repo.delete({ carousel: { id: carousel.id } });
      if (posterIds.length > 0) {
        await repo.insert(
          posterIds.map((posterId, ordering) => ({
            carousel: { id: carousel.id },
            poster: { id: posterId },
            ordering,
          })),
        );
      }
    });
  }
}
