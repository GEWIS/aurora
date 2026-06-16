import axios, { AxiosError } from 'axios';
import { HttpApiException } from '../../../../helpers/custom-error';

export interface GEWISPhotoAlbumParams {
  albumIds: number[];
}

export interface PhotoResponse {
  label: string;
  url: string;
}

export default class GEWISPosterService {
  public async getPhoto(params: GEWISPhotoAlbumParams): Promise<PhotoResponse> {
    const config = {
      headers: {
        'X-Auth-Token': process.env.GEWIS_KEY,
      },
    };

    const chosenAlbumIndex = Math.floor(Math.random() * params.albumIds.length);
    const albumId = params.albumIds[chosenAlbumIndex];

    try {
      const returnObj = (await axios.get(`https://gewis.nl/api/photo/album/${albumId}`, config))
        .data;
      const nrOfPhotos = returnObj.photos.length;
      const photo = returnObj.photos[Math.floor(Math.random() * nrOfPhotos)];

      return {
        label: returnObj.album.name,
        url: `https://gewis.nl/data/${photo.path}`,
      };
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status && e.response.status < 500) {
        throw new HttpApiException(e.response.status, e.response.statusText);
      }
      throw e;
    }
  }
}
