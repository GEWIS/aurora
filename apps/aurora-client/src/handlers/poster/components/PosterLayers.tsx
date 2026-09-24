import { CSSProperties, PropsWithChildren } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function PosterStack({ children, className = '' }: PropsWithChildren<Props>) {
  return (
    <div className={`grid grid-cols-1 grid-rows-1 isolate w-full h-full ${className}`}>
      {children}
    </div>
  );
}

export function PosterLayer({ children, className = '', style }: PropsWithChildren<Props>) {
  return (
    <div
      className={`relative col-start-1 row-start-1 w-full h-full min-w-0 min-h-0 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
