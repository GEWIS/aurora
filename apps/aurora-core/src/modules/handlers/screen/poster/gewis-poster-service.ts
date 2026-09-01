import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpApiException, HttpStatusCode } from '../../../../helpers/custom-error';

export interface GEWISPhotoAlbumParams {
  albumIds: number[];
}

export interface PhotoResponse {
  label: string;
  url: string;
}

export interface PhotoImage {
  buffer: Buffer;
  contentType: string;
}

const GEWIS_PHOTOS_API = 'https://gewis.nl/api/photos';

const PHOTO_VARIANT = 'w1920';
const MAX_RENDITION_ATTEMPTS = 3;
const RENDITION_RETRY_MS = 1000;
const MAX_RENDITION_WAIT_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class GEWISPosterService {
  private config(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        Authorization: `Bearer ${process.env.GEWIS_KEY}`,
        'X-Api-Version': '5.0.0',
      },
    };
  }

  private async randomPhotoId(albumId: number): Promise<number> {
    const photos: { id: number }[] = (
      await axios.get(
        `${GEWIS_PHOTOS_API}/albums/${albumId}/photos?page=1&itemsPerPage=500`,
        this.config(),
      )
    ).data.data;

    if (photos.length === 0) {
      throw new HttpApiException(HttpStatusCode.NotFound, `Album ${albumId} contains no photos`);
    }

    return photos[Math.floor(Math.random() * photos.length)].id;
  }

  public async getPhoto(params: GEWISPhotoAlbumParams): Promise<PhotoResponse> {
    const albumId = params.albumIds[Math.floor(Math.random() * params.albumIds.length)];

    try {
      const photoId = await this.randomPhotoId(albumId);
      const album = (await axios.get(`${GEWIS_PHOTOS_API}/albums/${albumId}`, this.config())).data
        .data;

      return {
        label: album.name,
        url: `/api/handler/screen/poster/carousel/photo/${photoId}`,
      };
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status && e.response.status < 500) {
        throw new HttpApiException(e.response.status, e.response.statusText);
      }
      throw e;
    }
  }

  /*
  The retry loop is temporary while the generation of photo renditions is running. This will become
  obsolete but harmless later.
   */
  public async getPhotoImage(photoId: number): Promise<PhotoImage> {
    for (let attempt = 0; attempt < MAX_RENDITION_ATTEMPTS; attempt++) {
      try {
        const response = await axios.get(
          `${GEWIS_PHOTOS_API}/${photoId}/image/${PHOTO_VARIANT}`,
          this.config({ responseType: 'arraybuffer' }),
        );

        return {
          buffer: Buffer.from(response.data),
          contentType: (response.headers['content-type'] as string) ?? 'application/octet-stream',
        };
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === HttpStatusCode.ServiceUnavailable) {
          if (attempt === MAX_RENDITION_ATTEMPTS - 1) break;

          // Retry is bounded by MAX_WAIT as the API changing this number to a large amount would
          // mess things up.
          const retryAfter = Number(e.response.headers?.['retry-after']) * 1000;
          await sleep(
            retryAfter ? Math.min(retryAfter, MAX_RENDITION_WAIT_MS) : RENDITION_RETRY_MS,
          );
          continue;
        }
        if (e instanceof AxiosError && e.response?.status && e.response.status < 500) {
          throw new HttpApiException(e.response.status, e.response.statusText);
        }
        throw e;
      }
    }

    throw new HttpApiException(HttpStatusCode.ServiceUnavailable);
  }
}
