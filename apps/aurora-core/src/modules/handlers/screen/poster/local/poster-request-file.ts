import path from 'path';
import { fromBuffer } from 'file-type';
import sharp from 'sharp';
import { HttpStatusCode } from 'axios';
import { HttpApiException } from '../../../../../helpers/custom-error';
import { PosterType } from './poster';

/**
 * File types that can be attached to a poster request, with the resulting poster type and the
 * extension the file is stored with.
 */
const POSTER_REQUEST_FILE_TYPES: Record<
  string,
  { type: PosterType.IMAGE | PosterType.VIDEO; extension: string }
> = {
  'image/jpeg': { type: PosterType.IMAGE, extension: 'jpg' },
  'image/png': { type: PosterType.IMAGE, extension: 'png' },
  'video/mp4': { type: PosterType.VIDEO, extension: 'mp4' },
};

const MAX_FILE_NAME_LENGTH = 100;
const DEFAULT_FILE_NAME = 'poster';

/**
 * Maximum number of pixels of a requested image (40 megapixels), which also protects against
 * small files that decompress into huge images.
 */
export const MAX_IMAGE_PIXELS = 40_000_000;

/**
 * Major brands of MP4 files that are accepted, as found in the "ftyp" box.
 */
const MP4_BRANDS = ['isom', 'iso2', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'M4V '];

const unsupportedFile = (message: string) =>
  new HttpApiException(HttpStatusCode.UnsupportedMediaType, message);

/**
 * A file that has been checked and can be stored for a poster request.
 */
export interface ValidatedPosterRequestFile {
  type: PosterType.IMAGE | PosterType.VIDEO;
  /**
   * Safe file name, with the extension of the detected file type.
   */
  name: string;
  data: Buffer;
  mimeType: string;
}

/**
 * Determine the mime type of the given file from its contents.
 * @param data
 */
export async function getMimeType(data: Buffer): Promise<string | undefined> {
  return (await fromBuffer(data))?.mime;
}

/**
 * Build a safe file name from the name given by the requester. Only the base name is kept,
 * without its extension, unusual characters are replaced and the length is limited. The
 * extension always follows from the detected file type, as the stored file is later served
 * based on its extension.
 * @param originalName
 * @param extension
 */
export function toSafeFileName(originalName: string, extension: string): string {
  const base = path
    .basename(originalName.replace(/\\/g, '/'))
    .replace(/\.[^.]*$/, '')
    .replace(/[^A-Za-z0-9 ._-]/g, '_')
    .replace(/^[.\s]+/, '')
    .trim()
    .slice(0, MAX_FILE_NAME_LENGTH);
  return `${base || DEFAULT_FILE_NAME}.${extension}`;
}

/**
 * Decode the given JPG or PNG completely and encode it again in the same format. This rejects
 * damaged or disguised files, drops everything that is not image data (such as EXIF metadata
 * with a location, or content appended after the image) and limits the number of pixels.
 * @param data
 * @param format The format detected from the file contents.
 */
export async function reencodeImage(data: Buffer, format: 'jpeg' | 'png'): Promise<Buffer> {
  try {
    const image = sharp(data, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'warning' });
    const metadata = await image.metadata();
    if (metadata.format !== format) {
      throw unsupportedFile('The image contents do not match its file type.');
    }
    // Apply the orientation from the metadata first, as all metadata is dropped afterwards
    const oriented = image.autoOrient();
    return format === 'png'
      ? await oriented.png().toBuffer()
      : await oriented.jpeg({ quality: 90 }).toBuffer();
  } catch (error) {
    if (error instanceof HttpApiException) throw error;
    if (error instanceof Error && error.message.includes('pixel limit')) {
      throw new HttpApiException(
        HttpStatusCode.PayloadTooLarge,
        `The image is too large, the maximum is ${MAX_IMAGE_PIXELS / 1_000_000} megapixels.`,
      );
    }
    throw unsupportedFile('The image could not be read, it may be damaged.');
  }
}

/**
 * Check that the given file is a structurally valid MP4: it consists of well-formed boxes only,
 * starts with an "ftyp" box with a known brand, and contains the movie metadata and media data.
 * @param data
 */
export function validateMp4(data: Buffer): void {
  const types: string[] = [];
  let offset = 0;
  while (offset < data.length) {
    if (offset + 8 > data.length) throw unsupportedFile('The video file is truncated.');
    let size = data.readUInt32BE(offset);
    const type = data.toString('latin1', offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      // A 64-bit size follows the type
      if (offset + 16 > data.length) throw unsupportedFile('The video file is truncated.');
      size = Number(data.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      // The last box extends to the end of the file
      size = data.length - offset;
    }
    if (!/^[\x20-\x7e]{4}$/.test(type) || size < headerSize || offset + size > data.length) {
      throw unsupportedFile('The video file is not a valid MP4 file.');
    }
    types.push(type);
    offset += size;
  }

  const brand = data.toString('latin1', 8, 12);
  if (types[0] !== 'ftyp' || !MP4_BRANDS.includes(brand)) {
    throw unsupportedFile('The video file is not a supported MP4 file.');
  }
  if (!types.includes('moov') || !types.includes('mdat')) {
    throw unsupportedFile('The video file is incomplete, it has no movie data.');
  }
}

/**
 * Check an uploaded poster request file, rejecting anything that is not a JPG, PNG or MP4.
 * Images are encoded again (see reencodeImage) and videos are checked structurally (see
 * validateMp4). The file size is already limited by the upload handler.
 * @param originalName File name given by the requester.
 * @param data File contents.
 */
export async function validatePosterRequestFile(
  originalName: string,
  data: Buffer,
): Promise<ValidatedPosterRequestFile> {
  const mimeType = await getMimeType(data);
  const fileType = mimeType ? POSTER_REQUEST_FILE_TYPES[mimeType] : undefined;
  if (!mimeType || !fileType) {
    throw new HttpApiException(
      HttpStatusCode.UnsupportedMediaType,
      'Invalid file type, expected a JPG, PNG or MP4 file.',
    );
  }

  let safeData: Buffer;
  if (fileType.type === PosterType.IMAGE) {
    safeData = await reencodeImage(data, mimeType === 'image/png' ? 'png' : 'jpeg');
  } else {
    validateMp4(data);
    safeData = data;
  }

  return {
    type: fileType.type,
    name: toSafeFileName(originalName, fileType.extension),
    data: safeData,
    mimeType,
  };
}
