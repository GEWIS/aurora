import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ChildWidget } from '@gewis/aurora-api-client';
import { sNum, sStr, WidgetSettings } from '../settings';

interface Props {
  items: ChildWidget[];
  settings?: WidgetSettings;
  renderChild: (child: ChildWidget) => ReactNode;
}

const VARIANTS: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-h': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'slide-v': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
};

/**
 * Cycles through an ordered list of child widgets, one at a time, with a
 * configurable interval and transition (fade / horizontal slide / vertical
 * slide). Each child is rendered by the shared widget renderer.
 */
export default function CarouselWidget({ items, settings, renderChild }: Props) {
  const interval = sNum(settings, 'interval', 8);
  const animation = sStr(settings, 'animation', 'fade');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % items.length), interval * 1000);
    return () => clearTimeout(timer);
  }, [index, items.length, interval]);

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center font-raleway text-2xl text-white/50">
        Empty carousel
      </div>
    );
  }

  const current = items[index % items.length];
  const variants = VARIANTS[animation] ?? VARIANTS.fade;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.instanceId}
          className="absolute inset-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          {renderChild(current)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
