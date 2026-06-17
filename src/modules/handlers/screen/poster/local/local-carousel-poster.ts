import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import Carousel from './local-carousel';
import Poster from './poster';

/**
 * Join entity describing which posters belong to a carousel and in what order.
 */
@Entity()
@Unique(['carousel', 'ordering'])
@Unique(['carousel', 'poster'])
export default class CarouselPoster extends BaseEntity {
  @ManyToOne(() => Carousel, (carousel) => carousel.posters, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  carousel: Carousel;

  @ManyToOne(() => Poster, { nullable: false, onDelete: 'CASCADE' })
  poster: Poster;

  @Column()
  ordering: number;
}
