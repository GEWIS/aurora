import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

/**
 * Payload pushed by the handler on the `info_caller` event. Not part of the
 * generated api-client (it is a socket event, not an HTTP response).
 */
export interface CallerEvent {
  ringing: boolean;
  known: boolean;
  name: string | null;
  photoUrl: string | null;
}

interface Props {
  /** The latest caller event; a new ringing event re-triggers the overlay. */
  event: CallerEvent | null;
}

/** How long the overlay stays up after a ring, mirroring the legacy 20s. */
const SHOW_MS = 20 * 1000;

/**
 * Full-screen incoming-call overlay. On a ringing event it shows the caller's
 * photo + "<name> calling" for a known caller, or a shaking phone + "Phone is
 * ringing" for an unknown one, then auto-dismisses after ~20s.
 */
export default function CallerOverlay({ event }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event || !event.ringing) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [event]);

  const known = event?.known && event.name;

  return (
    <AnimatePresence>
      {visible && event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 font-raleway text-white"
        >
          {known && event.photoUrl ? (
            <img
              src={event.photoUrl}
              alt={event.name ?? 'caller'}
              className="mb-8 h-[24rem] w-[24rem] rounded-2xl object-cover"
            />
          ) : (
            <motion.div
              className="mb-8 text-[14rem] leading-none"
              animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              <FontAwesomeIcon icon={faPhone} />
            </motion.div>
          )}
          <div className="text-6xl font-bold">
            {known ? `${event.name} calling` : 'Phone is ringing'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
