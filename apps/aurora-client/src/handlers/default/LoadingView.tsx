import { PropsWithChildren } from 'react';

export default function LoadingView({ children }: PropsWithChildren) {
  return (
    <div style={{ fontSize: '32px' }} className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
      {children}
    </div>
  );
}
