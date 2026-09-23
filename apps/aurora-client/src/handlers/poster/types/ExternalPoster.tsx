import { useEffect, useRef } from 'react';
import { PosterLayer, PosterStack } from '../components/PosterLayers';
import ImagePoster from './ImagePoster';

interface Props {
  url: string;
  visible: boolean;
}

export default function ExternalPoster({ url, visible }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!ref || !ref.current) return;
    ref.current.src = '';
    ref.current.src = url;
  }, [url, visible]);

  return (
    <PosterStack>
      <PosterLayer>
        <ImagePoster source="/base/avico-stuk.png" />
      </PosterLayer>
      <PosterLayer>
        <iframe
          title="External video"
          className="border-none w-full h-full overflow-hidden"
          src={url}
          seamless
          ref={ref}
        />
      </PosterLayer>
    </PosterStack>
  );
}
