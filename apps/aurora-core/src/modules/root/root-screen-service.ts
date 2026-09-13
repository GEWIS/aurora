import { Repository } from 'typeorm';
import { Screen } from './entities';
import { getDataSource } from '../../database';
import AuthService from '../auth/auth-service';

export interface ScreenResponse extends Pick<
  Screen,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'socketIds' | 'scaleFactor'
> {}

export interface ScreenCreateParams extends Pick<
  Screen,
  'name' | 'defaultHandler' | 'scaleFactor'
> {}

export default class RootScreenService {
  private get repository(): Repository<Screen> {
    return getDataSource().getRepository(Screen);
  }

  public static toScreenResponse(screen: Screen): ScreenResponse {
    return {
      id: screen.id,
      createdAt: screen.createdAt,
      updatedAt: screen.updatedAt,
      name: screen.name,
      socketIds: screen.socketIds,
      scaleFactor: screen.scaleFactor,
    };
  }

  public async getAllScreens(): Promise<Screen[]> {
    return this.repository.find();
  }

  public async getSingleScreen(id: number): Promise<Screen | null> {
    return this.repository.findOne({ where: { id } });
  }

  public async createScreen(params: ScreenCreateParams): Promise<Screen> {
    const screen = await this.repository.save(params);
    await new AuthService().createApiKey({ screen });
    return screen;
  }
}
