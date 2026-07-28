import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import BaseEntity from '../../../../common/entities/base-entity';
import Poster from './poster';

@Entity()
export class Carousel extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => CarouselPoster, (carouselPoster) => carouselPoster.carousel)
  posters: CarouselPoster[];
}

/**
 * Join entity describing which posters belong to a carousel and in what order.
 */
@Entity()
@Unique(['carousel', 'ordering'])
@Unique(['carousel', 'poster'])
export class CarouselPoster extends BaseEntity {
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
