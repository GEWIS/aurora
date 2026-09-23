import { useEffect, useMemo, useState } from 'react';
import { PosterLayer, PosterStack } from '../components/PosterLayers';

interface Props {
  source: string | string[];
}

export default function ImagePoster({ source }: Props) {
  const [failed, setFailed] = useState(false);

  const sourceUrl = useMemo(() => {
    if ((Array.isArray(source) && source.length === 0) || source === '') {
      return '/base/avico-stuk.png';
    } else if (Array.isArray(source)) {
      const index = Math.floor(Math.random() * source.length);
      return source[index];
    }
    return source;
  }, [source]);

  useEffect(() => {
    setFailed(false);

    const image = new Image();
    image.onerror = () => setFailed(true);
    image.src = sourceUrl;

    return () => {
      image.onerror = null;
    };
  }, [sourceUrl]);

  const displayUrl = failed ? '/base/avico-stuk.png' : sourceUrl;

  return (
    <PosterStack className="bg-black">
      <PosterLayer
        className="opacity-50 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url("${displayUrl}")`, filter: 'blur(1vh)' }}
      />
      <PosterLayer
        className="bg-no-repeat bg-contain bg-center"
        style={{ backgroundImage: `url("${displayUrl}")` }}
      />
    </PosterStack>
  );
}
