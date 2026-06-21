import '../../poster/components/ScrollAnimation.scss';
import { bacShadow } from '../../../style/shadows';

interface Props {
  name: string;
  bac?: boolean;
  /**
   * Delay in ms
   */
  delay?: number;
  /**
   * Time in ms
   */
  time?: number;
}

export default function NextPlayer({ name, bac, delay, time }: Props) {
  if (!name) return null;

  return (
    <div
      className="absolute overflow-hidden w-fit text-5xl"
      style={{
        animation: `${time ?? 10000}ms horizontal-marquee ${delay ?? 0}ms linear infinite`,
        ...(bac === true ? bacShadow : {}),
      }}
    >
      Next up: {name}
    </div>
  );
}
