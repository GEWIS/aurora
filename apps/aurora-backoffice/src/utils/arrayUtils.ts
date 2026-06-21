/**
 * Given an array, split it into chunks of the given size.
 * The last chunk can be smaller if the array is not divisible
 * by the given size.
 * @param array
 * @param chunkSize
 */
export function splitArrayIntoChunks<T>(array: T[], chunkSize: number) {
  const chunks: T[][] = [];
  let currentChunk: T[] = [];

  array.forEach((v) => {
    currentChunk.push(v);
    if (currentChunk.length < chunkSize) return;

    chunks.push(currentChunk);
    currentChunk = [];
  });

  if (currentChunk.length !== 0) chunks.push(currentChunk);

  return chunks;
}
