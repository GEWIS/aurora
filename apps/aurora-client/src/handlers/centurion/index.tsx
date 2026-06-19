import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { clsx } from 'clsx';
import {
  getCenturionState,
  CenturionStateResponse,
  RgbColor,
  TrackChangeEvent,
  LightsColorResponse,
  getAllLightsColors,
  HexColor,
} from '../../api';
import Background from './components/Background';
import styles from './centurion.module.css';
import Strobe from './components/Strobe';
import Information from './components/Information';

interface Props {
  socket: Socket;
}

type MixTape = CenturionStateResponse['tape'];

type HornEvent = {
  strobeTime: number;
  counter: number;
};

export interface CurrentColors {
  start: HexColor;
  end: HexColor;
}

const defaultColors: CurrentColors = {
  start: '#ecc9f6',
  end: '#f18900',
};

enum Status {
  'STOPPED' = 'Stopped',
  'READY' = 'Get ready!',
  'PLAYING' = 'Playing',
}

export default function CenturionView({ socket }: Props) {
  const [colorDefinitions, setColorDefinitions] = useState<LightsColorResponse[]>([]);
  const [artist, setArtists] = useState<string | null>(null);
  const [song, setSong] = useState<string | null>(null);

  const [mixtape, setMixtape] = useState<MixTape | null>(null);
  const [status, setStatus] = useState<Status>(Status.STOPPED);

  const [hornCount, setHornCount] = useState<number | undefined>();
  const [strobe, setStrobe] = useState<boolean>(false);
  const [rgbColors, setRgbColors] = useState<{ start: RgbColor; end: RgbColor }>({
    start: RgbColor.LIGHTPINK,
    end: RgbColor.ORANGE,
  });
  const [colors, _setColors] = useState<CurrentColors>(defaultColors);

  const getHexFromDefinition = useCallback(
    (color: RgbColor): HexColor | undefined => {
      const match = colorDefinitions.find((c) => c.color === color);
      return match?.spec.hex;
    },
    [colorDefinitions],
  );

  useEffect(() => {
    const startHex = getHexFromDefinition(rgbColors.start);
    const endHex = getHexFromDefinition(rgbColors.end);
    _setColors({ start: startHex ?? defaultColors.start, end: endHex ?? defaultColors.end });
  }, [colorDefinitions, getHexFromDefinition, rgbColors]);

  const init = async () => {
    const resColors = await getAllLightsColors();
    if (resColors.response.ok && resColors.data) {
      setColorDefinitions(resColors.data);
    }

    // TODO what to do if centurion state cannot be fetched?
    const resState = await getCenturionState();
    if (!resState || !resState.data) return;
    if (resState.data.tape) {
      setMixtape(resState.data.tape);
      setStatus(Status.READY);
    }
    if (resState.data.lastHorn) setHornCount(resState.data.lastHorn.data.counter);
    if (resState.data.lastSong && Array.isArray(resState.data.lastSong.data)) {
      setSong(resState.data.lastSong.data[0].title);
      setArtists(resState.data.lastSong.data[0].artist);
    }
    if (resState.data.lastSong && !Array.isArray(resState.data.lastSong.data)) {
      setSong(resState.data.lastSong.data.title);
      setArtists(resState.data.lastSong.data.artist);
    }
    if (resState.data.colors) {
      setRgbColors({
        start: resState.data.colors[0],
        end: resState.data.colors[1],
      });
    }
    if (resState.data.playing) setStatus(Status.PLAYING);

    socket.on('loaded', (mixTapes: MixTape[]) => {
      const mixTape = mixTapes[0];

      setMixtape(mixTape ?? null);
      setStatus(Status.READY);
      setHornCount(undefined);
    });

    socket.on('start', () => {
      if (hornCount === undefined) setHornCount(-1);
      setStatus(Status.PLAYING);
    });

    socket.on('stop', () => {
      setStatus(Status.STOPPED);
    });

    socket.on('change_track', (event: TrackChangeEvent[][]) => {
      const track = event[0][0];
      setArtists(track.artists.join(', '));
      setSong(track.title);
      setStatus(Status.PLAYING);
    });

    socket.on('horn', (hornEvent: HornEvent[]) => {
      const { strobeTime, counter } = hornEvent[0];
      setStrobe(true);
      setTimeout(() => {
        setStrobe(false);
      }, strobeTime);

      setStatus(Status.PLAYING);
      setHornCount(counter);
    });

    socket.on('change_colors', (newColorsEvent: RgbColor[][]) => {
      const colors = newColorsEvent[0];
      setRgbColors({
        start: colors[0],
        end: colors[1],
      });
    });
  };

  useEffect(() => {
    init().catch((e) => {
      console.error(e);
    });

    return () => {
      socket.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const getRandomInt = () => {
    if (hornCount === undefined) return 0;
    return Math.floor(Math.random() * 2 * hornCount) - hornCount;
  };

  const makeTextDrunk = (note?: string) => {
    if (!note) return null;
    return note.split(' ').map((word, i) => {
      return (
        <div key={`${word}-${i}`} className="flex flex-nowrap justify-center me-6">
          {[...word].map((letter, j) => {
            // Range [-#shots, #shots]
            const randomInt = getRandomInt();
            return (
              <div
                key={`${letter}-${j}`}
                className={clsx(styles.drunk, 'z-20')}
                style={{
                  ['--random-rotation' as string]: `${randomInt / 3}deg`,
                  ['--random-time' as string]: `${hornCount === 0 || hornCount === undefined ? '500s' : `${(1 / hornCount) * 500}s`}`,
                  display: 'inline-block',
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </div>
            );
          })}
        </div>
      );
    });
  };

  const renderHornCount = () => {
    if (hornCount === undefined) return null;
    return <div className="text-white text-[36rem] -m-20">{makeTextDrunk(hornCount.toString())}</div>;
  };

  const renderBackground = () => {
    if (hornCount !== undefined && mixtape)
      return <Background colors={colors} progression={!hornCount ? 0 : hornCount} />;

    return (
      <div className="h-screen w-full top-0 left-0 absolute -z-20 bg-black overflow-hidden">
        <div
          className="h-full w-full bg-center bg-cover bg-no-repeat -z-30"
          style={{
            filter: 'blur(0)',
            backgroundImage: 'url("/centurion/scooter.jpeg")',
          }}
        ></div>
      </div>
    );
  };

  return (
    <>
      {mixtape && status !== Status.PLAYING && (
        <Information title={mixtape.name} artist={mixtape.artist} albumCover={mixtape.coverUrl} description={status} />
      )}

      {status === Status.PLAYING && (
        <div className="h-screen flex items-center justify-center overflow-hidden">
          <div className={clsx('w-fit flex flex-col justify-center text-center', styles.text)}>
            {hornCount !== undefined && hornCount >= 0 && renderHornCount()}
            <div className="flex flex-wrap justify-center text-white text-7xl font-bold mb-10 px-12">
              {makeTextDrunk(artist?.toUpperCase())}
            </div>
            <div className="flex flex-wrap justify-center text-white text-7xl px-12">
              {makeTextDrunk(song?.toUpperCase())}
            </div>
          </div>
        </div>
      )}

      {strobe && <Strobe hornCount={hornCount ?? 0} />}

      {renderBackground()}
    </>
  );
}
