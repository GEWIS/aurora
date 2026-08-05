/**
 * Holds the config and parameters for the ffmpeg instance.
 */

// prettier-ignore
const GLOBAL_ARGS: readonly string[] = [
  '-hide_banner',
  '-nostdin',
  '-loglevel', 'warning',
];

// prettier-ignore
const WEBRTC_OUTPUT_ARGS: readonly string[] = [
  // video
  '-c:v', 'libx264',
  '-preset', 'veryfast', // might be fine as fast as well
  '-tune', 'zerolatency',
  '-bf', '0',
  '-profile:v', 'baseline',
  '-pix_fmt', 'yuv420p',
  '-g', '25',
  '-keyint_min', '25',
  '-sc_threshold', '0',
  '-maxrate', '3M',
  '-bufsize', '3M',
  // audio
  '-c:a', 'libopus', // webrtc does not support AAC
  '-b:a', '128k',
  '-ar', '48000',
  '-ac', '2',
];

// prettier-ignore
const RTSP_ARGS: readonly string[] = [
  '-rtsp_transport', 'tcp',
  '-f', 'rtsp',
];

export function buildFfmpegArgs(inputArgs: string[], publishUrl: string): string[] {
  return [...GLOBAL_ARGS, ...inputArgs, ...WEBRTC_OUTPUT_ARGS, ...RTSP_ARGS, publishUrl];
}
