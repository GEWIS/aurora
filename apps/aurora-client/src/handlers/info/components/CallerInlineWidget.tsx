import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { sStr, WidgetSettings } from '../settings';
import { CallerEvent } from './CallerOverlay';

interface Props {
  caller: CallerEvent | null;
  settings?: WidgetSettings;
}

/**
 * Inline caller display (as opposed to the fullscreen overlay): shows the
 * current caller's photo + name while ringing, or an idle message otherwise.
 * Pairs well as a status-stack background triggered on incoming calls.
 */
export default function CallerInlineWidget({ caller, settings }: Props) {
  const idleText = sStr(settings, 'idleText', 'No incoming calls');

  if (!caller?.ringing) {
    return (
      <div className="flex h-full items-center gap-3 font-raleway text-2xl text-white/60 text-shadow">
        <FontAwesomeIcon icon={faPhone} />
        <span className="truncate">{idleText}</span>
      </div>
    );
  }

  const known = caller.known && caller.name;

  return (
    <div className="flex h-full items-center gap-4 font-raleway text-white text-shadow">
      {known && caller.photoUrl ? (
        <img
          src={caller.photoUrl}
          alt={caller.name ?? ''}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <FontAwesomeIcon icon={faPhone} className="shrink-0 text-4xl" />
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-3xl font-semibold">
          {known ? caller.name : 'Phone is ringing'}
        </span>
        {known && <span className="text-xl opacity-70">calling…</span>}
      </div>
    </div>
  );
}
