import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import BaseEntity from '../../../../root/entities/base-entity';
import Poster from './poster';

@Entity()
export default class Carousel extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => CarouselPoster, (cp) => cp.carousel)
  posters: CarouselPoster[];
}

@Entity()
export class CarouselPoster extends BaseEntity {
  @ManyToOne(() => Carousel, (c) => c.posters, { onDelete: 'CASCADE' })
  carousel: Carousel;

  @ManyToOne(() => Poster, { onDelete: 'CASCADE' })
  poster: Poster;

  @Column({ nullable: true })
  customTimeout?: number;
}
