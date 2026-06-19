import { useEffect, useRef } from 'react';
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
    <div className="w-full h-full relative">
      <ImagePoster source="/base/avico-stuk.png" />
      <iframe
        title="External video"
        className="border-none w-full h-full overflow-hidden absolute top-0 z-30"
        src={url}
        seamless
        ref={ref}
      />
    </div>
  );
}
