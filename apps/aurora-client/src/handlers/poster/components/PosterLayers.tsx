import { CSSProperties, PropsWithChildren } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function PosterStack({ children, className = '' }: PropsWithChildren<Props>) {
  return <div className={`grid isolate w-full h-full ${className}`}>{children}</div>;
}

export function PosterLayer({ children, className = '', style }: PropsWithChildren<Props>) {
  return (
    <div className={`col-start-1 row-start-1 w-full h-full ${className}`} style={style}>
      {children}
    </div>
  );
}
