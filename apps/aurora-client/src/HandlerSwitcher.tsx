import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import registerRootHandler from './events/rootHandler';
import './index.css';

import { default as CenturionView } from './handlers/centurion';
import { default as SpotifyView } from './handlers/spotify';
import { default as DefaultView } from './handlers/default';
import StageEffectsView from './handlers/stage-effects';
import TimeTrailRaceView from './handlers/time-trail-race';
import RoomResponsibleLegacyView from './handlers/room-responsible-legacy';
import StaticPosterView from './handlers/poster/StaticPosterView';
import CarouselPosterView from './handlers/poster/CarouselPosterView';

export enum Handlers {
  SPOTIFY = 'CurrentlyPlayingTrackHandler',
  CENTURION = 'CenturionScreenHandler',
  CAROUSEL_POSTER = 'CarouselPosterHandler',
  STATIC_POSTER = 'StaticPosterHandler',
  STAGE_EFFECTS = 'StageEffectsHandler',
  TIME_TRAIL_RACE = 'TimeTrailRaceScreenHandler',
  ROOM_RESPONSIBLE_LEGACY = 'RoomResponsibleLegacyHandler',
}

interface Props {
  socket: Socket;
}

export default function HandlerSwitcher({ socket }: Props) {
  const [currentHandler, setCurrentHandler] = useState<Handlers | null>(null);

  useEffect(() => {
    registerRootHandler(setCurrentHandler);
  }, []);

  switch (currentHandler) {
    case Handlers.CENTURION:
      return <CenturionView socket={socket} />;
    case Handlers.SPOTIFY:
      return <SpotifyView socket={socket} />;
    case Handlers.CAROUSEL_POSTER:
      return <CarouselPosterView socket={socket} />;
    case Handlers.STATIC_POSTER:
      return <StaticPosterView socket={socket} />;
    case Handlers.STAGE_EFFECTS:
      return <StageEffectsView socket={socket} />;
    case Handlers.TIME_TRAIL_RACE:
      return <TimeTrailRaceView socket={socket} />;
    case Handlers.ROOM_RESPONSIBLE_LEGACY:
      return <RoomResponsibleLegacyView />;
    default:
      return <DefaultView />;
  }
}
