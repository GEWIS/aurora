import { Repository } from 'typeorm';
import { Audio } from './entities';
import dataSource from '../../database';
import AuthService from '../auth/auth-service';

export interface AudioResponse extends Pick<
  Audio,
  'id' | 'createdAt' | 'updatedAt' | 'name' | 'socketIds'
> {}

export interface AudioCreateParams extends Pick<Audio, 'name' | 'defaultHandler'> {}

export default class RootAudioService {
  private repository: Repository<Audio>;

  constructor() {
    this.repository = dataSource.getRepository(Audio);
  }

  public static toAudioResponse(audio: Audio): AudioResponse {
    return {
      id: audio.id,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
      name: audio.name,
      socketIds: audio.socketIds,
    };
  }

  public async getAllAudios(): Promise<Audio[]> {
    return this.repository.find();
  }

  public async getSingleAudio(id: number): Promise<Audio | null> {
    return this.repository.findOne({ where: { id } });
  }

  public async createAudio(params: AudioCreateParams): Promise<Audio> {
    const audio = await this.repository.save({
      name: params.name,
      defaultHandler: params.defaultHandler,
    });
    await new AuthService().createApiKey({ audio });
    return audio;
  }
}
