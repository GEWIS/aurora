import { Entity } from 'typeorm';
import SubscribeEntity from './subscribe-entity';

@Entity()
export default class LightsController extends SubscribeEntity {}
