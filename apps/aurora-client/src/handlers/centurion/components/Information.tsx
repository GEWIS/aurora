import { clsx } from 'clsx';
import styles from '../centurion.module.css';
import { LogoLine } from '../../../components/aurora-logos/LogoLine';

interface Props {
  albumCover: string;
  artist: string;
  title: string;
  description: string;
}

export default function Information(props: Props) {
  const { albumCover, artist, title, description } = props;

  return (
    <div className="h-screen flex flex-col items-center justify-center text-white">
      <div
        className="w-full h-32 p-8"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 1), rgba(0,0,0,0.7) 70%, rgb(0, 0, 0, 0) 100%)' }}
      >
        <div className="w-full flex justify-center h-full opacity-90">
          <LogoLine variant="left" size="2rem" />
        </div>
      </div>
      <div className="flex-grow"></div>
      <div
        className={clsx('w-full h-96 flex items-center justify-center drop-shadow-xl', styles.displayText)}
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0,0,0,0.7) 70%, rgb(0, 0, 0, 0) 100%)',
        }}
      >
        <img alt="albumCover" className="h-3/4 mr-6" src={albumCover} />
        <div className="w-fit max-w-4xl flex flex-col justify-center">
          <p className="text-7xl p-4 font-bold">
            {artist} - {title}
          </p>
          <p className="text-7xl p-4 font-semibold">{description.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
