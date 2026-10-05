/**
 * Small but valid media files for poster tests. Poster request files are decoded (images) or
 * checked structurally (videos), so signatures alone are not enough.
 */

// 2x2 PNG, generated with sharp.
export const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAE0lEQVQImWM4wsBwhAGMjzAwAAAYjgMR+NJc+QAAAABJRU5ErkJggg==',
  'base64',
);

// 2x2 JPG, generated with sharp.
export const JPG_BUFFER = Buffer.from(
  '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABgf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCSADC5P//Z',
  'base64',
);

/**
 * Build an MP4 box with the given type and payload.
 * @param type Four character box type.
 * @param payload Box contents.
 */
export function mp4Box(type: string, payload: Buffer = Buffer.alloc(0)): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'latin1');
  return Buffer.concat([header, payload]);
}

// "ftyp" payload: major brand, minor version and compatible brands.
export const MP4_FTYP = mp4Box('ftyp', Buffer.from('mp42\0\0\0\0mp42isom', 'latin1'));

// Minimal structurally complete MP4: file type, movie metadata and media data.
export const MP4_BUFFER = Buffer.concat([MP4_FTYP, mp4Box('moov'), mp4Box('mdat')]);
