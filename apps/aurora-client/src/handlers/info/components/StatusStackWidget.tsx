import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ChildWidget, TrackChangeEvent } from '@gewis/aurora-api-client';
import { sNum, sStr, WidgetSettings } from '../settings';
import { CallerEvent } from './CallerOverlay';
import EmitWrapper from './EmitWrapper';

interface Props {
  items: ChildWidget[];
  caller: CallerEvent | null;
  track: TrackChangeEvent | null;
  settings?: WidgetSettings;
  renderChild: (child: ChildWidget) => ReactNode;
}

/**
 * Which child widget types act as event-driven backgrounds, and on which event.
 * The trigger is derived from the widget type (no per-child config).
 */
const WIDGET_TRIGGERS: Record<string, 'call' | 'song'> = {
  'caller-inline': 'call',
  caller: 'call',
  spotify: 'song',
};

const triggerFor = (id: string): 'call' | 'song' | undefined => WIDGET_TRIGGERS[id];

/**
 * Shows a "primary" child (the first child whose type has no trigger), but a
 * background child briefly takes over when its event fires — an incoming call
 * (a `caller` child) or a song change (a `spotify` child). Duration and the emit
 * attention effect are global container settings (not per child).
 */
export default function StatusStackWidget({ items, caller, track, settings, renderChild }: Props) {
  const duration = sNum(settings, 'duration', 10);
  const emit = sStr(settings, 'emit', 'flash');

  const primary = items.find((c) => !triggerFor(c.id)) ?? items[0];

  const [override, setOverride] = useState<{ child: ChildWidget; nonce: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevRinging = useRef(false);
  const prevTrack = useRef<string | null>(null);

  const activate = useCallback(
    (child: ChildWidget) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setOverride({ child, nonce: Date.now() });
      timerRef.current = setTimeout(() => setOverride(null), duration * 1000);
    },
    [duration],
  );

  const backgroundFor = useCallback(
    (t: 'call' | 'song') => items.find((c) => triggerFor(c.id) === t),
    [items],
  );

  // Incoming-call trigger.
  useEffect(() => {
    const ringing = !!caller?.ringing;
    if (ringing && !prevRinging.current) {
      const child = backgroundFor('call');
      if (child) activate(child);
    }
    prevRinging.current = ringing;
  }, [caller, backgroundFor, activate]);

  // Song-change trigger.
  useEffect(() => {
    const id = track?.trackURI ?? track?.title ?? null;
    if (id && prevTrack.current !== null && id !== prevTrack.current) {
      const child = backgroundFor('song');
      if (child) activate(child);
    }
    prevTrack.current = id;
  }, [track, backgroundFor, activate]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center font-raleway text-2xl text-white/50">
        Empty status stack
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {override ? (
        <EmitWrapper key={override.nonce} emit={emit}>
          {renderChild(override.child)}
        </EmitWrapper>
      ) : primary ? (
        renderChild(primary)
      ) : (
        <div className="flex h-full items-center justify-center font-raleway text-xl text-white/50">
          No primary widget
        </div>
      )}
    </div>
  );
}
