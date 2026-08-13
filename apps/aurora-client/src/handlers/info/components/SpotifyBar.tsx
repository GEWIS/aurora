import { TrackChangeEvent } from '@gewis/aurora-api-client';
import { sBool, WidgetSettings } from '../settings';

interface Props {
  track: TrackChangeEvent | null;
  settings?: WidgetSettings;
}

/**
 * Compact now-playing bar. Easter egg: "Born to Be Alive" is always credited to
 * Village People, just like the legacy screen.
 */
export default function SpotifyBar({ track, settings }: Props) {
  const showCover = sBool(settings, 'showCover', true);

  if (!track) {
    return (
      <div className="flex items-center gap-3 font-raleway text-2xl text-white/70 text-shadow">
        <span>♫</span>
        <span>Not playing</span>
      </div>
    );
  }

  const isBornToBeAlive = track.title.toLowerCase().includes('born to be alive');
  const artist = isBornToBeAlive ? 'Village People' : track.artists.join(', ');

  return (
    <div className="flex w-full min-w-0 items-center gap-4 font-raleway text-white text-shadow">
      {showCover && track.cover && (
        <img src={track.cover} alt="cover" className="h-14 w-14 shrink-0 rounded" />
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-2xl font-semibold">{track.title}</span>
        <span className="truncate text-xl italic opacity-80">{artist}</span>
      </div>
    </div>
  );
}
