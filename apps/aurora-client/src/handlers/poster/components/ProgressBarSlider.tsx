import { useEffect, useState } from 'react';

interface Props {
  seconds: number;
  posterIndex: number;
  color: string;
}

export default function ProgressBarSlider({ seconds, posterIndex, color }: Props) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    setHiding(true);

    // ReturnType used instead of number as one of the dependencies uses @types/node as dependency
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

    const startAnimation = () => {
      setHiding(false);
      clearTimeout(timeout);
    };

    timeout = setTimeout(startAnimation, 500);
    return () => clearTimeout(timeout);
  }, [seconds, posterIndex]);

  return (
    <div
      className={`h-full w-full rounded ${hiding ? 'transition-opacity opacity-0' : 'transition-transform opacity-100'}`}
      id="progress-bar-slider-inner"
      style={{
        backgroundColor: color,
        transform: hiding ? 'translateX(-100%)' : 'translateX(0)',
        transitionDuration: hiding ? '500ms' : `${Math.max(0.75, seconds) * 1000 - 750}ms`,
        transitionTimingFunction: 'cubic-bezier(.2,0,.8,1)',
      }}
    />
  );
}
