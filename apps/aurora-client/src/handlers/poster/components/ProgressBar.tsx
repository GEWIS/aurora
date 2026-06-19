import ProgressBarSlider from './ProgressBarSlider';
import Clock from './Clock';

interface Props {
  title?: string;
  seconds?: number;
  posterIndex?: number;
  minimal?: boolean;
  hide?: boolean;
  borrelMode?: boolean;
  nextPoster?: () => void;
  pausePoster?: () => void;
  logo?: string;
  progressBarColor?: string;
  clockColor?: string;
  clockTick?: boolean;
}

export default function ProgressBar({
  title,
  seconds,
  posterIndex,
  minimal = false,
  hide = false,
  borrelMode = false,
  nextPoster = undefined,
  pausePoster = undefined,
  logo = undefined,
  clockColor = undefined,
  clockTick = undefined,
  progressBarColor = '#c40000',
}: Props) {
  return (
    <div className="absolute w-full bottom-0 z-50">
      <div
        className="relative text-white flex flex-col text-5xl h-20 progress-bar-height"
        id="progress-bar"
        style={{ backgroundColor: !minimal && !hide ? 'rgba(0, 0, 0, 0.5)' : '' }}
      >
        <div
          className="absolute w-full h-1.5 -mt-1"
          style={{ bottom: minimal || hide ? 0 : '' }}
          id="progress-bar-slider-outer"
        >
          {seconds !== undefined && posterIndex !== undefined && (
            <ProgressBarSlider seconds={seconds} posterIndex={posterIndex} color={progressBarColor} />
          )}
        </div>
        <div
          className={`flex-grow flex justify-center items-center h-full px-6 ${hide ? 'hidden' : ''}`}
          id="progress-bar-container"
        >
          <div className="relative py-3 h-full w-1/5" id="progress-bar-logos">
            <div className="h-full flex flex-row gap-6 items-center">
              {logo && (
                <>
                  <svg
                    className="h-12"
                    style={{ filter: 'drop-shadow(3px 5px 2px rgb(0 0 0 /0.4))' }}
                    viewBox="0 0 50 100"
                  >
                    <image x="0" y="0" height="100%" width="100%" xlinkHref={logo} />
                  </svg>
                  {borrelMode && (
                    <svg
                      className="h-10"
                      style={{
                        filter: 'brightness(0) invert(1) drop-shadow(3px 5px 2px rgb(0 0 0 /0.4))',
                      }}
                      viewBox="0 0 100 100"
                      id="progress-bar-logo-borrelmode"
                    >
                      <image x="0" y="0" height="100%" width="100%" xlinkHref={'/borrel/sudosos.svg'} />
                    </svg>
                  )}
                </>
              )}
            </div>
          </div>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
          <div
            className="flex-grow text-center text-shadow whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ minHeight: '1em' }}
            onClick={pausePoster}
            id="progress-bar-title"
          >
            {!minimal && title}
          </div>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
          <div className="text-right" onClick={nextPoster} id="progress-bar-clock">
            <Clock color={clockColor} shouldTick={clockTick} />
          </div>
        </div>
      </div>
    </div>
  );
}
