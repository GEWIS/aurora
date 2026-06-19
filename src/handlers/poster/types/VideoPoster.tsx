import { useEffect, useRef } from 'react';

interface Props {
  source: string | string[];
  visible: boolean;
}

export default function VideoPoster({ source, visible }: Props) {
  let sourceUrl: string | undefined;
  if (Array.isArray(source)) {
    const index = Math.floor(Math.random() * source.length);
    sourceUrl = source[index];
  } else {
    sourceUrl = source;
  }

  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (visible) {
      ref.current.currentTime = 0;
      ref.current.play().catch(console.error);
    } else {
      ref.current.pause();
    }
  }, [visible]);

  if (!sourceUrl) return <div className="w-full h-full bg-black" />;

  return (
    <video className="w-full h-full" muted loop ref={ref} controls={false}>
      <source src={sourceUrl} type="video/mp4" />
    </video>
  );
}
