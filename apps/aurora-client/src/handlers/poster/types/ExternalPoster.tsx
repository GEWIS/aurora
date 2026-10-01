import { useEffect, useRef } from 'react';
import { PosterLayer, PosterStack } from '../components/PosterLayers';
import ImagePoster from './ImagePoster';

interface Props {
  url: string;
  visible: boolean;
}

export default function ExternalPoster({ url, visible }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const wasVisible = useRef(visible);

  // Reload the page when the poster goes off screen, so it is fresh (and already loaded)
  // the next time it is shown. Reloading when it becomes visible would show a blank frame.
  useEffect(() => {
    if (wasVisible.current && !visible && ref.current) {
      ref.current.src = '';
      ref.current.src = url;
    }
    wasVisible.current = visible;
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
