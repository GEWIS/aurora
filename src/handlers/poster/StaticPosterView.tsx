import { Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import {
  getPosterSettings,
  getStaticPosterHandlerState,
  PosterResponse,
  PosterScreenSettingsResponse,
  StaticPosterHandlerState,
} from '../../api';
import BackgroundStarryNight from '../../components/backgrounds/StarryNight';
import { LogoCentered } from '../../components/aurora-logos/LogoCentered';
import ChangeTrackOverlay from '../../overlays/ChangeTrackOverlay';
import ImagePoster from './types/ImagePoster';
import VideoPoster from './types/VideoPoster';
import ExternalPoster from './types/ExternalPoster';
import LogoPoster from './types/LogoPoster';
import BorrelLogoPoster from './types/BorrelLogoPoster';
import BorrelPriceListPoster from './types/BorrelPriceListPoster';
import BorrelWallOfShamePoster from './types/BorrelWallOfShame';
import TrainPoster from './types/TrainPoster';
import OlympicsPoster from './types/OlympicsPoster';
import ProgressBar from './components/ProgressBar';
import { URL_CUSTOM_STYLESHEET, URL_PROGRESS_BAR_LOGO } from './constants';

interface Props {
  socket: Socket;
}

export default function StaticPosterView({ socket }: Props) {
  const [settings, setSettings] = useState<PosterScreenSettingsResponse | undefined>();
  const [activePoster, setActivePoster] = useState<PosterResponse | null>(null);
  const [clock, setClock] = useState(false);

  const handlePosterChange = (payload: StaticPosterHandlerState) => {
    setActivePoster(payload.activePoster);
    setClock(payload.clockVisible);
  };

  useEffect(() => {
    getPosterSettings()
      .then((res) => {
        if (res.response.ok && res.data) {
          setSettings(res.data);
        }
      })
      .catch((e) => console.error(e));

    getStaticPosterHandlerState()
      .then((res) => {
        if (res.response.ok && res.data) {
          handlePosterChange(res.data);
        }
      })
      .catch((e) => console.error(e));

    const handlePosterChangeEvent = (payload: StaticPosterHandlerState[]) => handlePosterChange(payload[0]);

    socket.on('update_static_poster', handlePosterChangeEvent);

    return () => {
      socket.removeListener('update_static_poster', handlePosterChangeEvent);
    };
  }, [socket]);

  const renderDefaultScreen = () => {
    let color: string;
    if (
      settings &&
      settings.defaultProgressBarColor &&
      settings.defaultProgressBarColor !== '#ffffff' &&
      settings.defaultProgressBarColor !== '#fff'
    ) {
      color = settings.defaultProgressBarColor;
    } else {
      color = 'orange';
    }
    return (
      <div className="absolute top-0 w-full h-full">
        <BackgroundStarryNight backgroundColor={color}>
          <div className="w-full h-full flex justify-center items-center">
            <LogoCentered size="5rem" />
          </div>
        </BackgroundStarryNight>
      </div>
    );
  };

  const renderPoster = () => {
    if (!activePoster) return renderDefaultScreen();

    switch (activePoster.type as string) {
      case 'logo':
        return <LogoPoster />;
      case 'img':
        return <ImagePoster source={activePoster.files.map((f) => f.location)} />;
      case 'extern':
        return <ExternalPoster url={activePoster.uri!} visible />;
      case 'video':
        return <VideoPoster source={activePoster.files.map((f) => f.location)} visible />;
      case 'borrel-logo':
        return <BorrelLogoPoster />;
      case 'borrel-wall-of-shame':
        return <BorrelWallOfShamePoster visible />;
      case 'borrel-price-list':
        return <BorrelPriceListPoster visible />;
      case 'train':
        return <TrainPoster visible timeout={activePoster.defaultTimeout} />;
      case 'olympics':
        return <OlympicsPoster visible />;
      default:
        return renderDefaultScreen();
    }
  };

  return (
    <>
      <div className="relative w-screen h-screen" id="poster">
        {/* Custom stylesheet should be imported AFTER the base stylesheet,
        because the precedence is that the last CSS definition will be used */}
        {settings?.stylesheet && <link rel="stylesheet" href={URL_CUSTOM_STYLESHEET} />}
        <div className="overflow-hidden absolute w-full h-full">{renderPoster()}</div>
        <ProgressBar
          logo={settings?.progressBarLogo ? URL_PROGRESS_BAR_LOGO : ''}
          clockTick={settings?.clockShouldTick}
          minimal={settings?.defaultMinimal}
          hide={!clock}
        />
      </div>
      <ChangeTrackOverlay socket={socket} />
    </>
  );
}
