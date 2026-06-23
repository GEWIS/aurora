# Aurora Stream

This is the **media streaming service** of the Aurora suite — it turns a source (a YouTube URL, a backoffice screen share, …) into a live stream and fans it out over WebRTC (WHEP) to the narrowcasting screens and RTSP to the audio players. It bundles a [MediaMTX](https://github.com/bluenviron/mediamtx) media plane with a thin resolver sidecar driven by `yt-dlp` and `ffmpeg`. The core orchestrates playback over HTTP; this service is the only component that handles media bytes.
See the root [README](../../README.md) for the full architecture overview and list of all Aurora repositories.

## Prerequisites

- NodeJS 22.
- `ffmpeg`, `yt-dlp`, and `mediamtx` on the `PATH` for local (non-container) runs. In Docker these are provided by the image.

## Development setup

1. Run `pnpm install` from the monorepo root.
1. Run `pnpm dev`.

The resolver sidecar is consumed by the core (`STREAM_URL`); MediaMTX serves the WebRTC (WHEP/WHIP) and RTSP endpoints that the screens and audio players connect to.
