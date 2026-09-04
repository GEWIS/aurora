import { sStr, WidgetSettings } from '../settings';

interface Props {
  settings?: WidgetSettings;
}

/** A plain configurable image widget (cover/contain). */
export default function ImageWidget({ settings }: Props) {
  const url = sStr(settings, 'url', '');
  const fit = sStr(settings, 'fit', 'cover');

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center font-raleway text-2xl text-white/50">
        No image
      </div>
    );
  }

  return (
    <div
      className="h-full w-full bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${JSON.stringify(url)})`,
        backgroundSize: fit === 'contain' ? 'contain' : 'cover',
      }}
    />
  );
}
