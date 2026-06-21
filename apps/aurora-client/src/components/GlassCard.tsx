import { PropsWithChildren, HTMLAttributes } from 'react';

interface Props extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {}

export default function GlassCard({ children, className, ...props }: Props) {
  return (
    <div
      className={`bg-gray-800/50 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
