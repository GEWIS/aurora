import { useEffect, useState } from 'react';
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

const FADE_DURATION = 500;

interface Props {
  posters: PosterResponse[];
  currentPoster: number;
  setTitle: (title: string) => void;
}

export default function PosterCarousel({ posters, currentPoster, setTitle }: Props) {
  const nextPoster = (currentPoster + 1) % posters.length;

  const currentId = posters[currentPoster]?.id;
  const [shown, setShown] = useState<{ current?: number; previous?: number }>({
    current: currentId,
  });
  if (shown.current !== currentId) {
    setShown({
      current: currentId,
      previous: currentId === undefined ? undefined : shown.current,
    });
  }

  // With 3 or fewer posters none ever unmounts, so remount the one that left once it is covered
  const [generation, setGeneration] = useState<Record<number, number>>({});
  useEffect(() => {
    const id = shown.previous;
    if (id === undefined || posters.length > 3) return;
    const timeout = setTimeout(
      () => setGeneration((g) => ({ ...g, [id]: (g[id] ?? 0) + 1 })),
      FADE_DURATION,
    );
    return () => clearTimeout(timeout);
  }, [shown.previous, posters.length]);

  const renderPoster = (poster: PosterResponse, index: number) => {
    const visible = index === currentPoster || poster.id === shown.previous;
    if (!visible && index !== nextPoster) return null;

    switch (poster.type as string) {
      case 'logo':
        return <LogoPoster />;
      case 'img':
        return <ImagePoster source={poster.files.map((f) => f.location)} />;
      case 'extern':
        return <ExternalPoster url={poster.uri!} />;
      case 'video':
        return (
          <VideoPoster
            source={poster.files.map((f) => f.location)}
            visible={index === currentPoster}
          />
        );
      case 'photo':
        return (
          <PhotoPoster poster={poster} visible={index === currentPoster} setTitle={setTitle} />
        );
      case 'borrel-logo':
        return <BorrelLogoPoster />;
      case 'borrel-wall-of-shame':
        return <BorrelWallOfShamePoster visible={visible} />;
      case 'borrel-price-list':
        return <BorrelPriceListPoster visible={visible} />;
      case 'train':
        return <TrainPoster visible={visible} timeout={poster.defaultTimeout} />;
      case 'olympics':
        return <OlympicsPoster visible={visible} />;
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
      {posters.map((p, i) => {
        const isCurrent = i === currentPoster;
        const isPrevious = p.id === shown.previous;
        return (
          <div
            key={`${p.id}-${generation[p.id] ?? 0}`}
            aria-hidden={!isCurrent}
            className={`
              absolute w-full h-full top-0 left-0
              transition-opacity duration-500
              ${isCurrent || isPrevious ? 'opacity-100' : 'opacity-0'}
              ${isCurrent ? 'z-20' : isPrevious ? 'z-10' : 'z-0'}
            `}
          >
            {renderPoster(p, i)}
          </div>
        );
      })}
    </div>
  );
}
