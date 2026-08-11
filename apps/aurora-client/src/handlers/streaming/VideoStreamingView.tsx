import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  getVideostreamHandlerState,
  VideostreamHandlerState,
  VideostreamPhase,
} from '@gewis/aurora-api-client';
import { LogoStream } from '../../components/aurora-logos/LogoStream';
import BackgroundStarryNight from '../../components/backgrounds/StarryNight';

interface Props {
  socket: Socket;
}

const RETRY_INTERVAL_MS = 250;

/** Roughly ten seconds of retries, which is far longer than a respawn ever takes */
const MAX_CONNECT_ATTEMPTS = 40;

export default function VideoStreamingView({ socket }: Props) {
  const [state, setState] = useState<VideostreamHandlerState | null>(null);
  const [hasFrame, setHasFrame] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const phase = state?.phase;
  const whepUrl = state?.whepUrl;
  const startEpoch = state?.startEpoch;

  useEffect(() => {
    getVideostreamHandlerState()
      .then((res) => res.data && setState(res.data))
      .catch((e) => console.error(e));

    socket.on('update_video_stream', (event: unknown[]) => {
      setState(event[0] as VideostreamHandlerState);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  /**
   * Hold a WHEP session for exactly as long as the handler says it is playing. Play, seek
   * and resume all respawn the encoder, which drops every reader, so a change of startEpoch
   * has to reconnect just like a change of phase does.
   */
  useEffect(() => {
    if (phase !== VideostreamPhase.PLAYING || !whepUrl) return;

    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let pc: RTCPeerConnection | null = null;
    let sessionUrl: string | null = null;

    const teardown = () => {
      if (sessionUrl) {
        void fetch(sessionUrl, { method: 'DELETE' }).catch(() => {});
        sessionUrl = null;
      }
      pc?.close();
      pc = null;
    };

    const connect = async (attempt: number) => {
      teardown();
      if (cancelled) return;

      const peer = new RTCPeerConnection({ iceServers: [] });
      pc = peer;
      peer.addTransceiver('video', { direction: 'recvonly' });
      peer.addTransceiver('audio', { direction: 'recvonly' });
      peer.ontrack = (e) => {
        if (videoRef.current) videoRef.current.srcObject = e.streams[0];
      };
      peer.onconnectionstatechange = () => {
        if (cancelled || pc !== peer) return;
        if (peer.connectionState !== 'failed' && peer.connectionState !== 'disconnected') return;

        setHasFrame(false);
        retry = setTimeout(() => void connect(0), RETRY_INTERVAL_MS);
      };

      await peer.setLocalDescription(await peer.createOffer());
      await new Promise<void>((resolve) => {
        if (peer.iceGatheringState === 'complete') {
          resolve();
          return;
        }
        peer.addEventListener('icegatheringstatechange', () => {
          if (peer.iceGatheringState === 'complete') resolve();
        });
      });
      if (cancelled || pc !== peer) return;

      const res = await fetch(whepUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/sdp' },
        body: peer.localDescription?.sdp,
      }).catch(() => null);
      if (cancelled || pc !== peer) return;

      if (!res?.ok) {
        if (attempt < MAX_CONNECT_ATTEMPTS) {
          retry = setTimeout(() => void connect(attempt + 1), RETRY_INTERVAL_MS);
        }
        return;
      }

      sessionUrl = new URL(res.headers.get('location') ?? '', whepUrl).href;
      await peer.setRemoteDescription({ type: 'answer', sdp: await res.text() });
    };

    connect(0).catch((e) => console.error(e));

    return () => {
      cancelled = true;
      clearTimeout(retry);
      teardown();
      setHasFrame(false);
    };
  }, [phase, whepUrl, startEpoch]);

  const status = () => {
    switch (phase) {
      case VideostreamPhase.READY:
        return 'Ready to play';
      case VideostreamPhase.PLAYING:
        return 'Starting stream…';
      case VideostreamPhase.PAUSED:
        return 'Paused';
      case VideostreamPhase.ERROR:
        return state?.error ?? 'Playback failed';
      default:
        return 'Nothing playing';
    }
  };

  const statusTheme = (() => {
    switch (phase) {
      case VideostreamPhase.READY:
        return {
          background: '#1d4ed8',
          status: '#bfdbfe',
        };

      case VideostreamPhase.PLAYING:
        return {
          background: '#c2410c',
          status: '#ffedd5',
        };

      case VideostreamPhase.PAUSED:
        return {
          background: '#6d28d9',
          status: '#ede9fe',
        };

      case VideostreamPhase.ERROR:
        return {
          background: '#b91c1c',
          status: '#fee2e2',
        };

      default:
        return {
          background: '#374151',
          status: '#e5e7eb',
        };
    }
  })();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onLoadedData={() => setHasFrame(true)}
        className="h-full w-full object-contain"
      />

      {(phase !== VideostreamPhase.PLAYING || !hasFrame) && (
        <div className="absolute inset-0">
          <BackgroundStarryNight backgroundColor={statusTheme.background}>
            <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
              <div className="flex w-full max-w-5xl flex-col items-center gap-5">
                <LogoStream size="2rem" />

                {state?.title && (
                  <h1 className="w-full max-w-4xl text-5xl font-semibold leading-tight text-neutral-100 sm:text-4xl">
                    {state.title}
                  </h1>
                )}

                <div className="mt-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-300/70">
                    Status
                  </span>

                  <p
                    className="text-xl font-medium italic sm:text-2xl"
                    style={{ color: statusTheme.status }}
                  >
                    {status()}
                  </p>
                </div>
              </div>
            </div>
          </BackgroundStarryNight>
        </div>
      )}
    </div>
  );
}
