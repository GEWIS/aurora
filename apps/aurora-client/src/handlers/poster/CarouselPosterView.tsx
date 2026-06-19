import './components/index.scss';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  FooterSize,
  getPosters,
  getPosterSettings,
  PosterResponse,
  PosterScreenSettingsResponse,
} from '@gewis/aurora-api-client';
import ChangeTrackOverlay from '../../overlays/ChangeTrackOverlay';
import PosterCarousel from './components/Carousel';
import ProgressBar from './components/ProgressBar';
import { URL_CUSTOM_STYLESHEET, URL_PROGRESS_BAR_LOGO } from './constants';
import PosterWatermark from './components/PosterWatermark';

interface Props {
  socket: Socket;
}

export default function CarouselPosterView({ socket }: Props) {
  const [settings, setSettings] = useState<PosterScreenSettingsResponse | undefined>();
  const [posters, setPosters] = useState<PosterResponse[]>();
  const [borrelMode, setBorrelMode] = useState(false);
  const [posterIndex, setPosterIndex] = useState<number>();
  // ReturnType used instead of number as one of the dependencies uses @types/node as dependency
  const [posterTimeout, setPosterTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const postersRef = useRef(posters);
  postersRef.current = posters;

  const refreshPosters = async () => {
    setLoading(true);
    // TODO what to do if poster cannot be fetched?
    const newPosters = await getPosters();
    if (newPosters.response.ok && newPosters.data) {
      setPosters(newPosters.data.posters);
      setBorrelMode(newPosters.data.borrelMode);
    }
    setLoading(false);
  };

  const nextPoster = () => {
    if (!posters) {
      setPosterIndex(undefined);
    } else {
      setPosterIndex((i) => (i! + 1) % posters.length);
    }
  };

  const pausePoster = () => {
    if (posterTimeout) clearTimeout(posterTimeout);
    setPosterTimeout(null);
  };

  useEffect(() => {
    if (
      !posters ||
      posters.length === 0 ||
      posterIndex === undefined ||
      posterIndex >= posters.length
    )
      return;
    if (posterTimeout) clearTimeout(posterTimeout);

    const nextPoster = posters[posterIndex];
    const timeout = setTimeout(
      () =>
        setPosterIndex((i) => {
          const len = postersRef.current?.length ?? 0;
          return len > 0 ? (i! + 1) % len : 0;
        }),
      nextPoster.defaultTimeout * 1000,
    );
    setPosterTimeout(timeout);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterIndex]);

  useEffect(() => {
    if (posterIndex === 0) {
      refreshPosters().catch((e) => console.error(e));
    }
  }, [posterIndex]);

  useEffect(() => {
    getPosterSettings()
      .then((res) => {
        if (res.response.ok && res.data) {
          setSettings(res.data);
        }
      })
      .catch((e) => console.error(e));

    refreshPosters().catch((e) => console.error(e));

    return () => {
      if (posterTimeout) clearTimeout(posterTimeout);
    };
    // We should do this only once, in contrary what ESLint thinks we should do
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!posters || posters.length === 0 || loading) return;
    if (posterIndex === undefined || posterIndex >= posters.length) {
      setPosterIndex(Math.floor(Math.random() * posters.length));
    }
  }, [posters, loading, posterIndex]);

  useEffect(() => {
    const handleUpdatePosters = () => {
      refreshPosters().catch((e) => console.error(e));
    };

    socket.on('update_posters', handleUpdatePosters);

    return () => {
      socket.removeListener('update_posters', handleUpdatePosters);
    };
  }, [socket]);

  const selectedPoster =
    posters && posters.length > 0 && posterIndex !== undefined ? posters[posterIndex] : undefined;

  const progressBarHidden = selectedPoster?.footerSize === FooterSize.HIDDEN;
  const progressBarMinimal =
    !progressBarHidden &&
    (settings?.defaultMinimal || selectedPoster?.footerSize === FooterSize.MINIMAL);

  return (
    <>
      <div
        className="h-screen w-screen bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url("base/poster-background.png")' }}
        id="poster"
      >
        {settings?.stylesheet && <link rel="stylesheet" href={URL_CUSTOM_STYLESHEET} />}
        <div className="overflow-hidden w-full h-full">
          <PosterCarousel
            posters={posters || []}
            currentPoster={!posterIndex ? 0 : posterIndex}
            setTitle={setTitle}
          />
          <PosterWatermark
            posterIndex={posterIndex ?? -1}
            progressBarMinimal={progressBarMinimal || progressBarHidden}
            progressBarLogo={!progressBarHidden && settings?.progressBarLogo}
            borrelMode={borrelMode}
          />
          <ProgressBar
            // poster={selectedPoster}
            title={title}
            seconds={posterTimeout !== undefined ? selectedPoster?.defaultTimeout : undefined}
            posterIndex={posterIndex}
            minimal={progressBarMinimal}
            hide={progressBarHidden}
            nextPoster={nextPoster}
            pausePoster={pausePoster}
            borrelMode={borrelMode}
            logo={settings?.progressBarLogo ? URL_PROGRESS_BAR_LOGO : ''}
            progressBarColor={selectedPoster?.accentColor || settings?.defaultProgressBarColor}
            clockColor={selectedPoster?.accentColor}
            clockTick={settings?.clockShouldTick}
          />
        </div>
      </div>
      <ChangeTrackOverlay socket={socket} />
    </>
  );
}
