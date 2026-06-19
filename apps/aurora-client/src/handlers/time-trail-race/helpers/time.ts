export function toStopwatchString(totalMsDifference: number, minutes = true): string {
  const diffMinutes = Math.floor(totalMsDifference / 60000);
  const diffSeconds = Math.floor((totalMsDifference - diffMinutes * 60000) / 1000);
  const diffMs = totalMsDifference % 1000;

  if (minutes) {
    return `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}.${diffMs.toString().padStart(3, '0')}`;
  }
  return `${(diffSeconds + diffMinutes * 60).toString().padStart(2, '0')}.${diffMs.toString().padStart(3, '0')}`;
}
