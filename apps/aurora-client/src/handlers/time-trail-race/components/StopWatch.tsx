import { useState } from 'react';

interface Props {
  startTime: Date | undefined;
}

export default function StopWatch({ startTime }: Props) {
  const [timeString, setTimeString] = useState('0:00.000');

  const updateTimeString = () => {
    if (startTime === undefined) return;

    const totalMsDifference = new Date().getTime() - startTime.getTime();
    const diffMinutes = Math.floor(totalMsDifference / 60000);
    const diffSeconds = Math.floor((totalMsDifference - diffMinutes * 60000) / 1000);
    const diffMs = totalMsDifference % 1000;

    const val = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}.${diffMs.toString().padStart(3, '0')}`;
    setTimeString(val);
  };

  useState(() => {
    const timer = setInterval(updateTimeString, 20);
    return () => {
      clearInterval(timer);
    };
  });

  if (startTime === undefined) return null;

  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ fontSize: '16rem', fontFamily: 'Consolas,monaco,monospace' }}
    >
      <h2>{timeString}</h2>
    </div>
  );
}
