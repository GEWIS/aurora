import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
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
  @Column()
  carouselId: number;

  @ManyToOne(() => Carousel, (carousel) => carousel.posters, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'carouselId' })
  carousel: Carousel;

  @Column()
  posterId: number;

  @ManyToOne(() => Poster, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'posterId' })
  poster: Poster;

  @Column()
  ordering: number;
}
