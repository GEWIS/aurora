import axios from 'axios';
import { HttpApiException, HttpStatusCode } from '../../../../helpers/custom-error';

interface SidecarResolvedStream {
  title: string;
  duration: number | null;
  features: {
    seekable: boolean;
    hasDuration: boolean;
    live: boolean;
  };
}

interface SidecarState {
  urls: Record<'yt' | 'screenshare', { whepUrl: string; rtspUrl: string }>;
  publisher: { running: boolean; lastError?: string };
}

export interface PublisherStatus {
  running: boolean;
  lastError: string | null;
}

export interface ResolvedStream {
  ref: string;
  title: string;
  duration: number | null;
  seekable: boolean;
  whepUrl: string;
}

export default class VideostreamService {
  private get config() {
    const baseURL = process.env.STREAM_URL;
    if (!baseURL) {
      throw new HttpApiException(
        HttpStatusCode.ServiceUnavailable,
        'Streaming is not configured.',
      );
    }

    return {
      baseURL,
      headers: { Authorization: `Bearer ${process.env.STREAM_TOKEN}` },
    };
  }

  public async resolve(url: string): Promise<ResolvedStream> {
    const { config } = this;

    const [resolved, state] = await Promise.all([
      axios
        .post<SidecarResolvedStream>('/yt/resolve', { url }, config)
        .then((res) => res.data)
        .catch((error) => {
          throw new HttpApiException(
            HttpStatusCode.BadGateway,
            `Could not resolve stream: ${axios.isAxiosError(error) ? error.message : 'unknown error'}`,
          );
        }),
      axios.get<SidecarState>('/state', config).then((res) => res.data),
    ]);

    return {
      ref: url,
      title: resolved.title,
      duration: resolved.duration,
      seekable: resolved.features.seekable,
      whepUrl: state.urls.yt.whepUrl,
    };
  }

  /**
   * Start publishing the given stream, beginning at the given offset. The sidecar
   * restarts its encoder on every call, so this doubles as the seek operation.
   * @param ref
   * @param position seconds into the media
   */
  public async play(ref: string, position: number): Promise<void> {
    await axios.post('/yt/play', { ref, position }, this.config).catch((error) => {
      throw new HttpApiException(
        HttpStatusCode.BadGateway,
        `Could not start stream: ${axios.isAxiosError(error) ? error.message : 'unknown error'}`,
      );
    });
  }

  /**
   * Stop publishing, tearing down the encoder. The resolved media stays cached
   * by the sidecar, so playing again does not require another probe.
   */
  public async stop(): Promise<void> {
    await axios.post('/yt/stop', {}, this.config).catch((error) => {
      throw new HttpApiException(
        HttpStatusCode.BadGateway,
        `Could not stop stream: ${axios.isAxiosError(error) ? error.message : 'unknown error'}`,
      );
    });
  }

  /**
   * Whether the sidecar's encoder is still publishing, and why it stopped if not.
   * Unreachable counts as not publishing; screens get nothing either way.
   */
  public async publisherStatus(): Promise<PublisherStatus> {
    try {
      const { data } = await axios.get<SidecarState>('/state', this.config);
      return { running: data.publisher.running, lastError: data.publisher.lastError ?? null };
    } catch (error) {
      return {
        running: false,
        lastError: axios.isAxiosError(error) ? error.message : 'stream sidecar is unreachable',
      };
    }
  }
}
