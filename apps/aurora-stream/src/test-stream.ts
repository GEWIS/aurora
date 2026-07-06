/**
 * Manual pipeline test: resolve a hardcoded YouTube URL with yt-dlp and publish
 * it to the local MediaMTX via ffmpeg. Temporarily hooked into index.ts so it
 * runs on container start; open http://localhost:8889/test_video to watch.
 */
import { execFileSync, spawn } from 'node:child_process';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=fLWY-Sxb1bE';
const PUBLISH_URL = 'rtsp://localhost:8554/test_video';

export function startTestStream(): void {
  console.log(`resolving ${YOUTUBE_URL}`);
  const output = execFileSync(
    'yt-dlp',
    ['--no-playlist', '-f', 'bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]', '-g', YOUTUBE_URL],
    { encoding: 'utf8' },
  );
  const [videoUrl, audioUrl] = output.trim().split('\n');
  if (!videoUrl || !audioUrl) throw new Error('expected a video and an audio URL from yt-dlp');

  console.log(`publishing to ${PUBLISH_URL}`);
  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-re',
      '-i', videoUrl,
      '-i', audioUrl,
      '-map', '0:v',
      '-map', '1:a',
      '-c:v', 'libx264', '-preset', 'fast', '-bf', '0', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
      '-c:a', 'libopus', '-b:a', '128k', '-ar', '48000',
      '-f', 'rtsp', PUBLISH_URL,
    ],
    { stdio: 'inherit' },
  );
  ffmpeg.on('exit', (code) => {
    console.error(`test-stream ffmpeg exited with code ${code}`);
  });
}
