import { useMemo } from 'react';

interface Props {
  source: string | string[];
}

export default function ImagePoster({ source }: Props) {
  const sourceUrl = useMemo(() => {
    if ((Array.isArray(source) && source.length === 0) || source === '') {
      return '/base/avico-stuk.png';
    } else if (Array.isArray(source)) {
      const index = Math.floor(Math.random() * source.length);
      return source[index];
    }
    return source;
  }, [source]);

  return (
    <div className="w-full h-full bg-black relative">
      <div
        className="absolute w-full h-full opacity-50 z-20 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url("${sourceUrl}")`, filter: 'blur(1vh)' }}
      ></div>
      <div
        className="object-contain block relative z-30 h-full bg-no-repeat bg-contain bg-center"
        style={{ backgroundImage: `url("${sourceUrl}")` }}
      />
    </div>
  );
}
