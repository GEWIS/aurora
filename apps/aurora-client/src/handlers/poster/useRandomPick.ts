import { useState } from 'react';

export default function useRandomPick(source: string | string[]): string | undefined {
  const options = Array.isArray(source) ? source : [source];
  const [pick] = useState(() => options[Math.floor(Math.random() * options.length)]);
  return options.includes(pick) ? pick : options[0];
}
