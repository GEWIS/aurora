import { EventEmitter } from 'events';
import { Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import StainedGlass from './components/backgrounds/StainedGlass';
import BeatLogo from './components/BeatLogo';

interface Props {
  socket: Socket;
}

export default function StageEffectsView({ socket }: Props) {
  const [eventEmitter] = useState(new EventEmitter());

  useEffect(() => {
    const handleBeat = () => {
      eventEmitter.emit('beat');
    };

    socket.on('beat', handleBeat);

    return () => {
      socket.removeListener('beat', handleBeat);
    };
  }, [eventEmitter, socket]);

  return (
    <>
      <div className="h-screen w-screen">
        <StainedGlass />
        <BeatLogo eventEmitter={eventEmitter} logo="borrel/bac.svg" />
      </div>
    </>
  );
}
