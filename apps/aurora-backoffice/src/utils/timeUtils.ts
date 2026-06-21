export function getIsoTime(): string {
  return new Date().toISOString();
}

export function convetIsoTime(time: Date): string {
  return time.toISOString();
}

export function toStopwatchString(totalMsDifference: number): string {
  const diffMinutes = Math.floor(totalMsDifference / 60000);
  const diffSeconds = Math.floor((totalMsDifference - diffMinutes * 60000) / 1000);
  const diffMs = totalMsDifference % 1000;

  return `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}:${diffMs.toString().padStart(3, '0')}`;
}
