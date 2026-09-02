import { useEffect, useMemo, useState } from 'react';

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
    <div className="w-full h-full bg-black relative">
      <div
        className="absolute w-full h-full opacity-50 z-20 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url("${displayUrl}")`, filter: 'blur(1vh)' }}
      ></div>
      <div
        className="object-contain block relative z-30 h-full bg-no-repeat bg-contain bg-center"
        style={{ backgroundImage: `url("${displayUrl}")` }}
      />
    </div>
  );
}
