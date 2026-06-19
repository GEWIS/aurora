import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import BlurredImage from '../stage-effects/components/backgrounds/BlurredImage';
import { getSpotifyCurrentlyPlaying, TrackChangeEvent } from '../../api';

interface Props {
  socket: Socket;
}

export default function SpotifyView({ socket }: Props) {
  const [albumCover, setAlbumCover] = useState<string | undefined>();
  const [artist, setArtists] = useState<string | undefined>();
  const [song, setSong] = useState<string | undefined>();

  const handleTrackChange = (trackChangeEvent: TrackChangeEvent[]) => {
    setArtists(trackChangeEvent[0].artists.join(', '));
    setSong(trackChangeEvent[0].title);
    setAlbumCover(trackChangeEvent[0].cover);
  };

  useEffect(() => {
    // TODO what to display when no data is fetched?
    getSpotifyCurrentlyPlaying()
      .then((res) => handleTrackChange(res.data!))
      .catch((e) => console.error(e));

    socket.on('change_track', (event: unknown[]) => {
      const trackChangeEvents = event[0] as TrackChangeEvent[];
      handleTrackChange(trackChangeEvents);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  return (
    <div className="relative">
      {albumCover !== undefined && <BlurredImage cover={albumCover} />}
      <div className="h-screen flex items-center justify-center relative">
        <img alt="albumCover" className="h-1/2 mr-6" src={albumCover} />
        <div className="w-fit max-w-4xl flex flex-col justify-center font-raleway">
          <p
            className="text-white text-6xl p-4 font-semibold font-raleway"
            style={{ filter: 'drop-shadow(0 0 5px rgb(0 0 0 /0.4))' }}
          >
            {song}
          </p>
          <p
            className="text-white text-5xl italic p-4 font-bold shadow-gray-200 drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 0 5px rgb(0 0 0 /0.4))' }}
          >
            {artist}
          </p>
        </div>
      </div>
    </div>
  );
}
