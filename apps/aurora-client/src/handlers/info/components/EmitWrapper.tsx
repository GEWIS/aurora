import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  emit: string;
  children: ReactNode;
}

/**
 * Wraps a status-stack background child with a configurable "emit" attention
 * effect that plays when it appears: a flash/pulse, a shake, a glowing border,
 * or an outward-radiating border.
 */
export default function EmitWrapper({ emit, children }: Props) {
  const base = 'relative h-full w-full';

  if (emit === 'shake') {
    return (
      <motion.div
        className={base}
        animate={{ x: [0, -8, 8, -8, 8, 0] }}
        transition={{ duration: 0.6, repeat: 1 }}
      >
        {children}
      </motion.div>
    );
  }

  if (emit === 'flash') {
    return (
      <motion.div
        className={base}
        animate={{ opacity: [1, 0.35, 1, 0.35, 1], scale: [1, 1.04, 1, 1.02, 1] }}
        transition={{ duration: 1.4 }}
      >
        {children}
      </motion.div>
    );
  }

  if (emit === 'glow') {
    return (
      <motion.div
        className={`${base} rounded-md`}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(96,165,250,0)',
            '0 0 22px 6px rgba(96,165,250,0.85)',
            '0 0 0 0 rgba(96,165,250,0)',
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {children}
      </motion.div>
    );
  }

  if (emit === 'radiate') {
    return (
      <div className={base}>
        {children}
        {[0, 0.6].map((delay) => (
          <motion.div
            key={delay}
            className="pointer-events-none absolute inset-0 rounded-md border-2 border-blue-400"
            animate={{ scale: [1, 1.25], opacity: [0.85, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
}
