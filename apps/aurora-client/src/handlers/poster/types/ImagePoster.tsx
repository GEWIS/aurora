import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { PosterLayer, PosterStack } from '../components/PosterLayers';

interface Props {
  source: string | string[];
}

export default function ImagePoster({ source }: Props) {
  const [failed, setFailed] = useState(false);
  const [natural, setNatural] = useState<{ url: string; width: number; height: number }>();

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

  const imageStyle: CSSProperties | undefined =
    natural?.url === displayUrl
      ? {
          aspectRatio: `${natural.width} / ${natural.height}`,
          width: `min(100cqw, calc(100cqh * ${natural.width} / ${natural.height}))`,
          height: 'auto',
        }
      : undefined;

  return (
    <PosterStack className="bg-black">
      <PosterLayer
        className="opacity-50 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url("${displayUrl}")`, filter: 'blur(1vh)' }}
      />
      <PosterLayer className="flex items-center justify-center" style={{ containerType: 'size' }}>
        <img
          src={displayUrl}
          alt=""
          className="max-w-full max-h-full min-w-0 min-h-0 object-contain bg-black"
          style={imageStyle}
          onLoad={(e) =>
            setNatural({
              url: displayUrl,
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            })
          }
        />
      </PosterLayer>
    </PosterStack>
  );
}
