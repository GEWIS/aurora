# Aurora Stream

This is the **media streaming service** of the Aurora suite — it turns a source (a YouTube URL, a backoffice screen share, …) into a live stream and fans it out over WebRTC (WHEP) to the narrowcasting screens and RTSP to the audio players. It bundles a [MediaMTX](https://github.com/bluenviron/mediamtx) media plane with a thin resolver sidecar driven by `yt-dlp` and `ffmpeg`. The core orchestrates playback over HTTP; this service is the only component that handles media bytes.
See the root [README](../../README.md) for the full architecture overview and list of all Aurora repositories.

Design rationale lives in [`docs/streaming-system-design.md`](../../docs/streaming-system-design.md); the shapes and why each one is what it is in [`docs/streaming-sidecar-skeleton.md`](../../docs/streaming-sidecar-skeleton.md).

## Prerequisites

- NodeJS 22.
- `ffmpeg`, `yt-dlp`, and `mediamtx` on the `PATH` for local (non-container) runs. In Docker these are provided by the image.

## Development setup

1. Run `pnpm install` from the monorepo root.
1. Copy `.env.example` to `.env`.
1. Run `pnpm dev` (from this directory for a standalone run, or from the root for the full stack).

The sidecar spawns MediaMTX as a child process, so one command gives you both.

## Architecture in one screen

Two HTTP listeners and one media server:

| listener          | bind                                   | who calls it                  | routes                                    |
| ----------------- | -------------------------------------- | ----------------------------- | ----------------------------------------- |
| control (`:9000`) | `0.0.0.0`                              | core only                     | `/yt/*`, `/screenshare/session`, `/state` |
| auth (`:9001`)    | `127.0.0.1`                            | MediaMTX                      | `/auth`, `/not-ready`                     |
| MediaMTX          | `:8889` HTTP, `:8554` TCP, `:8189` UDP | screens, audio PC, publishers | WHEP / WHIP / RTSP                        |

The control listener requires `Authorization: Bearer $STREAM_TOKEN`. The auth listener has **no**
credential — its `127.0.0.1` bind is the security, so it must not be loosened.

There are exactly two MediaMTX paths, both fixed strings: `yt` (published by our own ffmpeg over
loopback) and `screenshare` (published by a browser over WHIP). Clients hold permanently valid
URLs; what stops a screen reading a stream it shouldn't is the `/auth` hook, which permits reads
only on paths core has made active.

### Control API

```
POST /yt/resolve  {url}              → {title, duration, features}   yt-dlp probe; slow
POST /yt/play     {ref, position}    → 204                           (re)spawns ffmpeg at -ss position
POST /yt/stop                        → 204                           kills ffmpeg, drops the path

POST   /screenshare/session          → 201 {whipUrl, publishToken}   401 if one is already held
DELETE /screenshare/session          → 204                           clears AND kicks the publisher

GET  /state                          → {active, publisher, urls}
```

## Environment

| variable                     | purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `STREAM_TOKEN`               | shared secret core must present on the control listener         |
| `CONTROL_PORT` / `AUTH_PORT` | listener ports (`9000` / `9001`)                                |
| `WEBRTC_PUBLIC`              | browser-reachable MediaMTX base, used to build WHEP/WHIP URLs   |
| `RTSP_PUBLIC`                | audio-PC-reachable RTSP base                                    |
| `RTSP_INTERNAL`              | where our ffmpeg publishes (loopback)                           |
| `MTX_WEBRTCADDITIONALHOSTS`  | the address MediaMTX advertises as an ICE candidate — see below |
| `LOG_LEVEL`                  | pino level                                                      |

Any MediaMTX setting can be overridden the same way as that last one: `MTX_` + the config key in
uppercase. The spawned process inherits this process's environment.

## Troubleshooting

**A publish is accepted but nothing ever plays, and MediaMTX logs `deadline exceeded while waiting
connection` ~10s later.** The browser will show ICE connected, DTLS stuck at `connecting`, and zero
bytes sent. This is the advertised-ICE-candidate problem: MediaMTX must advertise **exactly one**
address, and it must be one the peer can reach.

```yaml
webrtcIPsFromInterfaces: false
webrtcAdditionalHosts: [127.0.0.1] # override per environment with MTX_WEBRTCADDITIONALHOSTS
```

Every WebRTC session shares one UDP port (`webrtcLocalUDPAddress: :8189`), so gathering every
interface offers several routes to the same socket; the browser nominates one pair while pion
settles on another, and the DTLS handshake lands on a tuple the mux isn't routing. This was seen
with Firefox publishing over WHIP; reads on the same broken config happened to work, so a working
read proves nothing about publishing. `[127.0.0.1]` fixes it locally even though Firefox gathers
no loopback candidate itself. If loopback somehow doesn't work for your browser, set
`MTX_WEBRTCADDITIONALHOSTS` to your LAN IP. In Docker
this must be the **host's** address for the published `8189/udp` port, never the container's own;
in k3s it is the media `LoadBalancer`'s external address, which is _not_ the same value as
`WEBRTC_PUBLIC` (that one is the signaling hostname on Traefik). See §11 of the design doc.

**A screenshare session is stuck at 401.** A session that was opened but never published to (the
`getDisplayMedia` prompt was dismissed) leaves the path active with nothing to clear it — MediaMTX
never went ready, so `runOnNotReady` never fires. `DELETE /screenshare/session` releases it.

**Screens sit black for several seconds after joining.** A WHEP client renders nothing until it
receives a keyframe; the encode chain pins `-g 60` (~2s) for this reason. Invisible if you always
connect the screen before starting playback.
