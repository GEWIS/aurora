import { useEffect, useMemo } from 'react';
import { PosterResponse, PosterType } from '@gewis/aurora-api-client';
import LogoPoster from '../types/LogoPoster';
import ImagePoster from '../types/ImagePoster';
import ExternalPoster from '../types/ExternalPoster';
import VideoPoster from '../types/VideoPoster';
import PhotoPoster from '../types/PhotoPoster';
import BorrelLogoPoster from '../types/BorrelLogoPoster';
import BorrelWallOfShamePoster from '../types/BorrelWallOfShame';
import BorrelPriceListPoster from '../types/BorrelPriceListPoster';
import TrainPoster from '../types/TrainPoster';
import OlympicsPoster from '../types/OlympicsPoster';

interface Props {
  posters: PosterResponse[];
  currentPoster: number;
  setTitle: (title: string) => void;
}

export default function PosterCarousel({ posters, currentPoster, setTitle }: Props) {
  const previousPoster = useMemo(
    () => (currentPoster - 1 + posters.length) % posters.length,
    [currentPoster, posters.length],
  );
  const nextPoster = useMemo(
    () => (currentPoster + 1) % posters.length,
    [currentPoster, posters.length],
  );

  const renderPoster = (poster: PosterResponse, index: number) => {
    if (index !== previousPoster && index !== currentPoster && index !== nextPoster) return null;

    const visible = index === currentPoster || index === previousPoster;

    switch (poster.type as string) {
      case 'logo':
        return <LogoPoster key={poster.name} />;
      case 'img':
        return <ImagePoster key={poster.name} source={poster.files.map((f) => f.location)} />;
      case 'extern':
        return <ExternalPoster key={poster.name} url={poster.uri!} visible={visible} />;
      case 'video':
        return (
          <VideoPoster
            key={poster.name}
            source={poster.files.map((f) => f.location)}
            visible={index === currentPoster}
          />
        );
      case 'photo':
        return (
          <PhotoPoster
            key={poster.name}
            poster={poster}
            visible={index === currentPoster}
            setTitle={setTitle}
          />
        );
      case 'borrel-logo':
        return <BorrelLogoPoster key={poster.name} />;
      case 'borrel-wall-of-shame':
        return <BorrelWallOfShamePoster key={poster.name} visible={visible} />;
      case 'borrel-price-list':
        return <BorrelPriceListPoster key={poster.name} visible={visible} />;
      case 'train':
        return <TrainPoster key={poster.name} visible={visible} timeout={poster.defaultTimeout} />;
      case 'olympics':
        return <OlympicsPoster key={poster.name} visible={visible} />;
      default:
        return <div>{poster.type}</div>;
    }
  };

  useEffect(() => {
    const poster = posters[currentPoster];
    if (poster && poster.type !== PosterType.PHOTO) {
      setTitle(poster.label ?? '');
    }
  }, [posters, currentPoster, setTitle]);

  return (
    <div className="w-full h-full top-0 left-0">
      {posters.map((p, i) => (
        <div
          key={i}
          className={`
            absolute w-full h-full top-0 left-0
            transition-opacity duration-500
            ${[previousPoster, currentPoster].includes(i) ? 'opacity-100' : 'opacity-0'}
            ${i === currentPoster ? 'z-20' : i === previousPoster ? 'z-10' : 'z-0'}
          `}
        >
          {renderPoster(p, i)}
        </div>
      ))}
    </div>
  );
}
