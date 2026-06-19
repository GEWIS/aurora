import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import { Order } from '../api';
import GlassCard from './GlassCard';

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  const animationInitial: TargetAndTransition = {
    scale: 0,
  };
  const animationIn: TargetAndTransition = {
    scale: 1,
    transition: { delay: 0.5, type: 'spring' },
  };
  const animationOut: TargetAndTransition = {
    opacity: 0,
    transition: { delay: 0.5 },
  };

  return (
    // bg-blue-500
    <div className="absolute top-0 right-0 z-50 m-4 text-white h-10/12 text-6xl">
      <div>
        <AnimatePresence>
          {orders.length > 0 && (
            <motion.div initial={animationInitial} animate={animationIn} exit={animationOut}>
              <GlassCard className="top-0 right-0 mb-5 px-4 py-7 text-center">Ready</GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        <ul
          className="grid grid-flow-col-dense gap-5"
          style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}
          dir="rtl"
        >
          <AnimatePresence>
            {orders.map((order) => (
              <motion.li key={order.number} initial={animationInitial} animate={animationIn} exit={animationOut} layout>
                <GlassCard className="text-center px-4 py-7 min-w-36">{order.number}</GlassCard>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
