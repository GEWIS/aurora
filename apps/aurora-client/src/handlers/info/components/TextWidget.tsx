import { sStr, WidgetSettings } from '../settings';

interface Props {
  settings?: WidgetSettings;
}

const SIZE: Record<string, string> = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
};

const ALIGN: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** A plain configurable text widget. */
export default function TextWidget({ settings }: Props) {
  const content = sStr(settings, 'content', '');
  const size = sStr(settings, 'size', 'lg');
  const align = sStr(settings, 'align', 'center');

  return (
    <div className="flex h-full w-full items-center font-raleway text-white text-shadow">
      <span
        className={`w-full whitespace-pre-wrap break-words font-semibold ${SIZE[size] ?? SIZE.lg} ${ALIGN[align] ?? ALIGN.center}`}
      >
        {content}
      </span>
    </div>
  );
}
