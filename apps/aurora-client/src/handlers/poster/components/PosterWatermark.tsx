import { LogoLine } from '../../../components/aurora-logos/LogoLine';

interface Props {
  posterIndex: number;
  progressBarMinimal?: boolean;
  progressBarLogo?: boolean;
  borrelMode?: boolean;
}

export default function PosterWatermark({ posterIndex, progressBarMinimal, progressBarLogo, borrelMode }: Props) {
  if (posterIndex !== 0) return null;

  const hasLogo = progressBarLogo || borrelMode;
  const bottomLeftCornerEmpty = !hasLogo && progressBarMinimal;

  return (
    <div
      className={`absolute bottom-0 left-0 opacity-50 z-50 ${bottomLeftCornerEmpty ? 'mb-4' : 'mb-24'}`}
      id="aurora-watermark"
    >
      <LogoLine variant="left" size="2rem" dark />
    </div>
  );
}
