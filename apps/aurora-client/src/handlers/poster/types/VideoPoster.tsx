import { useEffect, useRef } from 'react';
import useRandomPick from '../useRandomPick';

interface Props {
  source: string | string[];
  visible: boolean;
}

export default function VideoPoster({ source, visible }: Props) {
  const sourceUrl = useRandomPick(source);

  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (visible) {
      ref.current.currentTime = 0;
      ref.current.play().catch(console.error);
    } else {
      ref.current.pause();
    }
  }, [visible, sourceUrl]);

  if (!sourceUrl) return <div className="w-full h-full bg-black" />;

  return (
    <video key={sourceUrl} className="w-full h-full bg-black" muted loop ref={ref} controls={false}>
      <source src={sourceUrl} type="video/mp4" />
    </video>
  );
}
