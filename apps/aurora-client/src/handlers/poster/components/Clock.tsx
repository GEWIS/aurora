import { useEffect, useState } from 'react';

interface Props {
  color?: string;
  shouldTick?: boolean;
}

export default function Clock({ color = undefined, shouldTick = undefined }: Props) {
  const [hours, setHours] = useState<number | undefined>();
  const [minutes, setMinutes] = useState<number | undefined>();
  const [tick, setTick] = useState(true);

  const setTime = () => {
    const now = new Date();
    setHours(now.getHours());
    setMinutes(now.getMinutes());

    setTick((t) => !t);
  };

  useEffect(() => {
    setTime();
    const interval = setInterval(setTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="inline-flex flex-row flex-nowrap w-auto text-shadow"
      style={{ fontFamily: '"Lato", monospace', color }}
    >
      <div>{hours?.toString().padStart(2, '0') ?? '--'}</div>
      <div className="text-center" style={{ width: '0.25em' }}>
        {tick || !shouldTick ? ':' : ''}
      </div>
      <div>{minutes?.toString().padStart(2, '0') ?? '--'}</div>
    </div>
  );
}
