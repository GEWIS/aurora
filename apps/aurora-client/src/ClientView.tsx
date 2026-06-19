import { useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import OrdersOverlay from './overlays/OrdersOverlay';
import HandlerSwitcher from './HandlerSwitcher';
import { AuthContext } from './contexts/AuthContext';
import registerScreenHandler from './events/screenHandler';
import { LoadingView, ReloadCountdown } from './handlers/default';

export default function ClientView() {
  const [screenSocket, setScreenSocket] = useState<Socket | null>(null);

  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    registerScreenHandler(setScreenSocket);
  }, [user]);

  if (loading) {
    return (
      <LoadingView>
        <h1 className="text-8xl">Initializing the screen...</h1>
      </LoadingView>
    );
  }

  if (!user) {
    return (
      <LoadingView>
        <h1 className="text-8xl">Unauthenticated</h1>
        <ReloadCountdown />
      </LoadingView>
    );
  }

  if (!screenSocket) {
    return (
      <LoadingView>
        <h1 className="text-8xl">Connecting to websocket...</h1>
      </LoadingView>
    );
  }
  return (
    <>
      <OrdersOverlay socket={screenSocket} />
      <HandlerSwitcher socket={screenSocket} />
    </>
  );
}
