import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBan,
  faBroom,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faMugHot,
  faQuestion,
  faScrewdriverWrench,
  faTriangleExclamation,
  faTruck,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

interface Props {
  status: number;
}

/**
 * Coffee/tea machine status, using the legacy 11-state code (0 = "It works" ..
 * 10 = "Unknown"). Each state maps to a status icon + label. A fixed coffee icon
 * is always shown alongside so it is clear the widget is the coffee machine.
 */
export const COFFEE_STATES: { icon: IconDefinition; label: string }[] = [
  { icon: faCircleCheck, label: 'It works' }, // 0
  { icon: faMugHot, label: 'Coffee, no tea' }, // 1
  { icon: faMugHot, label: 'Tea, no coffee' }, // 2
  { icon: faTriangleExclamation, label: 'It partially works' }, // 3
  { icon: faCircleXmark, label: 'It does not work' }, // 4
  { icon: faBroom, label: 'Cleaning' }, // 5
  { icon: faClock, label: 'Daily clean needed' }, // 6
  { icon: faTruck, label: 'Technician has been called' }, // 7
  { icon: faScrewdriverWrench, label: 'Technician is fixing the machine' }, // 8
  { icon: faBan, label: 'Out of order' }, // 9
  { icon: faQuestion, label: 'Unknown' }, // 10
];

export function coffeeState(status: number): { icon: IconDefinition; label: string } {
  return COFFEE_STATES[status] ?? COFFEE_STATES[10];
}

export default function CoffeeWidget({ status }: Props) {
  const { icon, label } = coffeeState(status);

  return (
    <div className="flex h-full items-center gap-3 font-raleway text-white text-shadow">
      {/* Fixed coffee icon so it is clear this is the coffee machine. */}
      <FontAwesomeIcon icon={faMugHot} className="shrink-0 text-5xl text-amber-200" />
      {/* Additional icon indicating the current status. */}
      <FontAwesomeIcon icon={icon} className="shrink-0 text-3xl" />
      <span className="min-w-0 truncate text-3xl font-semibold">{label}</span>
    </div>
  );
}
