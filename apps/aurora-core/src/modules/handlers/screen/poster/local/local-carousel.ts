import { Entity, Column, OneToMany } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import CarouselPoster from './local-carousel-poster';

@Entity()
export default class Carousel extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => CarouselPoster, (carouselPoster) => carouselPoster.carousel)
  posters: CarouselPoster[];
}
