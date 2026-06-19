import { EventEmitter } from 'events';
import { useCallback, useEffect, useRef, useState } from 'react';
import './BeatLogo.scss';

interface Props {
  eventEmitter: EventEmitter;
  logo: string;
}

export default function BeatLogo({ eventEmitter, logo }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);
  // ReturnType used instead of number as one of the dependencies uses @types/node as dependency
  const [removeAnimation, setRemoveAnimation] = useState<ReturnType<typeof setTimeout> | null>(null);

  const cleanupBeat = () => {
    if (!ref.current) return;

    ref.current.style.animation = '';
    setRemoveAnimation(null);
  };

  const handleBeat = useCallback(() => {
    if (!ref.current) return;

    ref.current.style.animationName = 'beatPulse';
    ref.current.style.animationDuration = '0.15s';
    ref.current.style.animationIterationCount = '1';
    const timeout = setTimeout(cleanupBeat, 150);
    setRemoveAnimation(timeout);
  }, []);

  useEffect(() => {
    eventEmitter.on('beat', handleBeat);

    return () => {
      eventEmitter.removeListener('beat', handleBeat);
      if (removeAnimation) clearTimeout(removeAnimation);
    };
  }, [eventEmitter, handleBeat, removeAnimation]);

  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center overflow-hidden">
      <div className="w-1/3 h-full">
        <svg
          ref={ref}
          width="100%"
          height="100%"
          style={{
            filter: 'drop-shadow(3px 5px 2px rgb(0 0 0 /0.4)',
          }}
        >
          <image x="0" y="0" width="100%" height="100%" xlinkHref={`/public/${logo}`} />
        </svg>
      </div>
    </div>
  );
}
