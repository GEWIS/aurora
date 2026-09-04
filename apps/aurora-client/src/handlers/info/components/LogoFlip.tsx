import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sBool, WidgetSettings } from '../settings';

interface Props {
  settings?: WidgetSettings;
}

/**
 * GEWIS helmet logo that (optionally) flips around every 3 minutes, just like
 * the legacy screen's flip.js animation.
 */
export default function LogoFlip({ settings }: Props) {
  const flip = sBool(settings, 'flip', true);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!flip) return undefined;
    const interval = setInterval(() => {
      setFlipped(true);
      setTimeout(() => setFlipped(false), 5000);
    }, 180000);
    return () => clearInterval(interval);
  }, [flip]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.img
        src="/base/gewis-white.svg"
        alt="GEWIS"
        className="max-h-full w-auto max-w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 360 : 0 }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
