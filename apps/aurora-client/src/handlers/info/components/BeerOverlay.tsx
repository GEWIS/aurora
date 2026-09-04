import { AnimatePresence, motion } from 'framer-motion';
import { formatMmSs } from '../countdown';
import useSecondTick from '../useSecondTick';
import { nextBeerTime } from './RoomStatusWidget';
import DigitalTime from './DigitalTime';

interface Props {
  beerTime: string | null;
}

const SHOW_BEFORE_MS = 3 * 60 * 1000;
const SHOW_AFTER_MS = 60 * 1000;

/**
 * Full-screen beer-time easter egg: appears 3 minutes before the configured
 * beer time, celebrates at the exact moment, and hides ~1 minute after.
 */
export default function BeerOverlay({ beerTime }: Props) {
  const now = useSecondTick();

  if (!beerTime) return null;
  const target = nextBeerTime(beerTime, now);
  if (!target) return null;

  const diff = target.getTime() - now.getTime();
  const visible = diff <= SHOW_BEFORE_MS && diff >= -SHOW_AFTER_MS;
  const isNow = diff <= 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 font-raleway text-white"
        >
          <motion.img
            src="/base/beer-full.svg"
            alt="beer"
            animate={{ scale: isNow ? [1, 1.15, 1] : 1 }}
            transition={{ repeat: isNow ? Infinity : 0, duration: 1 }}
            className="mb-8 h-[26rem] w-auto"
          />
          {isNow ? (
            <div className="text-8xl font-bold">BEER TIME</div>
          ) : (
            <DigitalTime className="text-7xl" value={formatMmSs(diff)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
