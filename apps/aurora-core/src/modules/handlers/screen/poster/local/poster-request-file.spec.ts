import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  MAX_IMAGE_PIXELS,
  reencodeImage,
  toSafeFileName,
  validateMp4,
  validatePosterRequestFile,
} from './poster-request-file';

/**
 * Create an image of the given size and format.
 */
function createImage(format: 'png' | 'jpeg', width = 4, height = 4): Promise<Buffer> {
  const image = sharp({ create: { width, height, channels: 3, background: '#c40000' } });
  return format === 'png' ? image.png().toBuffer() : image.jpeg().toBuffer();
}

/**
 * Build an MP4 box with the given type and payload.
 */
function box(type: string, payload: Buffer = Buffer.alloc(0)): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'latin1');
  return Buffer.concat([header, payload]);
}

const ftyp = (brand = 'mp42') => box('ftyp', Buffer.from(`${brand}\0\0\0\0mp42isom`, 'latin1'));

describe('toSafeFileName', () => {
  it.each([
    [
      'keeps a normal name with the detected extension',
      'open-podium.png',
      'png',
      'open-podium.png',
    ],
    ['replaces the extension given by the requester', 'poster.html', 'png', 'poster.png'],
    ['replaces a double extension', 'poster.png.html', 'jpg', 'poster.png.jpg'],
    ['drops unix directories', '../../etc/passwd', 'png', 'passwd.png'],
    ['drops windows directories', 'C:\\Users\\me\\poster.jpg', 'jpg', 'poster.jpg'],
    ['replaces unusual characters', '<b onload=alert(1)>.png', 'png', '_b onload_alert_1__.png'],
    ['does not start with a dot', '.htaccess', 'png', 'poster.png'],
    ['falls back for an empty name', '', 'mp4', 'poster.mp4'],
  ])('%s', (_, originalName, extension, expected) => {
    expect(toSafeFileName(originalName, extension)).toBe(expected);
  });

  it('limits the length of the name', () => {
    // ACT
    const name = toSafeFileName(`${'a'.repeat(300)}.png`, 'png');

    // ASSERT
    expect(name).toBe(`${'a'.repeat(100)}.png`);
  });
});

describe('reencodeImage', () => {
  it.each(['png', 'jpeg'] as const)('returns a decodable %s of the same size', async (format) => {
    // ARRANGE
    const input = await createImage(format, 6, 3);

    // ACT
    const output = await reencodeImage(input, format);

    // ASSERT
    const metadata = await sharp(output).metadata();
    expect(metadata).toMatchObject({ format, width: 6, height: 3 });
  });

  it('removes metadata such as EXIF', async () => {
    // ARRANGE
    const input = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } })
      .jpeg()
      .withExif({ IFD0: { Copyright: 'Secret location' } })
      .toBuffer();
    expect((await sharp(input).metadata()).exif).toBeDefined();

    // ACT
    const output = await reencodeImage(input, 'jpeg');

    // ASSERT
    expect((await sharp(output).metadata()).exif).toBeUndefined();
    expect(output.includes('Secret location')).toBe(false);
  });

  it('drops content appended after the image', async () => {
    // ARRANGE
    const input = Buffer.concat([
      await createImage('png'),
      Buffer.from('<script>alert(1)</script>'),
    ]);

    // ACT
    const output = await reencodeImage(input, 'png');

    // ASSERT
    expect(output.includes('<script>')).toBe(false);
  });

  it('applies the orientation before dropping the metadata', async () => {
    // ARRANGE: a 6x3 image that is marked as rotated by 90 degrees
    const input = await sharp({ create: { width: 6, height: 3, channels: 3, background: '#000' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    // ACT
    const output = await reencodeImage(input, 'jpeg');

    // ASSERT
    expect(await sharp(output).metadata()).toMatchObject({ width: 3, height: 6 });
  });

  it('rejects a damaged image with 415', async () => {
    // ARRANGE
    const png = await createImage('png', 64, 64);

    // ACT & ASSERT
    await expect(reencodeImage(png.subarray(0, png.length / 2), 'png')).rejects.toMatchObject({
      status: 415,
    });
  });

  it('rejects an image whose contents do not match the detected type with 415', async () => {
    // ACT & ASSERT
    await expect(reencodeImage(await createImage('png'), 'jpeg')).rejects.toMatchObject({
      status: 415,
    });
  });

  it('rejects an image with more pixels than allowed with 413', async () => {
    // ARRANGE: a small file that decompresses into just over the pixel limit
    const width = 8000;
    const input = await sharp({
      create: {
        width,
        height: Math.floor(MAX_IMAGE_PIXELS / width) + 1,
        channels: 3,
        background: '#000',
      },
    })
      .png({ compressionLevel: 1 })
      .toBuffer();

    // ACT & ASSERT
    await expect(reencodeImage(input, 'png')).rejects.toMatchObject({ status: 413 });
  });
});

describe('validateMp4', () => {
  it('accepts a structurally complete MP4', () => {
    expect(() => validateMp4(Buffer.concat([ftyp(), box('moov'), box('mdat')]))).not.toThrow();
  });

  it('accepts a last box that extends to the end of the file', () => {
    // ARRANGE: size 0 means "until the end of the file"
    const mdat = box('mdat', Buffer.from('video data'));
    mdat.writeUInt32BE(0, 0);

    // ACT & ASSERT
    expect(() => validateMp4(Buffer.concat([ftyp(), box('moov'), mdat]))).not.toThrow();
  });

  it('accepts a box with a 64-bit size', () => {
    // ARRANGE
    const large = Buffer.alloc(16);
    large.writeUInt32BE(1, 0);
    large.write('mdat', 4, 'latin1');
    large.writeBigUInt64BE(16n, 8);

    // ACT & ASSERT
    expect(() => validateMp4(Buffer.concat([ftyp(), box('moov'), large]))).not.toThrow();
  });

  it.each([
    ['without movie metadata', () => Buffer.concat([ftyp(), box('mdat')])],
    ['without media data', () => Buffer.concat([ftyp(), box('moov')])],
    ['with an unsupported brand', () => Buffer.concat([ftyp('qt  '), box('moov'), box('mdat')])],
    ['not starting with ftyp', () => Buffer.concat([box('moov'), ftyp(), box('mdat')])],
    [
      'with a box larger than the file',
      () => {
        const mdat = box('mdat', Buffer.from('data'));
        mdat.writeUInt32BE(1000, 0);
        return Buffer.concat([ftyp(), box('moov'), mdat]);
      },
    ],
    [
      'with a box smaller than its header',
      () => {
        const moov = box('moov');
        moov.writeUInt32BE(4, 0);
        return Buffer.concat([ftyp(), moov, box('mdat')]);
      },
    ],
    ['with a non-text box type', () => Buffer.concat([ftyp(), box('\0\0\0\0'), box('mdat')])],
    [
      'with trailing bytes',
      () => Buffer.concat([ftyp(), box('moov'), box('mdat'), Buffer.alloc(3)]),
    ],
  ])('rejects an MP4 %s with 415', (_, build) => {
    expect(() => validateMp4(build())).toThrow(expect.objectContaining({ status: 415 }));
  });
});

describe('validatePosterRequestFile', () => {
  it('returns the re-encoded image with a safe name', async () => {
    // ACT
    const result = await validatePosterRequestFile('poster.html', await createImage('png'));

    // ASSERT
    expect(result).toMatchObject({ type: 'img', name: 'poster.png', mimeType: 'image/png' });
  });

  it('returns a valid video unchanged', async () => {
    // ARRANGE
    const video = Buffer.concat([ftyp(), box('moov'), box('mdat')]);

    // ACT
    const result = await validatePosterRequestFile('clip.mov', video);

    // ASSERT
    expect(result).toMatchObject({ type: 'video', name: 'clip.mp4', data: video });
  });

  it('rejects other file types with 415', async () => {
    // ARRANGE
    const gif = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#000' } })
      .gif()
      .toBuffer();

    // ACT & ASSERT
    await expect(validatePosterRequestFile('poster.gif', gif)).rejects.toMatchObject({
      status: 415,
    });
  });
});
